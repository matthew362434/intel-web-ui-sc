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

import { ComponentProps, ReactNode } from 'react';

import { Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { ToggleButton } from '@react-spectrum/button';

import { ToolType } from '../../core';
import { useDrawingToolsKeyboardShortcut } from '../../hot-keys';
import { GrabcutToolType } from '../../tools/grabcut-tool/grabcut-tool.enums';
import { SelectingToolType } from '../../tools/selecting-tool/selecting-tool.enums';
import classes from './primaryToolBar.module.scss';

interface ToolButtonProps {
    onSelect: () => void;
    label: string;
    isActive: boolean;
    isDisabled?: boolean;
    placement?: ComponentProps<typeof TooltipTrigger>['placement'];
    children: ReactNode;
    type: ToolType | GrabcutToolType | SelectingToolType;
}

export const ToolToggleButton = ({
    onSelect,
    label,
    isActive,
    type,
    placement = 'right',
    isDisabled = false,
    children,
}: ToolButtonProps): JSX.Element => {
    useDrawingToolsKeyboardShortcut(type, onSelect);

    return (
        <TooltipTrigger placement={placement}>
            <ToggleButton
                isDisabled={isDisabled}
                isSelected={isActive}
                onPress={onSelect}
                aria-label={label}
                id={type.toString()}
                UNSAFE_className={classes.primaryToolBarBtn}
            >
                {children}
            </ToggleButton>

            <Tooltip>{label}</Tooltip>
        </TooltipTrigger>
    );
};
