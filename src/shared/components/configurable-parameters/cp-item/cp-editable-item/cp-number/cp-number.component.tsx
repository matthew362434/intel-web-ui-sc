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

import { Flex, Slider, Text, useNumberFormatter } from '@adobe/react-spectrum';

import { NumberGroupParams } from '../../../configurable-parameters.interface';
import { CustomNumberField } from '../../custom-number-field/custom-number-field.component';
import { ResetButtonHandler } from '../cp-editable-item.interface';
import classes from './cp-number.module.scss';

interface CPNumberProps extends ResetButtonHandler {
    parameter: NumberGroupParams;
}

interface NumberFormatOptions {
    notation: 'compact' | 'standard' | 'scientific' | 'engineering' | undefined;
    compactDisplay: 'short' | 'long' | undefined;
    maximumFractionDigits: number;
}

const getDecimalPoints = (value: number): number => {
    const exp = String(value.toExponential());
    const exponent = Number(exp.substr(exp.lastIndexOf('e') + 1));
    return exponent < 0 ? exponent * -1 : exponent;
};

const getFloatingPointStep = (minValue: number, maxValue: number, defaultValue: number): number => {
    if (minValue === 0 && defaultValue === 0) return maxValue - minValue / 100;
    const value = minValue === 0 ? defaultValue : minValue;
    const exponent = getDecimalPoints(value);
    return exponent > 0 ? 1 / Math.pow(10, exponent) : 0.000001;
};

export const CPNumber = ({ id, parameter, updateParameter }: CPNumberProps): JSX.Element => {
    const { value, defaultValue, minValue, maxValue, id: parameterId } = parameter;

    const floatingPointStep = useMemo<number>(() => {
        return getFloatingPointStep(minValue, maxValue, defaultValue);
    }, [minValue, maxValue, defaultValue]);

    const step = parameter.dataType === 'integer' ? 1 : floatingPointStep;
    const formatterConfiguration: NumberFormatOptions = {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: getDecimalPoints(step),
    };
    const formatter = useNumberFormatter(formatterConfiguration);

    const handleOnChange = (inputValue: number): void => {
        updateParameter && updateParameter(parameterId, inputValue);
    };

    const formatSliderLabel = (inputValue: number): string => formatter.format(inputValue);

    return (
        <Flex alignItems={'center'}>
            <CustomNumberField
                value={value}
                defaultValue={defaultValue}
                onChange={handleOnChange}
                step={step}
                maxValue={maxValue}
                minValue={minValue}
                marginEnd={'size-450'}
                formatOptions={formatterConfiguration}
                aria-label={'Select number in a range'}
                id={`${id}-number-field-id`}
            />

            <Flex alignItems={'center'}>
                <Text id={`${id}-min-value-id`} UNSAFE_className={classes.minMaxValues}>
                    {formatter.format(minValue)}
                </Text>
                <Slider
                    defaultValue={defaultValue}
                    minValue={minValue}
                    maxValue={maxValue}
                    isFilled
                    label={' '}
                    labelPosition={'top'}
                    value={value}
                    onChange={handleOnChange}
                    aria-label={'Select number in a slider'}
                    getValueLabel={formatSliderLabel}
                    marginX={'size-150'}
                    step={step}
                    id={`${id}-slider-id`}
                />
                <Text id={`${id}-max-value-id`} UNSAFE_className={classes.minMaxValues}>
                    {formatter.format(maxValue)}
                </Text>
            </Flex>
        </Flex>
    );
};
