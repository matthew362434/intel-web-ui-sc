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

import { useEffect, useMemo, useState } from 'react';

import { TextField } from '@adobe/react-spectrum';

import { formatLocalToUtc, formatUtcToLocal, isValidDate } from '../../../../shared/utils';
import { SearchRuleValue } from '../../media-filter.interface';

interface MediaFilterValueDateProps {
    value: string;
    onSelectionChange: (key: SearchRuleValue) => void;
}

const longFormatDate = 'DD/MM/YYYY HH:mm';
const shortFormatDate = 'DD/MM/YYYY';
const validFormats = [longFormatDate, shortFormatDate];
const removeOptionalTime = (date: string): string => date.replace(/\s00:00$/g, '');

export const MediaFilterValueDate = ({ value: initVal, onSelectionChange }: MediaFilterValueDateProps): JSX.Element => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (initVal === '') {
            setValue('');
        } else {
            setValue(removeOptionalTime(formatUtcToLocal(initVal, longFormatDate)));
        }
    }, [initVal]);

    const isValid = useMemo(() => isValidDate(value, validFormats), [value]);

    const onChange = (newValue: string) => {
        setValue(newValue);
        if (isValidDate(newValue, validFormats)) {
            const currentFotmat = newValue.length > 10 ? longFormatDate : shortFormatDate;
            onSelectionChange(formatLocalToUtc(newValue, currentFotmat));
        }
    };

    return (
        <TextField
            isQuiet
            value={value}
            onChange={onChange}
            aria-label={'media-filter-date'}
            placeholder={'dd/mm/yyyy hh:mm'}
            validationState={isValid ? 'valid' : 'invalid'}
        />
    );
};
