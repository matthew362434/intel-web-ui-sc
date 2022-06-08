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

import range from 'lodash/range';
import sortBy from 'lodash/sortBy';
import { UseInfiniteQueryResult } from 'react-query';

import {
    VideoFrame,
    MEDIA_TYPE,
    Video,
    VideoMetadata,
    MediaItemResponse,
    isVideoFrame,
    MEDIA_ANNOTATION_STATUS,
} from '../../../../../core/media';
import { DatasetIdentifier } from '../../../../../core/projects';
import { API_URLS } from '../../../../../core/services';
import { useDataset } from '../../../providers/dataset-provider/dataset-provider.component';

const getActiveVideoFrames = (
    activeMediaItemsData: UseInfiniteQueryResult<MediaItemResponse>['data'],
    videoId: string
) => {
    if (activeMediaItemsData === undefined) {
        return [];
    }
    const activeVideoFrames = activeMediaItemsData.pages
        .flatMap((page) => page.media)
        .filter((mediaItem): mediaItem is VideoFrame => {
            if (!isVideoFrame(mediaItem)) {
                return false;
            }

            return mediaItem.identifier.videoId === videoId;
        });

    return sortBy(activeVideoFrames, ({ identifier: { frameNumber } }) => frameNumber);
};

export const constructVideoFrames = (
    datasetIdentifier: DatasetIdentifier,
    step: number,
    videoId: string,
    metadata: VideoMetadata,
    name: string,
    lastFrameNumber = metadata.frames
): VideoFrame[] => {
    // Construct video frames the user can select based on the configured step
    return range(0, lastFrameNumber, step).map((frameNumber: number) => {
        const identifier = {
            type: MEDIA_TYPE.VIDEO_FRAME,
            videoId,
            frameNumber,
        } as const;

        const src = API_URLS.MEDIA_ITEM_SRC(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            identifier
        );

        const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            identifier
        );

        // We're assuming that the video is not annotated nor analysed as this
        // is not important for the videoplayer
        const status = MEDIA_ANNOTATION_STATUS.NONE;

        return { identifier, src, thumbnailSrc, status, name, metadata, annotationStatePerTask: [] };
    });
};

export const useAvailableVideoFrames = (
    videoFrame: VideoFrame | Video,
    step: number,
    isInActiveMode: boolean
): VideoFrame[] => {
    const { activeMediaItemsQuery, datasetIdentifier } = useDataset();

    const {
        metadata,
        name,
        identifier: { videoId },
    } = videoFrame;
    const activeMediaItemsData = activeMediaItemsQuery.data;

    // Construct available video frames and make sure that the returned array
    // doens't change when changing the videoFrame
    return useMemo(() => {
        if (isInActiveMode) {
            return getActiveVideoFrames(activeMediaItemsData, videoId);
        }

        return constructVideoFrames(datasetIdentifier, step, videoId, metadata, name);
    }, [step, activeMediaItemsData, datasetIdentifier, metadata, name, videoId, isInActiveMode]);
};
