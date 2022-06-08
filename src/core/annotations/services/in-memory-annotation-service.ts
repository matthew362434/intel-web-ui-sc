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

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Label } from '../../labels';
import { MediaItem, MEDIA_TYPE, Video } from '../../media';
import { DatasetIdentifier } from '../../projects';
import { AnnotationResultDTO } from '../dtos';
import { LabeledVideoRange } from '../labeled-video-range.interface';
import { ShapeType } from '../shapetype.enum';
import { labelFromUser } from '../utils';
import { Annotation } from './../';
import AnnotationService from './annotation-service.interface';

const createInMemoryAnnotationService = (): AnnotationService => {
    const getAnnotations = async (
        datasetIdentifier: DatasetIdentifier,
        labels: Label[],
        mediaItem: MediaItem
    ): Promise<Annotation[]> => {
        const annotations: Annotation[] = [
            {
                id: 'rect-1',
                labels: [labelFromUser(labels[0])],
                shape: { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 300, height: 300 },
                zIndex: 0,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'rect-2',
                labels: [labelFromUser(labels[1])],
                shape: { shapeType: ShapeType.Rect as const, x: 410, y: 410, width: 300, height: 300 },
                zIndex: 1,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'circle-1',
                labels: [labelFromUser(labels[2])],
                shape: { shapeType: ShapeType.Circle as const, x: 500, y: 100, r: 100 },
                zIndex: 2,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'polygon-1',
                labels: [labelFromUser(labels[3])],
                shape: {
                    shapeType: ShapeType.Polygon as const,
                    points: [
                        { x: 50, y: 300 },
                        { x: 150, y: 450 },
                        { x: 250, y: 340 },
                    ],
                },
                zIndex: 3,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
        ];

        return [...annotations];
    };

    const getVideoAnnotationsTimeline = async (datasetIdentifier: DatasetIdentifier, mediaItem: Video) => {
        return {};
    };

    const saveAnnotations = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: MediaItem,
        annotations: ReadonlyArray<Annotation>
    ): Promise<AnnotationResultDTO> => {
        return {
            annotations: [],
            id: 12312321,
            kind: 'annotation',
            media_identifier: {
                image_id: '60b609fbd036ba4566726c96',
                type: MEDIA_TYPE.IMAGE,
            },
            modified: '2021-06-03T13:09:18.096000+00:00',
            labels_to_revisit_full_scene: [],
            annotation_state_per_task: [],
        };
    };

    const getLabeledVideoRanges = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        projectLabels: Label[]
    ): Promise<LabeledVideoRange[]> => {
        return [];
    };
    const saveLabeledVideoRanges = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        ranges: LabeledVideoRange[]
    ): Promise<void> => {
        return;
    };

    return {
        getAnnotations,
        getVideoAnnotationsTimeline,
        saveAnnotations,
        getLabeledVideoRanges,
        saveLabeledVideoRanges,
    };
};

export default createInMemoryAnnotationService;
