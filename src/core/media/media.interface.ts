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

import { Annotation } from '../annotations';
import { PredictionResult } from '../annotations/services/prediction-service.interface';
import { MEDIA_TYPE } from './base-media.interface';
import { Image } from './image.interface';
import { Video, VideoFrame } from './video.interface';

export type MediaItem = Image | Video | VideoFrame;
export type MediaIdentifier = MediaItem['identifier'];
export type MediaCount = { images: number; videos: number };

export interface MediaItemResponse {
    media: MediaItem[];
    nextPage: string | undefined;
    mediaCount: MediaCount | undefined;
}

export interface MediaAdvancedCount {
    totalImages: number;
    totalMatchedImages: number;
    totalMatchedVideoFrames: number;
    totalMatchedVideos: number;
    totalVideos: number;
}

export interface MediaAdvancedFilterResponse extends MediaAdvancedCount {
    media: MediaItem[];
    nextPage: string | undefined;
}

export type SelectedMediaItem = MediaItem & {
    image: HTMLImageElement;
    annotations: Annotation[];
    predictions?: PredictionResult;
};

export const mediaIdentifierToString = (mediaIdentifier: MediaIdentifier): string => {
    switch (mediaIdentifier.type) {
        case MEDIA_TYPE.IMAGE:
            return `image-${mediaIdentifier.imageId}`;
        case MEDIA_TYPE.VIDEO:
            return `video-${mediaIdentifier.videoId}`;
        case MEDIA_TYPE.VIDEO_FRAME:
            return `videoframe-${mediaIdentifier.videoId}-${mediaIdentifier.frameNumber}`;
    }
};
