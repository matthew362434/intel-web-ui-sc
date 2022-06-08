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

import { useCallback } from 'react';

import { VideoFrame } from '../../../../../core/media';

export const useSelectVideoFrame = (
    videoFrames: VideoFrame[],
    selectVideoFrame: (videoFrame: VideoFrame, showConfirmation?: boolean) => Promise<void>
): ((value: number, showConfirmation?: boolean) => void) => {
    return useCallback(
        (value: number, showConfirmation = true) => {
            const frame = videoFrames.find(({ identifier: { frameNumber } }) => {
                return frameNumber === value;
            });

            if (frame === undefined) {
                return;
            }

            selectVideoFrame(frame, showConfirmation);
        },
        [videoFrames, selectVideoFrame]
    );
};
