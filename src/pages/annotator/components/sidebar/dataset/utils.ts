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

import isEqual from 'lodash/isEqual';

import { isImage, isVideo, MediaItem } from '../../../../../core/media';

export const isSelected = (mediaItem: MediaItem, selectedMediaItem: MediaItem | undefined): boolean => {
    if (selectedMediaItem === undefined) {
        return false;
    }

    if (isImage(selectedMediaItem)) {
        if (isImage(mediaItem)) {
            return selectedMediaItem.identifier.imageId === mediaItem.identifier.imageId;
        }
    } else {
        if (isVideo(mediaItem)) {
            return selectedMediaItem.identifier.videoId === mediaItem.identifier.videoId;
        }

        return isEqual(selectedMediaItem.identifier, mediaItem.identifier);
    }

    return false;
};
