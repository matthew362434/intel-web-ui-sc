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

import { AnnotationService } from '../../../../../core/annotations';
import { VideoFrame } from '../../../../../core/media';
import { VideoControls } from './../video-controls/video-controls.interface';
import { useClosestAvailableVideoFrame } from './use-closest-available-video-frame.hook';
import { usePlayVideo } from './use-play-video.hook';

export const useVideoControls = (
    selectFrame: (frameNumber: number, showConfirmation?: boolean) => void,
    videoFrame: VideoFrame,
    videoFrames: VideoFrame[],
    step: number,
    annotationService: AnnotationService,
    isInActiveMode = false
): VideoControls => {
    // Make sure that the selected videoFrame always belongs to the given videoFrames set
    useClosestAvailableVideoFrame(videoFrames, videoFrame, selectFrame, isInActiveMode);

    const videoFrameIndex = videoFrames.findIndex(
        ({ identifier: { frameNumber } }) => frameNumber === videoFrame.identifier.frameNumber
    );
    const [isPlaying, setIsPlaying] = usePlayVideo(videoFrame, videoFrames, step, annotationService);

    const videoControls: VideoControls = useMemo(() => {
        const canSelectPrevious = videoFrameIndex > 0;

        const pause = () => {
            setIsPlaying(false);
        };

        const previous = () => {
            if (canSelectPrevious) {
                pause();

                const previousVideoFrame = videoFrames[videoFrameIndex - 1];

                selectFrame(previousVideoFrame.identifier.frameNumber);
            }
        };

        const canSelectNext = videoFrameIndex < videoFrames.length - 1;

        const next = () => {
            if (canSelectNext) {
                pause();

                const nextVideoFrame = videoFrames[videoFrameIndex + 1];

                selectFrame(nextVideoFrame.identifier.frameNumber);
            }
        };
        const play = () => setIsPlaying(true);

        const goto = (frameNumber: number, showConfirmation = true) => {
            pause();

            selectFrame(frameNumber, showConfirmation);
        };

        return { isPlaying, canSelectPrevious, previous, canSelectNext, next, play, pause, goto };
    }, [selectFrame, isPlaying, setIsPlaying, videoFrames, videoFrameIndex]);

    return videoControls;
};
