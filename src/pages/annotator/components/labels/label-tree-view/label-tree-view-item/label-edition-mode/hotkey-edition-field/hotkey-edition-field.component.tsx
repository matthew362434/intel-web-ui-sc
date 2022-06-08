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

import { useReducer, useEffect, useRef } from 'react';

import { TextField } from '@adobe/react-spectrum';
import { SpectrumTextFieldProps, TextFieldRef } from '@react-types/textfield';

import { useEventListener } from '../../../../../../../../hooks';
import { KeyboardEvents } from '../../../../../../../../shared/keyboard-events';
import { HOTKEY_EDITION_ACTION, HotkeyEditionFieldState, reducer } from './reducer';

interface HotkeyEditionFieldProps {
    value: string;
    onChange: (value: string) => void;
}

const initialState: HotkeyEditionFieldState = {
    isFocused: false,
    isDirty: true,
    keys: [],
};

export const HotkeyEditionField = ({
    value,
    onChange,
    ...props
}: HotkeyEditionFieldProps & SpectrumTextFieldProps): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const textFieldRef = useRef<TextFieldRef>(null);

    useEffect(() => {
        textFieldRef.current?.focus();
    }, []);

    const onFocusChange = (isFocused: boolean) => {
        dispatch({ type: HOTKEY_EDITION_ACTION.CHANGE_FOCUS, isFocused });

        props.onFocusChange && props.onFocusChange(isFocused);
    };

    useEventListener(KeyboardEvents.KeyDown, (event: KeyboardEvent) => {
        const { key } = event;

        if (state.isFocused) {
            dispatch({ type: HOTKEY_EDITION_ACTION.ADD_KEY, key });

            event.preventDefault();
        }
    });

    useEffect(() => {
        state.isDirty && state.keys.length > 0 && onChange(state.keys.join('+'));
    }, [state.keys, state.isDirty, onChange]);

    return (
        <TextField
            {...props}
            value={value}
            ref={textFieldRef}
            onFocusChange={onFocusChange}
            placeholder={'Press keys'}
        />
    );
};
