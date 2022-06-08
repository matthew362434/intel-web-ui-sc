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
import { TextFieldRef } from '@react-types/textfield';

import { LimitedTextField, ValidationErrorMsg } from '../../../../../../../../shared/components';

interface NameEditionFieldProps {
    value: string | undefined;
    onChange: (value: string) => void;
    error: string;
}

export const NameEditionField = ({ onChange, error, value }: NameEditionFieldProps): JSX.Element => {
    const newChildNameRef = useRef<TextFieldRef>(null);

    const setFocusOnName = () => {
        newChildNameRef.current && newChildNameRef.current.focus();
    };

    useEffect(() => {
        setFocusOnName();
    }, []);

    const onChangeHandler = (newValue: string) => {
        onChange(newValue);
    };

    return (
        <Flex direction={'column'} width={'100%'}>
            <LimitedTextField
                minWidth={0}
                width={'100%'}
                value={value}
                ref={newChildNameRef}
                onChange={onChangeHandler}
                validationState={error ? 'invalid' : undefined}
                aria-label={'edited name'}
            />
            <ValidationErrorMsg errorMsg={error} inheritHeight={true} maxWidth={'192px'} />
        </Flex>
    );
};
