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
import { ReactNode } from 'react';

import { ToggleButton, Tooltip as SpectrumTooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { Flex } from '@react-spectrum/layout';

import { ToolType } from '../../core';
import { useDrawingToolsKeyboardShortcut } from '../../hot-keys';
import { ToolProps } from '../../tools/tools.interface';
import { DrawingToolsTooltip } from './drawing-tools-tooltip.component';
import { PrimaryToolbarButtonProps } from './primary-toolbar-button.interface';
import classes from './primaryToolBar.module.scss';

interface DrawingToolButtonsProps extends PrimaryToolbarButtonProps {
    drawingTools: ToolProps[];
    isDisabled: boolean;
}

const DrawingToggleButtonShortcut = ({
    type,
    children,
    onSelect,
}: {
    children: ReactNode;
    type: ToolType;
    onSelect: () => void;
}): JSX.Element => {
    useDrawingToolsKeyboardShortcut(type, onSelect);

    return <> {children} </>;
};

export const DrawingToolButtons = ({
    drawingTools,
    activeTool,
    setActiveTool,
    isDisabled,
}: DrawingToolButtonsProps): JSX.Element => {
    return (
        <Flex
            direction='column'
            gap='size-100'
            alignItems='center'
            justify-content='center'
            data-testid='drawing-tools-container'
        >
            {drawingTools.map((tool, index) => {
                const { tooltip } = tool;
                const onSelect = () => setActiveTool(tool.type);

                return (
                    <DrawingToggleButtonShortcut type={tool.type} onSelect={onSelect} key={`tooltip-${tool}-${index}`}>
                        <TooltipTrigger placement='bottom'>
                            <ToggleButton
                                onPress={onSelect}
                                aria-label={tool.label}
                                id={tool.type.toString()}
                                isDisabled={isDisabled}
                                isSelected={tool.type === activeTool}
                                UNSAFE_className={classes.primaryToolBarBtn}
                            >
                                {<tool.Icon />}
                            </ToggleButton>
                            <SpectrumTooltip UNSAFE_className={tooltip ? classes.drawingToolsTooltips : ''}>
                                {tooltip ? <DrawingToolsTooltip {...tooltip} /> : tool.label}
                            </SpectrumTooltip>
                        </TooltipTrigger>
                    </DrawingToggleButtonShortcut>
                );
            })}
        </Flex>
    );
};
