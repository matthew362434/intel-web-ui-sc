// INTEL CONFIDENTIAL
//
// Copyright (C) 2021 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import axios from 'axios';
import arrayRange from 'lodash/range';
import { v4 as uuidv4 } from 'uuid';

import { Label, LABEL_SOURCE } from '../../labels';
import { MediaItem, MEDIA_TYPE, Video, VideoFrame } from '../../media';
import { mediaIdentifierToDTO } from '../../media/services/utils';
import { DatasetIdentifier } from '../../projects';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { AnnotationLabel } from '../annotation.interface';
import { AnnotationResultDTO, VideoAnnotationsDTO } from '../dtos';
import { LabeledVideoRange } from '../labeled-video-range.interface';
import { Shape } from '../shapes.interface';
import { ShapeType } from '../shapetype.enum';
import { labelFromUser } from '../utils';
import { Annotation } from './../';
import AnnotationService from './annotation-service.interface';
import { getAnnotatedVideoLabels, getAnnotation, toAnnotationDTO } from './utils';

const createApiAnnotationService = (): AnnotationService => {
    const getAnnotations = async (
        datasetIdentifier: DatasetIdentifier,
        projectLabels: Label[],
        mediaItem: MediaItem
    ): Promise<Annotation[]> => {
        try {
            const { data } = await AXIOS.get<AnnotationResultDTO>(
                API_URLS.ANNOTATIONS(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    mediaItem.identifier
                )
            );

            if (!data) {
                return [];
            }

            return data.annotations.map((annotation, index) => {
                return getAnnotation(mediaItem, annotation, projectLabels, index, LABEL_SOURCE.USER);
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return [];
            }

            throw error;
        }
    };

    const getVideoAnnotationsTimeline = async (datasetIdentifier: DatasetIdentifier, mediaItem: Video) => {
        const url = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            mediaItem.identifier
        );

        const { data } = await AXIOS.get<VideoAnnotationsDTO>(url);

        return getAnnotatedVideoLabels(data);
    };

    const saveAnnotations = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: MediaItem,
        annotations: Annotation[]
    ): Promise<AnnotationResultDTO> => {
        const annotationsDTO = annotations.map((annotation) => toAnnotationDTO(mediaItem, annotation));
        const data = {
            media_identifier: mediaIdentifierToDTO(mediaItem.identifier),
            annotations: annotationsDTO,
        };
        const annotationResult = await AXIOS.post(
            API_URLS.SAVE_ANNOTATIONS(
                datasetIdentifier.workspaceId,
                datasetIdentifier.projectId,
                datasetIdentifier.datasetId,
                mediaItem.identifier
            ),
            data
        );

        return annotationResult.data;
    };

    // NOTE: currently we use a "polyfill" for this feature. The backend does not fully
    // support adding labeled video ranges so we need to mimick this feature by getting
    // all annotations of a video and generating these ranges ourselves.
    const getLabeledVideoRanges = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        projectLabels: Label[]
    ): Promise<LabeledVideoRange[]> => {
        const annotations = await getVideoAnnotationsTimeline(datasetIdentifier, mediaItem);

        const annotatedFrameNumbers = Object.keys(annotations).map(Number);
        const frames = mediaItem.metadata.frames;
        const frameStride = mediaItem.metadata.frameStride;

        return annotatedFrameNumbers.reduce<LabeledVideoRange[]>((ranges, frameNumber) => {
            const labels = projectLabels.filter(({ id }) => annotations[frameNumber].has(id));
            const end = Math.min(frames, frameNumber + frameStride - 1);

            if (ranges.length === 0) {
                return [{ start: Number(frameNumber), end, labels }];
            }

            const previousRange = ranges[ranges.length - 1];

            if (frameNumber - previousRange.end <= frameStride) {
                if (
                    previousRange.labels.every(({ id }) => annotations[frameNumber].has(id)) &&
                    annotations[frameNumber].size === previousRange.labels.length
                ) {
                    previousRange.end += frameStride;
                    previousRange.end = Math.min(previousRange.end, frames);

                    return ranges;
                } else {
                    if (previousRange.end >= frameNumber) {
                        previousRange.end = frameNumber - 1;
                    }
                }
            }

            return [...ranges, { start: frameNumber, end, labels }];
        }, []);
    };

    const saveLabeledVideoRanges = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        ranges: LabeledVideoRange[]
    ): Promise<void> => {
        const frameStride = mediaItem.metadata.frameStride;

        const shape: Shape = {
            shapeType: ShapeType.Rect,
            x: 0,
            y: 0,
            width: mediaItem.metadata.width,
            height: mediaItem.metadata.height,
        };

        const previousAnnotations = await getVideoAnnotationsTimeline(datasetIdentifier, mediaItem);

        // Save an annotation for each frame inside of the given ranges
        const rangePromises = ranges.flatMap(({ start, end, labels }) => {
            const annotationLabels: AnnotationLabel[] = labels.map((label) => labelFromUser(label));

            // We don't want to save every frame (that would be expensive), so instead
            // we only save frames in steps of the given framestride
            return arrayRange(start, end, frameStride).map(async (frameNumber) => {
                const annotations: Annotation[] = [
                    {
                        id: uuidv4(),
                        shape,
                        zIndex: 0,
                        isHidden: false,
                        isHovered: false,
                        isLocked: false,
                        isSelected: false,
                        labels: annotationLabels,
                    },
                ];
                const videoFrame: VideoFrame = {
                    ...mediaItem,
                    identifier: {
                        ...mediaItem.identifier,
                        type: MEDIA_TYPE.VIDEO_FRAME,
                        frameNumber,
                    },
                };

                return await saveAnnotations(datasetIdentifier, videoFrame, annotations);
            });
        });

        // Overwrite the existing annotations if they are contained in a range with a different label
        const previousAnnotationsPromises = Object.keys(previousAnnotations).map(async (frame) => {
            const frameNumber = Number(frame);
            const labels = previousAnnotations[frameNumber];
            const range = ranges.find(({ start, end }) => start <= frameNumber && frameNumber <= end);

            if (range === undefined) {
                return;
            }

            const hasDifferentLabels =
                labels.size !== range.labels.length || range.labels.some(({ id }) => !labels.has(id));

            if (hasDifferentLabels) {
                const annotationLabels: AnnotationLabel[] = range.labels.map((label) => labelFromUser(label));
                const annotations: Annotation[] = [
                    {
                        id: uuidv4(),
                        shape,
                        zIndex: 0,
                        isHidden: false,
                        isHovered: false,
                        isLocked: false,
                        isSelected: false,
                        labels: annotationLabels,
                    },
                ];
                const videoFrame: VideoFrame = {
                    ...mediaItem,
                    identifier: {
                        ...mediaItem.identifier,
                        type: MEDIA_TYPE.VIDEO_FRAME,
                        frameNumber,
                    },
                };

                return await saveAnnotations(datasetIdentifier, videoFrame, annotations);
            }
        });

        await Promise.all([...rangePromises, ...previousAnnotationsPromises]);
    };

    return {
        getAnnotations,
        getVideoAnnotationsTimeline,
        saveAnnotations,
        getLabeledVideoRanges,
        saveLabeledVideoRanges,
    };
};

export default createApiAnnotationService;
