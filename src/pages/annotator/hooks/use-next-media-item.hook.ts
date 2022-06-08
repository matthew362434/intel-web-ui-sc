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

import { useMemo } from 'react';

import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';

import { Annotation } from '../../../core/annotations';
import { isVideo, isVideoFrame, MediaItem, Video, VideoFrame } from '../../../core/media';
import { useVideoPlayerContext } from '../components/video-player/video-player-provider.component';
import { useDataset } from '../providers/dataset-provider/dataset-provider.component';
import { useTaskChain } from '../providers/task-chain-provider/task-chain-provider.component';
import { TaskChainInput } from '../providers/task-chain-provider/task-chain.interface';

export type FindMediaItemCriteriaOutput =
    | { type: 'annotation'; annotation: Annotation }
    | { type: 'media'; media: MediaItem }
    | undefined;

export interface FindMediaItemCriteria {
    (selectedMediaItem: MediaItem | undefined, mediaItems: MediaItem[]): FindMediaItemCriteriaOutput;
}
export interface FindAnnotationCriteria {
    (selectedInput: Annotation | undefined, inputAnnotations: TaskChainInput[]): undefined | Annotation;
}

const useMediaItems = (): MediaItem[] => {
    const { mediaItemsQuery } = useDataset();
    const mediaItemsData = mediaItemsQuery.data;

    return useMemo(() => {
        return mediaItemsData?.pages?.flatMap(({ media }) => media) ?? [];
    }, [mediaItemsData]);
};

const useVideoFrames = (): MediaItem[] => {
    const videoContext = useVideoPlayerContext();

    return videoContext?.videoFrames ?? [];
};

const findNextMediaItemBasedOnVideoFrames = (
    selectedMediaItem: VideoFrame | Video,
    videoFrames: MediaItem[],
    mediaItems: MediaItem[],
    findCriteria: FindMediaItemCriteria
) => {
    const nextVideo = findCriteria(selectedMediaItem, videoFrames);

    if (nextVideo !== undefined) {
        return nextVideo;
    }

    const mediaItemsWithoutSelectedVideo = mediaItems.filter((mediaItem) => {
        // Only include the selected video frame
        if (isVideoFrame(mediaItem)) {
            return (
                mediaItem.identifier.videoId !== selectedMediaItem.identifier.videoId ||
                isEqual(mediaItem.identifier, selectedMediaItem.identifier)
            );
        }

        return true;
    });

    return findCriteria(selectedMediaItem, mediaItemsWithoutSelectedVideo);
};

export const useNextMediaItem = (
    selectedMediaItem: MediaItem | undefined,
    findCriteria: FindMediaItemCriteria,
    findAnnotationCriteria?: FindAnnotationCriteria
): ReturnType<FindMediaItemCriteria> => {
    const videoFrames = useVideoFrames();
    const mediaItems = useMediaItems();
    const { inputs } = useTaskChain();

    const inputsWithOutputs = useMemo(() => {
        return sortBy(inputs, ({ zIndex }) => zIndex);
    }, [inputs]);

    const annotation = useMemo(() => {
        // Try to find annotation
        if (inputsWithOutputs.length > 0 && findAnnotationCriteria !== undefined) {
            return findAnnotationCriteria(
                inputsWithOutputs.find(({ isSelected }) => isSelected),
                inputsWithOutputs
            );
        }

        return undefined;
    }, [findAnnotationCriteria, inputsWithOutputs]);

    // TODO: separate into two useMemo's so that we don't recalculate the media item when
    // annotations change
    return useMemo(() => {
        // Try to find annotation
        if (annotation !== undefined) {
            return { type: 'annotation' as const, annotation };
        }

        // Try to find a next media item in video frames
        if (selectedMediaItem !== undefined && (isVideo(selectedMediaItem) || isVideoFrame(selectedMediaItem))) {
            return findNextMediaItemBasedOnVideoFrames(selectedMediaItem, videoFrames, mediaItems, findCriteria);
        }

        return findCriteria(selectedMediaItem, mediaItems);
    }, [selectedMediaItem, mediaItems, videoFrames, findCriteria, annotation]);
};

// Helper that can be used by implementations of FindMediaItemCriteria that are based on
// the selected media item's index in the dataset
export const findIndex = (selectedMediaItem: MediaItem | undefined, mediaItems: MediaItem[]): number => {
    const idx = mediaItems.findIndex((mediaItem) => isEqual(mediaItem.identifier, selectedMediaItem?.identifier));

    if (idx === -1 && selectedMediaItem !== undefined && isVideoFrame(selectedMediaItem)) {
        const videoIdx = mediaItems.findIndex(
            (mediaItem) => isVideo(mediaItem) && mediaItem.identifier.videoId === selectedMediaItem.identifier.videoId
        );

        return videoIdx;
    }

    return idx;
};
