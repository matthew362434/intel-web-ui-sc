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

import { PointerEvent, useEffect, useState } from 'react';

import { Slider } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';
import minBy from 'lodash/minBy';

import { VideoFrame } from '../../../../../core/media';
import { blurActiveInput } from '../../../tools/utils';
import classes from './slider.module.scss';
import { ThumbnailPreview } from './thumbnail-preview.component';
import { Ticks } from './ticks.component';

const getFrameNumber = (x: number, width: number, minValue: number, maxValue: number, step: number) => {
    const frameNumber = Math.min(
        Math.floor(maxValue / step) * step,
        Math.max(0, Math.round(Math.round((x / width) * (maxValue - minValue)) / step) * step)
    );

    return frameNumber;
};

interface VideoPlayerSliderProps {
    videoFrames: VideoFrame[];
    isInActiveMode: boolean;
    mediaItem: VideoFrame;
    selectFrame: (frameNumber: number) => void;
    step: number;
    showTicks?: boolean;
    maxValue: number;
    minValue: number;
}

const DisabledSlider = () => {
    return (
        <div className={classes.sliderWrapper}>
            <Slider
                id='video-player-timeline-slider'
                isDisabled
                aria-label='Videoframe'
                showValueLabel={false}
                width='100%'
                UNSAFE_className={classes.slider}
            />
        </div>
    );
};

export const VideoPlayerSlider = ({
    mediaItem,
    selectFrame,
    step,
    isInActiveMode,
    videoFrames,
    showTicks,
    maxValue,
    minValue,
}: VideoPlayerSliderProps): JSX.Element => {
    const [thumbnailVideoFrame, setThumbnailVideoFrame] = useState<null | VideoFrame>(null);
    const [thumbnailPosition, setThumbnailPosition] = useState<null | number>(null);
    const [showThumbnail, setShowThumbnail] = useState(false);
    const { hoverProps, isHovered } = useHover({
        onHoverEnd: () => {
            setThumbnailPosition(null);
            setThumbnailVideoFrame(null);
        },
    });

    useEffect(() => {
        if (isHovered && !showThumbnail) {
            const timeOut = setTimeout(() => {
                setShowThumbnail(true);
            }, 1000);

            return () => {
                clearTimeout(timeOut);
            };
        }
        if (!isHovered && showThumbnail) {
            setShowThumbnail(false);
            setThumbnailVideoFrame(null);
        }
    }, [isHovered, showThumbnail]);

    const frameNumber = mediaItem.identifier.frameNumber;

    const [sliderValue, setSliderValue] = useState(frameNumber);
    useEffect(() => setSliderValue(frameNumber), [frameNumber]);

    // The videoFrames can be empty when the user uses active frames and the active
    // set for this video is empty.
    if (videoFrames.length === 0) {
        return <DisabledSlider />;
    }

    const findNearestVideoFrame = (toFrameNumber: number): VideoFrame => {
        // Get the nearest video frame
        const videoFrame = minBy(videoFrames, ({ identifier }) => {
            return Math.abs(toFrameNumber - identifier.frameNumber);
        });

        // minBy only returns undefined if videoFrames is empty, in this case we
        // default to the currently selected video frame
        if (videoFrame === undefined) {
            return mediaItem;
        }

        return videoFrame;
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(0, event.clientX - event.currentTarget.offsetLeft);
        const thumbnailFrameNumber = getFrameNumber(x, rect.width, minValue ?? 0, maxValue ?? 0, step);

        const videoFrame = findNearestVideoFrame(thumbnailFrameNumber);

        if (videoFrame !== undefined) {
            setThumbnailPosition(x);
            setThumbnailVideoFrame(videoFrame);
        }
    };

    return (
        <div className={classes.sliderWrapper} onPointerMove={onPointerMove} {...hoverProps}>
            <Slider
                id='video-player-timeline-slider'
                onChangeEnd={(newFrameNumber) => {
                    const videoFrame = findNearestVideoFrame(newFrameNumber);

                    if (videoFrame !== undefined) {
                        selectFrame(videoFrame.identifier.frameNumber);
                    }
                    blurActiveInput(true);
                }}
                value={sliderValue}
                onChange={(newFrameNumber: number) => {
                    const videoFrame = findNearestVideoFrame(newFrameNumber);

                    if (videoFrame !== undefined) {
                        setSliderValue(videoFrame.identifier.frameNumber);
                        setShowThumbnail(true);
                    }
                }}
                defaultValue={frameNumber}
                minValue={minValue}
                maxValue={maxValue}
                step={isInActiveMode ? 1 : step}
                aria-label='Videoframe'
                showValueLabel={false}
                isFilled
                width='100%'
                UNSAFE_className={classes.slider}
            />
            {showTicks ? <Ticks videoFrames={videoFrames} minValue={minValue} maxValue={maxValue} /> : <></>}
            {showThumbnail && thumbnailVideoFrame !== null && thumbnailPosition !== null ? (
                <ThumbnailPreview x={thumbnailPosition} width={100} height={100} videoFrame={thumbnailVideoFrame} />
            ) : (
                <></>
            )}
        </div>
    );
};
