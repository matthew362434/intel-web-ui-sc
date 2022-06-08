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

import sortBy from 'lodash/sortBy';

import { ImageIdDTO, VideoFrameIdDTO, VideoIdDTO } from '../../annotations/dtos';
import { DatasetIdentifier, ProjectIdentifier } from '../../projects';
import { API_URLS } from '../../services';
import { ActiveMediaItemDTO } from '../dtos';
import { MEDIA_TYPE, MediaItem, MediaItemDTO, MediaIdentifier } from '../index';
import { isVideo, isVideoFrame } from '../video.interface';

export const mediaIdentifierToDTO = (mediaIdentifier: MediaIdentifier): ImageIdDTO | VideoIdDTO | VideoFrameIdDTO => {
    if (mediaIdentifier.type === MEDIA_TYPE.IMAGE) {
        return {
            type: 'image',
            image_id: mediaIdentifier.imageId,
        };
    }

    const identifier = { identifier: mediaIdentifier };

    if (isVideoFrame(identifier)) {
        return {
            type: 'video_frame',
            video_id: mediaIdentifier.videoId,
            frame_index: identifier.identifier.frameNumber,
        };
    }

    return {
        type: 'video',
        video_id: mediaIdentifier.videoId,
    };
};

export const getMediaItemFromDTO = (
    { workspaceId, projectId, datasetId }: DatasetIdentifier,
    item: MediaItemDTO
): MediaItem => {
    const baseMediaItem = {
        status: item.state,
        name: item.name,
        metadata: {
            width: item.media_information.width,
            height: item.media_information.height,
        },
        annotationStatePerTask: item.annotation_state_per_task,
    };

    switch (item.type) {
        case MEDIA_TYPE.IMAGE: {
            const identifier = { type: MEDIA_TYPE.IMAGE as const, imageId: item.id };
            const src = API_URLS.MEDIA_ITEM_SRC(workspaceId, projectId, datasetId, identifier);
            const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(workspaceId, projectId, datasetId, identifier);

            return { ...baseMediaItem, identifier, src, thumbnailSrc };
        }
        case MEDIA_TYPE.VIDEO: {
            const identifier = { type: MEDIA_TYPE.VIDEO as const, videoId: item.id };
            const src = API_URLS.MEDIA_ITEM_STREAM(workspaceId, projectId, datasetId, identifier);
            const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(workspaceId, projectId, datasetId, identifier);
            const { duration, frame_count: frames, frame_stride: frameStride } = item.media_information;
            const fps = frames / duration;
            const metadata = { ...baseMediaItem.metadata, fps, frames, duration, frameStride: frameStride };

            return { ...baseMediaItem, identifier, metadata, src, thumbnailSrc };
        }
        case MEDIA_TYPE.VIDEO_FRAME: {
            const frameNumber = Number(item.id);
            const {
                duration,
                frame_count: frames,
                frame_stride: frameStride,
                video_id: videoId,
            } = item.media_information;
            const identifier: MediaIdentifier = { type: MEDIA_TYPE.VIDEO_FRAME as const, videoId, frameNumber };
            const src = API_URLS.MEDIA_ITEM_SRC(workspaceId, projectId, datasetId, identifier);
            const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(workspaceId, projectId, datasetId, identifier);
            const fps = frames / duration;
            const metadata = { ...baseMediaItem.metadata, fps, frames, duration, frameStride: frameStride };

            return { ...baseMediaItem, identifier, metadata, src, thumbnailSrc };
        }
        default: {
            throw new Error(`Unsupported media type`);
        }
    }
};

const determineDatasetIdFromSrc = (src: string) => {
    const regex = /.*datasets\/(.*)\/media.*/;
    const match = src.match(regex);

    if (match === null) {
        throw new Error('Could not determine dataset id based on thumbnail src');
    }

    return match[1];
};

export const getActiveMediaItems = (
    { workspaceId, projectId }: ProjectIdentifier,
    item: ActiveMediaItemDTO
): MediaItem[] => {
    // NOTE: currently we don't receive the dataset id from the server side,
    // so we need to determine it from the provided thumbnail
    // This should be replaced by the dataset id returned from the server
    // once they support this
    const datasetId = determineDatasetIdFromSrc(item.thumbnail);

    if (item.type === 'image') {
        return [getMediaItemFromDTO({ workspaceId, projectId, datasetId }, item)];
    }

    if (item.type === 'video') {
        const videoMediaItem = getMediaItemFromDTO({ workspaceId, projectId, datasetId }, item);

        if (!isVideo(videoMediaItem) && !isVideoFrame(videoMediaItem)) {
            throw new Error('Expected to receive video');
        }

        const videoFrames = item.active_frames.map((frameItem) => {
            const identifier = {
                type: MEDIA_TYPE.VIDEO_FRAME,
                videoId: item.id,
                frameNumber: Number(frameItem.id),
            } as const;
            const src = API_URLS.MEDIA_ITEM_SRC(workspaceId, projectId, datasetId, identifier);
            const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(workspaceId, projectId, datasetId, identifier);

            return {
                name: frameItem.name,
                identifier,
                src,
                thumbnailSrc,
                status: frameItem.state,
                metadata: videoMediaItem.metadata,
                annotationStatePerTask: frameItem.annotation_state_per_task,
            };
        });

        return sortBy(videoFrames, (videoFrame) => {
            return videoFrame.identifier.frameNumber;
        });
    }

    throw new Error(`Received an unsupported media type`);
};
