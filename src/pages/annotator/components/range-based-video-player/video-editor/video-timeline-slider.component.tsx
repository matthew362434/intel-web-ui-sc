// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { RefObject, useRef } from 'react';

import { useNumberFormatter, View, VisuallyHidden } from '@adobe/react-spectrum';
import { useFocusRing } from '@react-aria/focus';
import { useSlider, useSliderThumb } from '@react-aria/slider';
import { mergeProps } from '@react-aria/utils';
import { SliderState, useSliderState } from '@react-stately/slider';

import { VideoFrame } from '../../../../../core/media';
import { VideoControls } from '../../video-player/video-controls/video-controls.interface';
import classes from './video-player.module.scss';

interface ThumbProps {
    state: SliderState;
    index: number;
    trackRef: RefObject<HTMLDivElement>;
}
export const Thumb = ({ state, trackRef, index }: ThumbProps) => {
    const inputRef = useRef(null);
    const { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state);

    const { focusProps, isFocusVisible } = useFocusRing();
    return (
        <div className={classes.timelineThumb} style={{ left: `${state.getThumbPercent(index) * 100}%` }}>
            <View
                borderWidth='thick'
                borderColor={isFocusVisible ? 'blue-500' : 'gray-800'}
                borderRadius={'large'}
                width={16}
                height={16}
            >
                <div {...thumbProps}>
                    <VisuallyHidden>
                        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
                    </VisuallyHidden>
                </div>
            </View>
        </div>
    );
};

interface SliderProps {
    sliderValue: number;
    setSliderValue: (value: number) => void;
    videoFrame: VideoFrame;
    videoControls: VideoControls;
}

// This component mimicks Adobe Spectrum's slider, but uses react-aria's useSlider props so that
// we have more control over its styling
// @see https://react-spectrum.adobe.com/react-aria/useSlider.html#single-thumb
export const VideoTimelineSlider = ({ sliderValue, setSliderValue, videoFrame, videoControls }: SliderProps) => {
    const numberFormatter = useNumberFormatter({});

    const props = {
        minValue: 0,
        maxValue: videoFrame.metadata.frames,
        step: 1,
        value: [sliderValue],
        defaultValue: [videoFrame.identifier.frameNumber],
        onChange: (values: number[]) => setSliderValue(values[0]),
        onChangeEnd: (frameNumber: number[]) => {
            videoControls.goto(frameNumber[0]);
        },
        numberFormatter,
        'aria-label': 'Seek in video',
        'aria-valuetext': `Video is at frame ${videoFrame.identifier.frameNumber} of ${videoFrame.metadata.frames}`,
    };
    const state = useSliderState(props);

    const trackRef = useRef<HTMLDivElement>(null);
    const { groupProps, trackProps } = useSlider(props, state, trackRef);

    // Add a small offset to the lines so that they don't intersect with the thumb
    const offset = '11px';

    return (
        <div {...groupProps} className={classes.timelineGroup}>
            <div {...trackProps} ref={trackRef} className={classes.timelineTrackGroup}>
                {/* The track is separated by one filled (white) line and unfilled line */}
                <View
                    UNSAFE_className={classes.timelineTrack}
                    width={`calc(${state.getThumbPercent(0) * 100}% - ${offset})`}
                    backgroundColor={'gray-800'}
                />
                <View
                    UNSAFE_className={classes.timelineTrack}
                    width={`calc(${100 - state.getThumbPercent(0) * 100}% - ${offset})`}
                    left={`calc(${state.getThumbPercent(0) * 100}% + ${offset})`}
                    backgroundColor={'gray-400'}
                />
                <Thumb index={0} state={state} trackRef={trackRef} />
            </div>
        </div>
    );
};
