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
import { RefObject, useRef } from 'react';

import { useNumberFormatter, VisuallyHidden } from '@adobe/react-spectrum';
import { useFocusRing } from '@react-aria/focus';
import { useSlider, useSliderThumb } from '@react-aria/slider';
import { mergeProps } from '@react-aria/utils';
import { SliderState, useSliderState } from '@react-stately/slider';

import { Label } from '../../../../../core/labels';
import { VideoControls } from '../../video-player/video-controls/video-controls.interface';
import { getAriaLabel, SelectLabelForRange } from './label-search-context-menu.component';
import classes from './video-player.module.scss';

interface ResizeRangeThumbProps {
    isActive: boolean;
    index: number;
    trackRef: RefObject<HTMLDivElement>;
    state: SliderState;
}

export const ResizeRangeThumb = ({ isActive, index, state, trackRef }: ResizeRangeThumbProps) => {
    const inputRef = useRef(null);
    const { thumbProps, inputProps } = useSliderThumb(
        { index, trackRef, inputRef, 'aria-label': index === 0 ? 'Minimum' : 'Maximum' },
        state
    );
    const { focusProps, isFocusVisible } = useFocusRing();

    const className = [
        classes.resizeIndicator,
        index === 0 ? classes.resizeIndicatorLeft : classes.resizeIndicatorRight,
        isActive ? classes.resizeIndicatorActive : '',
        isFocusVisible ? classes.resizeIndicatorFocussed : '',
    ].join(' ');

    return (
        <div style={{ left: `${state.getThumbPercent(index) * 100}%` }} className={className} {...thumbProps}>
            <VisuallyHidden>
                <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
            </VisuallyHidden>
        </div>
    );
};

interface RangeSectionProps {
    state: SliderState;
}
const RangeSection = ({ state }: RangeSectionProps) => {
    const leftPercentage = state.getThumbPercent(0);
    const rightPercentage = state.getThumbPercent(1);
    const style = {
        left: `${leftPercentage * 100}%`,
        width: `${(rightPercentage - leftPercentage) * 100}%`,
    };

    return <div className={classes.createRangeSection} style={style} aria-label={getAriaLabel()} />;
};

interface CreateRangeProps {
    minValue: number;
    maxValue: number;
    videoTimelineValue: number;
    range: [number, number] | null;
    setRange: (range: [number, number] | null) => void;
    labels: Label[];
    onSelectLabelForRange: (label: Label) => void;
    videoControls: VideoControls;
}

export const CreateRange = ({
    labels,
    onSelectLabelForRange,
    videoTimelineValue,
    range,
    setRange,
    videoControls,
    ...props
}: CreateRangeProps) => {
    // If the user did not start creating a new range we let the resize indicators
    // follow the video player's timeline slider
    const value = range ?? [videoTimelineValue, videoTimelineValue];

    const trackRef = useRef(null);
    const numberFormatter = useNumberFormatter({});

    const state = useSliderState({ ...props, numberFormatter, onChange, value });

    function onChange(newRange: number[]) {
        if (newRange.length !== 2) {
            return;
        }

        const newValue = newRange.find((rangeValue, index) => state.values[index] !== rangeValue);

        if (newValue) {
            videoControls.goto(newValue);
        }
        setRange(newRange as [number, number]);
    }

    const { groupProps, trackProps } = useSlider({ ...props, 'aria-label': 'Create a new range' }, state, trackRef);

    return (
        <div {...groupProps} className={classes.createRangeGroup}>
            <div {...trackProps} ref={trackRef} className={classes.createRangeTrack}>
                <RangeSection state={state} />

                <ResizeRangeThumb index={0} state={state} trackRef={trackRef} isActive={range !== null} />
                <ResizeRangeThumb index={1} state={state} trackRef={trackRef} isActive={range !== null} />
            </div>
            {range !== null ? (
                <SelectLabelForRange labels={labels} onSelectLabelForRange={onSelectLabelForRange} />
            ) : (
                <></>
            )}
        </div>
    );
};
