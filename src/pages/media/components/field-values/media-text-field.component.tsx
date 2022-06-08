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

import { useCallback, useEffect, useMemo, useState } from 'react';

import { TextField } from '@adobe/react-spectrum';
import debounce from 'lodash/debounce';

import { SearchRuleValue } from '../../media-filter.interface';

interface MediaTextFieldProps {
    value?: string;
    regex: RegExp;
    isNumber?: boolean;
    isDisabled?: boolean;
    'aria-label': string;
    placeholder?: string;
    onSelectionChange: (key: SearchRuleValue) => void;
}

export const MediaTextField = ({
    regex,
    value: initVal = '',
    isNumber = false,
    isDisabled = false,
    placeholder = '',
    onSelectionChange,
    'aria-label': ariaLabel,
}: MediaTextFieldProps): JSX.Element => {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(initVal);
    }, [initVal]);

    const isValid = useMemo(() => regex.test(value), [regex, value]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onDebounceSelectionChange = useCallback(
        debounce((newValue: string) => {
            onSelectionChange(isNumber ? Number(newValue) : newValue);
        }, 200),
        [regex, isNumber, onSelectionChange]
    );

    const onSetValue = (newValue: string) => {
        setValue(newValue);
        if (regex.test(newValue)) {
            onDebounceSelectionChange(newValue);
        }
    };

    return (
        <TextField
            isQuiet
            value={value}
            aria-label={ariaLabel}
            onChange={onSetValue}
            isDisabled={isDisabled}
            placeholder={placeholder}
            validationState={isDisabled || isValid ? 'valid' : 'invalid'}
        />
    );
};
