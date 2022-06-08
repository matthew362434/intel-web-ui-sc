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

import { Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { ActionButton } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';

import { Undo, Redo } from '../../../../assets/icons';
import { useUndoRedoKeyboardShortcuts } from '../../hot-keys';
import { useUndoRedo } from '../../tools';
import classes from './primaryToolBar.module.scss';

export const UndoRedoButtons = ({ isDisabled }: { isDisabled: boolean }): JSX.Element => {
    const { undo, canUndo, redo, canRedo } = useUndoRedo();

    useUndoRedoKeyboardShortcuts('undo', canUndo, () => undo());
    useUndoRedoKeyboardShortcuts('redo', canRedo, () => redo());
    useUndoRedoKeyboardShortcuts('redoSecond', canRedo, () => redo());

    return (
        <Flex
            direction='column'
            gap='size-100'
            alignItems='center'
            justify-content='center'
            data-testid='undo-redo-tools'
        >
            <TooltipTrigger placement='right'>
                <ActionButton
                    id='undo-button'
                    data-testid='undo-button'
                    onPress={undo}
                    isDisabled={!canUndo || isDisabled}
                    UNSAFE_className={classes.primaryToolBarBtn}
                >
                    <Undo />
                </ActionButton>
                <Tooltip>Undo</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger placement='right'>
                <ActionButton
                    id='redo-button'
                    data-testid='redo-button'
                    onPress={redo}
                    isDisabled={!canRedo || isDisabled}
                    UNSAFE_className={classes.primaryToolBarBtn}
                >
                    <Redo />
                </ActionButton>
                <Tooltip>Redo</Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};
