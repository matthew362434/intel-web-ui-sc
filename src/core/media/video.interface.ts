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

import { MEDIA_TYPE } from './base-media.interface';
import { BaseIdentifier, BaseMediaItem, BaseMetadata } from './base.interface';

export interface VideoIdentifier extends BaseIdentifier {
    type: MEDIA_TYPE.VIDEO;
    videoId: string;
}

export interface VideoMetadata extends BaseMetadata {
    fps: number;
    frames: number;
    duration: number;
    frameStride: number;
}

export interface Video extends BaseMediaItem {
    identifier: VideoIdentifier;
    metadata: VideoMetadata;
}

export const isVideo = (media: { identifier: BaseIdentifier }): media is Video => {
    return media.identifier.type === MEDIA_TYPE.VIDEO;
};

export interface VideoFrameIdentifier extends BaseIdentifier {
    type: MEDIA_TYPE.VIDEO_FRAME;
    videoId: string;
    frameNumber: number;
}

export interface VideoFrame extends BaseMediaItem {
    identifier: VideoFrameIdentifier;
    metadata: VideoMetadata;
}

export const isVideoFrame = (media: { identifier: BaseIdentifier }): media is VideoFrame => {
    return media.identifier.type === MEDIA_TYPE.VIDEO_FRAME;
};
