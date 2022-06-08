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

import { useEffect } from 'react';

import { Divider, Slider, ToggleButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import Brush from '@spectrum-icons/workflow/Brush';

import BrushImg from '../../../../../assets/primary-tools/brush.gif';
import { DrawingToolsTooltip } from '../../../components/primary-toolbar/drawing-tools-tooltip.component';
import { ToolType } from '../../../core';
import { useContainerBoundingBox } from '../../../hooks/use-container-bondingbox.hook';
import { PolygonSelectionToolbarProps } from '../../tools.interface';
import { blurActiveInput } from '../../utils';
import { useSelectingState } from '../selecting-state-provider.component';
import { SelectingToolLabel, SelectingToolType } from '../selecting-tool.enums';
import classes from '../selecting-tool.module.scss';
import { getBrushMaxSize } from '../utils';

const PolygonSelectionToolbar = ({ annotationToolContext, showToolbar }: PolygonSelectionToolbarProps): JSX.Element => {
    const { image, updateToolSettings } = annotationToolContext;
    const toolContainer = useContainerBoundingBox(image);
    const maxBrushSize = getBrushMaxSize(toolContainer);
    const { activeTool, setActiveTool, brushSize, setBrushSize, setShowCirclePreview } = useSelectingState();

    useEffect(() => {
        setBrushSize(Math.round(maxBrushSize * 0.1));
    }, [setBrushSize, maxBrushSize]);

    if (!showToolbar) return <></>;

    return (
        <>
            <TooltipTrigger placement='bottom'>
                <ToggleButton
                    aria-label={SelectingToolLabel.BrushTool}
                    id={SelectingToolType.BrushTool.toString()}
                    UNSAFE_className={classes.primaryToolBarBtn}
                    isSelected={activeTool === SelectingToolType.BrushTool}
                    onPress={() => {
                        setActiveTool(SelectingToolType.BrushTool);
                        updateToolSettings(ToolType.SelectTool, { isBrushSubTool: true });
                    }}
                >
                    <Brush />
                </ToggleButton>
                <Tooltip UNSAFE_className={classes.drawingToolsTooltips}>
                    <DrawingToolsTooltip
                        img={BrushImg}
                        title='Brush tool'
                        url='/docs/guide/annotations/annotation-tools.html#selector-tool'
                        description='Edit selected polygon using brush by pushing vertices inwards or outwards.'
                    />
                </Tooltip>
            </TooltipTrigger>

            <Divider orientation='vertical' size='S' />
            {activeTool === SelectingToolType.BrushTool && (
                <Slider
                    minValue={5}
                    value={brushSize}
                    labelPosition='side'
                    aria-label='brush-size'
                    label={'Brush size'}
                    onChange={(size) => {
                        setBrushSize(size);
                        setShowCirclePreview(true);
                    }}
                    onChangeEnd={() => {
                        setShowCirclePreview(false);
                        blurActiveInput(true);
                    }}
                    maxValue={maxBrushSize}
                />
            )}
        </>
    );
};

export default PolygonSelectionToolbar;
