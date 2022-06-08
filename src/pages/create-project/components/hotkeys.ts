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

// TODO: replace `platform` by `userAgentData` once it's fully deprecated
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform
const isMacOS = navigator.platform?.toLowerCase().includes('mac');

export const CTRL_KEY = 'ctrl';
export const COMMAND_KEY = 'cmd';
export const COMMAND_KEY_BINDING = 'meta'; // Command key on Mac binds to 'meta'
export const ALT_KEY = 'alt';
export const SHIFT_KEY = 'shift';

export const CTRL_OR_COMMAND_KEY = isMacOS ? COMMAND_KEY : CTRL_KEY;

export const DEFAULT_HOTKEY = `${CTRL_OR_COMMAND_KEY}+0`;

export const AVAILABLE_HOTKEYS = [
    `${CTRL_OR_COMMAND_KEY}+1`,
    `${CTRL_OR_COMMAND_KEY}+2`,
    `${CTRL_OR_COMMAND_KEY}+3`,
    `${CTRL_OR_COMMAND_KEY}+4`,
    `${CTRL_OR_COMMAND_KEY}+5`,
    `${CTRL_OR_COMMAND_KEY}+6`,
    `${CTRL_OR_COMMAND_KEY}+7`,
    `${CTRL_OR_COMMAND_KEY}+8`,
    `${CTRL_OR_COMMAND_KEY}+9`,
    //
    `${ALT_KEY}+1`,
    `${ALT_KEY}+2`,
    `${ALT_KEY}+3`,
    `${ALT_KEY}+4`,
    `${ALT_KEY}+5`,
    `${ALT_KEY}+6`,
    `${ALT_KEY}+7`,
    `${ALT_KEY}+8`,
    `${ALT_KEY}+9`,
    //
    `${SHIFT_KEY}+1`,
    `${SHIFT_KEY}+2`,
    `${SHIFT_KEY}+3`,
    `${SHIFT_KEY}+4`,
    `${SHIFT_KEY}+5`,
    `${SHIFT_KEY}+6`,
    `${SHIFT_KEY}+7`,
    `${SHIFT_KEY}+8`,
    `${SHIFT_KEY}+9`,
];

export const ctrlCommandBinding = (hotkey?: string): string => {
    if (!hotkey) {
        return '';
    }

    if (isMacOS && hotkey.includes(CTRL_KEY)) {
        return hotkey.replace(CTRL_KEY, COMMAND_KEY_BINDING);
    } else if (!isMacOS && hotkey.includes(COMMAND_KEY)) {
        return hotkey.replace(COMMAND_KEY_BINDING, CTRL_KEY);
    }

    return hotkey;
};
