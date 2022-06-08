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
import { isImage, isVideo, isVideoFrame, MediaItem } from '../../../../../core/media';
import { MediaItemTooltipMessageProps } from './media-item-tooltip-message';

export const getMediaItemTooltipProps = (mediaItem: MediaItem): MediaItemTooltipMessageProps => {
    if (isImage(mediaItem)) {
        const {
            name,
            metadata: { height, width },
            identifier: { imageId, type },
        } = mediaItem;
        return {
            id: imageId,
            fileName: name,
            resolution: `${width}x${height}`,
            type,
        };
    } else if (isVideo(mediaItem) || isVideoFrame(mediaItem)) {
        const {
            name,
            identifier: { type, videoId },
            metadata: { fps, duration },
        } = mediaItem;
        return {
            id: videoId,
            fileName: name,
            type,
            fps,
            duration,
        };
    }
    throw new Error('Unable to retrieve image information');
};
