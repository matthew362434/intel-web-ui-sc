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

import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { useMutation, useQueryClient } from 'react-query';

import { Annotation, AnnotationService } from '../../../../../core/annotations';
import { PredictionResult } from '../../../../../core/annotations/services/prediction-service.interface';
import { VideoFrame } from '../../../../../core/media';
import QUERY_KEYS from '../../../../../core/requests/query-keys';
import { useInterval } from '../../../../../hooks/use-interval/use-interval.hook';
import { useProject } from '../../../../project-details/providers';
import { useAnnotator, useTask } from '../../../providers';
import { useDataset } from '../../../providers/dataset-provider/dataset-provider.component';
import { loadImage } from '../../../providers/selected-media-item-provider/use-load-image-query.hook';
import { useSelectVideoFrame } from './use-select-video-frame.hook';

const useLoadAndSelectVideoFrameMutation = (
    selectVideoFrame: (frameNumber: number, showConfirmation?: boolean) => void,
    annotationService: AnnotationService
) => {
    const { project } = useProject();
    const { datasetIdentifier } = useDataset();
    const { selectedTask } = useTask();

    const queryClient = useQueryClient();

    // Prefetch the videoFrame's image, annotations and predictions so that when we select
    // it the user does not see a loading indicator
    return useMutation({
        mutationFn: async (videoFrame: VideoFrame) => {
            const [image, annotations] = await Promise.all([
                loadImage(videoFrame),
                annotationService.getAnnotations(datasetIdentifier, project.labels, videoFrame),
            ]);

            queryClient.setQueryData<HTMLImageElement>(
                QUERY_KEYS.SELECTED_MEDIA_ITEM.IMAGE(videoFrame.identifier),
                () => image
            );
            queryClient.setQueryData<ReadonlyArray<Annotation> | undefined>(
                QUERY_KEYS.SELECTED_MEDIA_ITEM.ANNOTATIONS(videoFrame.identifier),
                () => annotations
            );

            // Set the predictions for the current task
            queryClient.setQueryData<PredictionResult>(
                QUERY_KEYS.SELECTED_MEDIA_ITEM.PREDICTIONS(videoFrame.identifier, selectedTask?.id),
                () => ({ annotations: [], maps: [] })
            );
        },
        onSuccess: (_, videoFrame: VideoFrame) => {
            selectVideoFrame(videoFrame.identifier.frameNumber, false);
        },
    });
};

const usePlayIndexFrameNumber = (videoFrames: VideoFrame[], videoFrame: VideoFrame, isPlaying: boolean) => {
    const [playIndexFrameNumber, setPlayIndexFrameNumber] = useState(videoFrame.identifier.frameNumber);

    // Update the playIndexFrameNumber if the user manually changed the videoFrame
    useEffect(() => {
        if (!isPlaying) {
            const currentIndex = videoFrames.findIndex(
                ({ identifier: { frameNumber } }) => frameNumber === videoFrame.identifier.frameNumber
            );

            if (currentIndex !== playIndexFrameNumber) {
                setPlayIndexFrameNumber(currentIndex > 0 ? currentIndex : 0);
            }
        }
    }, [isPlaying, videoFrame, videoFrames, playIndexFrameNumber]);

    return [playIndexFrameNumber, setPlayIndexFrameNumber] as const;
};

const getVideoPlayingTimeout = (isPlaying: boolean, step: number, fps: number) => {
    if (!isPlaying) {
        return null;
    }

    // When the user plays the video we want to simulate the same duration as the video itself,
    // therefore we try to set the timeout so that: video duration in ms = frames / step * timeout
    const timeout = Math.max(Math.min((1000 * step) / fps, 1000), 100);

    return timeout;
};

export const usePlayVideo = (
    videoFrame: VideoFrame,
    videoFrames: VideoFrame[],
    step: number,
    annotationService: AnnotationService
): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playIndexFramenumber, setPlayIndexFramenumber] = usePlayIndexFrameNumber(videoFrames, videoFrame, isPlaying);

    // When playing the video we don't want to save annotations, this is both for performance reasons
    // as well as to solve a race condition where saving a videoFrame could overwrite annotations of a previous frame
    const { setSelectedMediaItem } = useAnnotator();
    const selectFrame = useSelectVideoFrame(videoFrames, async (mediaItem: VideoFrame) =>
        setSelectedMediaItem(mediaItem)
    );

    const loadAndSelectVideoFrameMutation = useLoadAndSelectVideoFrameMutation(selectFrame, annotationService);

    // Try to play the video with a fixed fps by preloading videoFrames
    const timeout = getVideoPlayingTimeout(isPlaying, step, videoFrame.metadata.fps);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }

        const nextIndex = playIndexFramenumber + 1 < videoFrames.length ? playIndexFramenumber + 1 : 0;
        const nextVideoFrame = videoFrames[nextIndex];

        // Skip preloading a videoFrame if another one is being loaded
        if (
            (loadAndSelectVideoFrameMutation.isIdle || loadAndSelectVideoFrameMutation.isSuccess) &&
            nextVideoFrame.identifier.frameNumber !== videoFrame.identifier.frameNumber
        ) {
            loadAndSelectVideoFrameMutation.mutate(nextVideoFrame);
        }

        setPlayIndexFramenumber(nextIndex);
    }, timeout);

    return [isPlaying, setIsPlaying];
};
