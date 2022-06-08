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

import { FocusEvent, useEffect, useMemo, useState } from 'react';

import { TextField, ActionGroup, Item, useNumberFormatter } from '@adobe/react-spectrum';
import { SpectrumTextFieldProps } from '@react-types/textfield';

import { ChevronUpLight, ChevronDownLight } from '../../../../../assets/icons';
import classes from './custom-number-field.module.scss';

// Omit attributes which were string typed - we use number here
type TextFieldWithoutValue = Omit<SpectrumTextFieldProps, 'value' | 'defaultValue' | 'onChange'>;

interface CustomNumberFieldProps extends TextFieldWithoutValue {
    defaultValue: number;
    value: number;
    onChange: (newValue: number) => void;
    step: number;
    maxValue: number;
    minValue: number;
    formatOptions: Intl.NumberFormatOptions;
}

enum Operation {
    INCREASE,
    DECREASE,
}

export const CustomNumberField = ({
    defaultValue,
    value,
    onChange,
    step,
    maxValue,
    minValue,
    formatOptions,
    marginEnd,
    ...inputProps
}: CustomNumberFieldProps): JSX.Element => {
    const [inputValue, setInputValue] = useState<string>(value.toString());
    const formatter = useNumberFormatter(formatOptions);
    const [inputFocused, setInputFocused] = useState<boolean>(false);

    const parseFloat = (parsingValue: string): number => {
        if (parsingValue.includes('T')) {
            return Number.parseFloat(parsingValue) * 1000000000000;
        } else if (parsingValue.includes('B')) {
            return Number.parseFloat(parsingValue) * 1000000000;
        } else if (parsingValue.includes('M')) {
            return Number.parseFloat(parsingValue) * 1000000;
        } else if (parsingValue.includes('K')) {
            return Number.parseFloat(parsingValue) * 1000;
        }

        return Number.parseFloat(parsingValue);
    };

    useEffect(() => {
        setInputValue(formatter.format(value));
    }, [formatter, value]);

    const disabledKeys = useMemo(() => {
        const numberValue = parseFloat(inputValue);

        if (numberValue === maxValue) {
            return ['up'];
        }

        if (numberValue === minValue) {
            return ['down'];
        }
    }, [inputValue, minValue, maxValue]);

    const doOperation = (operation: Operation) => {
        const inputNumeric = parseFloat(inputValue);
        const changedValue = formatter.format(
            operation === Operation.INCREASE
                ? Math.min(maxValue, inputNumeric + step)
                : Math.max(minValue, inputNumeric - step)
        );

        onChange(parseFloat(changedValue));
        setInputValue(changedValue);
    };

    const increase = () => {
        doOperation(Operation.INCREASE);
    };

    const decrease = () => {
        doOperation(Operation.DECREASE);
    };

    const roundToMultipleOfStep = (numberValue: number, stepValue: number): number => {
        return stepValue * Math.round(numberValue / stepValue);
    };

    const onBlurHandler = (event: FocusEvent) => {
        const textValue = (event.target as HTMLInputElement).value;
        const numberValue = parseFloat(textValue);

        if (!Number.isNaN(numberValue)) {
            const multiple = roundToMultipleOfStep(numberValue, step);
            const properValue = multiple > maxValue ? maxValue : multiple < minValue ? minValue : multiple;

            onChange(properValue);
            setInputValue(formatter.format(properValue));
        } else {
            setInputValue(formatter.format(value));
        }
    };

    const inputFocusChangeHandler = (isFocused: boolean) => {
        setInputFocused(isFocused);
    };

    const handleOnChange = (newValue: string): void => {
        if (!Number.isNaN(parseFloat(newValue)) || !newValue) {
            setInputValue(newValue);
        }
    };

    return (
        <>
            <TextField
                {...inputProps}
                value={inputValue}
                onChange={handleOnChange}
                defaultValue={defaultValue.toString()}
                maxWidth={'size-1200'}
                minWidth={'size-400'}
                onBlur={onBlurHandler}
                onFocusChange={inputFocusChangeHandler}
                UNSAFE_className={classes.input}
            />

            <ActionGroup
                orientation='vertical'
                density={'compact'}
                margin={0}
                UNSAFE_className={`${classes.actionGroup} ${inputFocused ? classes.groupFocused : ''}`}
                height={'single-line-height'}
                onAction={(key) => (key === 'up' ? increase() : decrease())}
                disabledKeys={disabledKeys}
                marginEnd={marginEnd}
            >
                <Item key={'up'} aria-label={'Up'}>
                    <ChevronUpLight className={classes.icon} />
                </Item>
                <Item key={'down'} aria-label={'Down'}>
                    <ChevronDownLight className={classes.icon} />
                </Item>
            </ActionGroup>
        </>
    );
};
