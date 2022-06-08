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
import { RefObject, useEffect, useRef } from 'react';

import { VisuallyHidden, useNumberFormatter } from '@adobe/react-spectrum';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { useSlider, useSliderThumb } from '@react-aria/slider';
import { mergeProps } from '@react-aria/utils';
import { SliderState, useSliderState } from '@react-stately/slider';

import { LabeledVideoRange } from '../../../../../core/annotations/labeled-video-range.interface';
import { Label } from '../../../../../core/labels';
import { usePrevious } from '../../../../../hooks/use-previous/use-previous.hook';
import { VideoControls } from '../../../../../pages/annotator/components/video-player/video-controls/video-controls.interface';
import { getAriaLabel, SelectLabelForRange } from './label-search-context-menu.component';
import { joinRanges } from './utils';
import classes from './video-player.module.scss';

interface RangeSectionProps {
    range: LabeledVideoRange;
    leftPercentage: number;
    rightPercentage: number;
}
const RangeSection = ({ leftPercentage, rightPercentage, range }: RangeSectionProps) => {
    const color = range.labels.length > 0 ? range.labels[0].color : '--spectrum-global-color-gray-200';

    const style = {
        background: color,
        left: `${leftPercentage * 100}%`,
        width: `${(rightPercentage - leftPercentage) * 100}%`,
    };

    return <div className={classes.rangeSection} style={style} aria-label={getAriaLabel(range)} />;
};

interface RangeThumbProps {
    state: SliderState;
    index: number;
    trackRef: RefObject<HTMLDivElement>;
}
const RangeThumb = ({ state, trackRef, index }: RangeThumbProps) => {
    const inputRef = useRef(null);
    const { thumbProps, inputProps } = useSliderThumb({ index, trackRef, inputRef }, state);
    const { focusProps, isFocusVisible } = useFocusRing();
    const { hoverProps, isHovered } = useHover({});

    const showThumb = state.isThumbDragging(index) || isHovered || isFocusVisible;
    const style = {
        left: `${state.getThumbPercent(index) * 100}%`,
        background: showThumb ? 'var(--energy-blue)' : undefined,
    };

    return (
        <div {...mergeProps(hoverProps, thumbProps)} style={style} className={classes.rangeThumb}>
            <VisuallyHidden>
                <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
            </VisuallyHidden>
        </div>
    );
};

interface ClassificationRangesProps {
    isDisabled?: boolean;
    ranges: LabeledVideoRange[];
    frames: number;
    setRanges: (ranges: LabeledVideoRange[]) => void;
    videoControls: VideoControls;
    labels: Label[];
    onSelectLabelForRange: (label: Label, range?: LabeledVideoRange) => void;
}

export const ClassificationRanges = ({
    ranges,
    frames,
    setRanges,
    videoControls,
    isDisabled = false,
    labels,
    onSelectLabelForRange,
}: ClassificationRangesProps) => {
    const defaultValue = [...ranges.map(({ end }) => end)].slice(0, -1);
    const props = {
        defaultValue,
        isDisabled,
        minValue: 0,
        maxValue: frames,
        step: 1,
        label: undefined,
        'aria-label': 'Resize ranges',
    };

    const trackRef = useRef<HTMLDivElement>(null);
    const numberFormatter = useNumberFormatter({});

    const onChangeEnd = (sliderState: number[]) => {
        const mapSliderThumbsToRanges = (thumb: number, idx: number): LabeledVideoRange => {
            const end = idx < sliderState.length ? sliderState[idx] : frames;

            if (idx === 0) {
                return { start: 0, end, labels: ranges[idx].labels };
            }

            return { start: Math.max(0, thumb + 1), end, labels: ranges[idx].labels };
        };

        const removeInvalidRanges = ({ start, end }: LabeledVideoRange) => end - start >= 0;

        const newRanges: LabeledVideoRange[] = [0, ...sliderState]
            .map(mapSliderThumbsToRanges)
            .filter(removeInvalidRanges)
            .reduce(joinRanges, []);

        setRanges(newRanges);
    };

    const state = useSliderState({
        ...props,
        numberFormatter,
        onChange,
        onChangeEnd,
    });

    function onChange(values: number[]) {
        const newValue = values.find((value, index) => state.values[index] !== value);

        if (newValue) {
            videoControls.goto(newValue);
        }
    }

    const previousRanges = usePrevious(ranges);
    useEffect(() => {
        if (ranges === previousRanges) {
            return;
        }

        const values = [...ranges.map(({ end }) => end)].slice(0, -1);

        values.forEach((value, index) => {
            if (value !== state.values[index]) {
                state.setThumbValue(index, value);
            }
        });
    }, [ranges, previousRanges, state]);

    const { groupProps, trackProps } = useSlider(props, state, trackRef);

    return (
        <div {...groupProps} className={classes.rangeGroup}>
            <div {...trackProps} ref={trackRef} style={{ position: 'relative', width: '100%' }}>
                {ranges.map((range, idx) => {
                    const leftPercentage = idx === 0 ? 0 : state.getThumbPercent(idx - 1);
                    const rightPercentage = idx === ranges.length - 1 ? 1.0 : state.getThumbPercent(idx);

                    return (
                        <RangeSection
                            key={idx}
                            range={range}
                            leftPercentage={leftPercentage}
                            rightPercentage={rightPercentage}
                        />
                    );
                })}

                {state.values.map((_value, idx) => (
                    <RangeThumb key={idx} index={idx} state={state} trackRef={trackRef} />
                ))}
            </div>
            {/* Allow the user to change each of the ranges' labels */}
            {isDisabled ? (
                <></>
            ) : (
                ranges.map((range, idx) => (
                    <SelectLabelForRange
                        key={idx}
                        labels={labels}
                        onSelectLabelForRange={onSelectLabelForRange}
                        range={range}
                    />
                ))
            )}
        </div>
    );
};
