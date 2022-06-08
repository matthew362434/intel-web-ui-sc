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

import { useEffect, useRef } from 'react';

import { Flex } from '@adobe/react-spectrum';
import type { Dictionary } from 'lodash';
import useVirtual from 'react-cool-virtual';

import { Label } from '../../../../../core/labels';
import { VideoFrame } from '../../../../../core/media';
import { useSize } from '../../../../../hooks';
import { VideoPlayerSlider } from '../slider/slider.component';
import { getMaxVideoSliderValue } from '../utils';
import { useVideoPlayer } from '../video-player-provider.component';
import { useVideoFramesWithConsistentStepSize } from './../hooks/use-video-frames-with-consistent-step-size.hook';
import classes from './video-annotator.module.scss';
import { VideoFrameSegment } from './video-frame-segment.component';

const EMPTY_SET = new Set<string>();
const MIN_SIZE_OF_SEGMENT = 8;

interface VideoTimelineProps {
    videoFrame: VideoFrame;
    step: number;
    selectFrame: (frameNumber: number) => void;
    labelsByGroup: Dictionary<Label[]>;
}

export const VideoTimeline = ({ videoFrame, step, selectFrame, labelsByGroup }: VideoTimelineProps): JSX.Element => {
    const {
        videoFrames,
        videoEditor: { annotationsQuery, predictionsQuery },
    } = useVideoPlayer();
    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);

    const videoFramesWithPadding = useVideoFramesWithConsistentStepSize(videoFrames, videoFrame);

    const sizePerSquare =
        size === undefined ? 0 : Math.max(MIN_SIZE_OF_SEGMENT, size.width / videoFramesWithPadding.length);

    const { outerRef, innerRef, items, scrollToItem } = useVirtual<HTMLDivElement, HTMLDivElement>({
        horizontal: true,
        itemCount: videoFramesWithPadding.length,
        itemSize: sizePerSquare,
    });

    // Note: we have two indexes for the selected video frame: one related to useVirtual and the other
    // related to the available video frames.
    // Here we select the virtual index so that we can scroll to it when the video frame is changed.
    const virtualSelectedVideoFrameIndex = videoFramesWithPadding.findIndex(
        ({ identifier: { frameNumber } }) => frameNumber === videoFrame.identifier.frameNumber
    );

    useEffect(() => {
        scrollToItem(virtualSelectedVideoFrameIndex);
    }, [virtualSelectedVideoFrameIndex, scrollToItem]);

    const selectedVideoFrameIndex = videoFrames.findIndex(
        ({ identifier: { frameNumber } }) => frameNumber === videoFrame.identifier.frameNumber
    );

    const maxValue = getMaxVideoSliderValue(videoFrame.metadata.frames, step);

    return (
        <div
            ref={ref}
            className={classes.timeline}
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_SIZE_OF_SEGMENT}px, max-content))` }}
        >
            <div ref={outerRef} className={classes.timelineOuterRef} style={{ width: size?.width }}>
                <div
                    style={{ width: sizePerSquare * videoFramesWithPadding.length }}
                    className={classes.timelineSliderWrapper}
                >
                    <VideoPlayerSlider
                        isInActiveMode={false}
                        mediaItem={videoFrame}
                        selectFrame={selectFrame}
                        step={step}
                        videoFrames={videoFrames}
                        showTicks
                        minValue={0}
                        maxValue={maxValue}
                    />
                </div>
                <div
                    ref={innerRef}
                    className={classes.timelineInnerRef}
                    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_SIZE_OF_SEGMENT}px, max-content))` }}
                >
                    {items.map(({ index, size: width }) => {
                        if (videoFramesWithPadding[index] === undefined) {
                            return <></>;
                        }

                        const frameNumber = videoFramesWithPadding[index].identifier.frameNumber;

                        // NOTE: the frame may not exist in the current (active) set of video frames
                        const isActive = videoFrames[selectedVideoFrameIndex]?.identifier?.frameNumber === frameNumber;

                        const isSelectableFrame = videoFrames.some(
                            ({ identifier }) => identifier.frameNumber === frameNumber
                        );

                        const annotatedLabels =
                            (annotationsQuery.data && annotationsQuery.data[frameNumber]) ?? EMPTY_SET;

                        const predictedLabels =
                            (predictionsQuery.data && predictionsQuery.data[frameNumber]) ?? EMPTY_SET;

                        return (
                            <Flex
                                justifyContent='center'
                                alignItems='center'
                                key={videoFramesWithPadding[index].identifier.frameNumber}
                                width={`${width}px`}
                            >
                                <VideoFrameSegment
                                    isActive={isActive}
                                    annotatedLabels={annotatedLabels}
                                    predictedLabels={predictedLabels}
                                    labelsByGroup={labelsByGroup}
                                    onClick={() => {
                                        if (isSelectableFrame) {
                                            selectFrame(frameNumber);
                                        }
                                    }}
                                    isEmpty={!isSelectableFrame}
                                />
                            </Flex>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
