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
import { useEffect, useState } from 'react';

import { Slider, DialogTrigger, ActionButton, View, Flex } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { ChevronDownLight } from '../../../assets/icons';
import classes from './number-slider.module.scss';

export interface NumberSliderProps {
    onChange: (value: number) => void;
    displayText: (value: number) => string | number;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    id: string;
    ariaLabel: string;
    isDisabled?: boolean;
}

export const NumberSlider = ({
    id,
    label,
    onChange,
    displayText,
    min,
    max,
    step,
    ariaLabel,
    defaultValue,
    isDisabled = false,
}: NumberSliderProps): JSX.Element => {
    const [value, setValue] = useState<number>(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <Flex alignItems='center' gap='size-100'>
            <Text UNSAFE_className={classes.text}>{label}:</Text>
            <DialogTrigger type='popover'>
                <ActionButton
                    aria-label={`${ariaLabel} button`}
                    data-testid={`${id}-button`}
                    id={`${id}-button`}
                    minWidth={'size-350'}
                    height='size-250'
                    isDisabled={isDisabled}
                    UNSAFE_className={classes.sliderButton}
                >
                    <Text UNSAFE_className={classes.text}>{displayText(value)}</Text>
                    <ChevronDownLight style={{ order: 1 }} />
                </ActionButton>
                <View paddingTop='size-65' paddingX='size-75' paddingBottom='size-40'>
                    <Slider
                        showValueLabel={false}
                        id={`${id}-slider`}
                        aria-label={`${ariaLabel} slider`}
                        value={value}
                        step={step}
                        minValue={min}
                        maxValue={max}
                        isDisabled={isDisabled}
                        onChangeEnd={onChange}
                        onChange={setValue}
                    />
                </View>
            </DialogTrigger>
        </Flex>
    );
};
