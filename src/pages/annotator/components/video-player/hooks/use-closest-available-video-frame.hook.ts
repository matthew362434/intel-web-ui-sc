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

import { useEffect } from 'react';

import minBy from 'lodash/minBy';

import { VideoFrame } from '../../../../../core/media';

export const useClosestAvailableVideoFrame = (
    videoFrames: VideoFrame[],
    videoFrame: VideoFrame,
    selectFrame: (frameNumber: number) => void,
    isInActiveMode = false
): void => {
    useEffect(() => {
        if (isInActiveMode) {
            return;
        }

        const closestVideoFrame = minBy(videoFrames, ({ identifier: { frameNumber } }) => {
            return Math.abs(frameNumber - videoFrame.identifier.frameNumber);
        });

        if (
            closestVideoFrame !== undefined &&
            closestVideoFrame.identifier.frameNumber !== videoFrame.identifier.frameNumber
        ) {
            selectFrame(closestVideoFrame.identifier.frameNumber);
        }
    }, [videoFrames, videoFrame, selectFrame, isInActiveMode]);
};
