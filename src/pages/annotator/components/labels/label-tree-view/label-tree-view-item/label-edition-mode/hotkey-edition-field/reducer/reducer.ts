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
import { COMMAND_KEY, COMMAND_KEY_BINDING, CTRL_KEY } from '../../../../../../../../create-project';
import { Action, HOTKEY_EDITION_ACTION } from './actions';
import { HotkeyEditionFieldState } from './index';

const getKeyName = (key: string): string => {
    switch (key.toLowerCase()) {
        case 'control':
            return CTRL_KEY;
        case COMMAND_KEY_BINDING:
            return COMMAND_KEY;
        default:
            return key;
    }
};

export const reducer = (state: HotkeyEditionFieldState, action: Action): HotkeyEditionFieldState => {
    //TODO: there is an issue with with hotkeys when there is more keys. If we want more issue should be fixed
    const MAX_KEYS_IN_HOTKEY = 2;

    switch (action.type) {
        case HOTKEY_EDITION_ACTION.CHANGE_FOCUS:
            return {
                isDirty: false,
                isFocused: action.isFocused,
                keys: state.isDirty ? state.keys : [],
            };
        case HOTKEY_EDITION_ACTION.ADD_KEY:
            const key = getKeyName(action.key);

            if (!state.keys.includes(key)) {
                return {
                    ...state,
                    isDirty: true,
                    keys: [...state.keys, key].slice(-MAX_KEYS_IN_HOTKEY),
                };
            }

            return state;
    }
};
