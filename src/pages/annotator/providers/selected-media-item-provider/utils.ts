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

import { v4 as uuidv4 } from 'uuid';

import { Annotation, roiFromImage } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { isVideo, MEDIA_TYPE, MediaItem, SelectedMediaItem } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import { API_URLS } from '../../../../core/services';

export const getPendingMediaItem = (
    datasetIdentifier: DatasetIdentifier,
    pendingMediaItem?: MediaItem
): MediaItem | undefined => {
    if (!pendingMediaItem) {
        return undefined;
    }

    if (isVideo(pendingMediaItem)) {
        // If the user selected a video then we want to load its first frame by default
        const identifier = {
            type: MEDIA_TYPE.VIDEO_FRAME,
            videoId: pendingMediaItem.identifier.videoId,
            frameNumber: 0,
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

        return {
            ...pendingMediaItem,
            identifier,
            src,
            thumbnailSrc,
        };
    }

    return pendingMediaItem;
};

export const constructClassificationAnnotations = (selectedMediaItem: SelectedMediaItem): Annotation[] => {
    if (selectedMediaItem.annotations.length > 0) {
        return selectedMediaItem.annotations.map((annotation) => {
            return { ...annotation, isSelected: true };
        });
    }

    const roi = roiFromImage(selectedMediaItem.image);

    // Construct a new annotation that is selected so that label keybindings will change this
    // annotation's labels
    return [
        {
            id: uuidv4(),
            shape: { shapeType: ShapeType.Rect, ...roi },
            labels: [],
            zIndex: 0,
            isSelected: true,
            isHidden: false,
            isLocked: false,
            isHovered: false,
        },
    ];
};
