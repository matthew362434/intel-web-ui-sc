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

import { VideoFrame } from '../../../../../core/media';
import { useDatasetIdentifier } from '../../../hooks/use-dataset-identifier.hook';
import { constructVideoFrames } from '../hooks';

const findStepSize = (videoFrames: VideoFrame[], defaultStep: number, _defaultLastFrameNumber: number) => {
    if (videoFrames.length <= 1) {
        return defaultStep;
    }

    const frameNumbers = videoFrames.map((frame) => frame.identifier.frameNumber);

    // For asthetic reasons (and maybe UX?), we want the timeline to always start at the first video frame
    if (frameNumbers[0] !== 0) {
        frameNumbers.unshift(0);
    }

    // Find the minimum step size between two consequitive video frames
    const step = frameNumbers.reduce((minimumStep, frameNumber, index) => {
        if (index === 0) {
            return minimumStep;
        }

        const previousFrameNumber = frameNumbers[index - 1];

        return Math.min(minimumStep, frameNumber - previousFrameNumber);
    }, Infinity);

    return step;
};

// Construct a new set of video frames taht contains the first video frame of this video,
// and all frames passed into its argument, filled with "padding" video frames so that the
// resulting array contains video frames with uniform step
export const useVideoFramesWithConsistentStepSize = (
    videoFrames: VideoFrame[],
    videoFrame: VideoFrame
): VideoFrame[] => {
    const datasetIdentifier = useDatasetIdentifier();

    const videoId = videoFrame.identifier.videoId;
    const metadata = videoFrame.metadata;
    const name = videoFrame.name;

    return useMemo(() => {
        const step = findStepSize(videoFrames, metadata.frameStride, metadata.frames);

        return constructVideoFrames(datasetIdentifier, step, videoId, metadata, name, metadata.frames);
    }, [videoFrames, datasetIdentifier, name, metadata, videoId]);
};
