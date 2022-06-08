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

import { Key, useEffect } from 'react';

import { Flex, ActionButton, ButtonGroup, TooltipTrigger, Tooltip } from '@adobe/react-spectrum';
import { Divider } from '@react-spectrum/divider';
import { Text } from '@react-spectrum/text';

import { WatershedTool } from '.';
import { Reject, Accept } from '../../../../assets/icons';
import { filterOutExclusiveLabel } from '../../../../shared/utils';
import { ToolSettings, ToolType } from '../../core';
import { useTask } from '../../providers';
import { ToolAnnotationContextProps } from '../tools.interface';
import { BrushSizeSlider } from './brushsize-slider.component';
import { LabelPicker } from './label-picker.component';
import classes from './secondary-toolbar.module.scss';
import { SensitivitySlider } from './sensitivity-slider.component';
import { BACKGROUND_LABEL, brushSizeSliderConfig, formatAndAddAnnotations } from './utils';
import { useWatershedState } from './watershed-state-provider.component';
import { WatershedLabel } from './watershed-tool.interface';

export const SecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { reset, shapes, setShapes, undoRedoActions } = useWatershedState();

    const { updateToolSettings, getToolSettings, scene } = annotationToolContext;

    const { tasks } = useTask();

    const watershedSupportedDomains = WatershedTool.supportedDomains;

    const taskLabels = tasks
        .filter((task) => watershedSupportedDomains.includes(task.domain))
        .flatMap((task) => task.labels);

    const shouldShowConfirmCancel = shapes.watershedPolygons.length || shapes.markers.length;
    const [backgroundLabel, ...availableLabels]: WatershedLabel[] = [
        { markerId: 1, label: BACKGROUND_LABEL },
        ...filterOutExclusiveLabel(taskLabels).map((label, idx) => ({
            markerId: idx + 2,
            label,
        })),
    ];

    const settings = getToolSettings(ToolType.WatershedTool) as ToolSettings[ToolType.WatershedTool];

    const handleSelectLabel = (key: Key): void => {
        const selectedLabel = [backgroundLabel, ...availableLabels].find(({ label }) => label.name === `${key}`);

        if (selectedLabel) {
            updateToolSettings(ToolType.WatershedTool, {
                brushSize: settings.brushSize || brushSizeSliderConfig.defaultValue,
                label: selectedLabel,
                sensitivity: settings.sensitivity,
            });
        }
    };

    const handleSelectSensitivity = (key: Key): void => {
        updateToolSettings(ToolType.WatershedTool, {
            brushSize: settings.brushSize,
            label: settings.label,
            sensitivity: Number(key),
        });
    };

    const handleSelectBrushSize = (key: Key): void => {
        updateToolSettings(ToolType.WatershedTool, {
            brushSize: Math.max(brushSizeSliderConfig.min, Number(key)),
            label: settings.label,
            sensitivity: settings.sensitivity,
        });
    };

    const handleConfirmAnnotation = (): void => {
        formatAndAddAnnotations(shapes.watershedPolygons, scene.addAnnotations);

        // After we make an annotation we should reset the markers and polygons
        setShapes({ markers: [], watershedPolygons: [] });

        // Reset the undoRedo state
        undoRedoActions.reset();
    };

    const handleCancelAnnotation = (): void => {
        reset();
    };

    useEffect(() => {
        // Update the default label on tool settings upon mount
        updateToolSettings(ToolType.WatershedTool, {
            brushSize: settings.brushSize || brushSizeSliderConfig.defaultValue,
            label: availableLabels[0],
            sensitivity: settings.sensitivity,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Flex direction='row' alignItems='center' justifyContent='center' gap='size-125'>
            <Text>Object coloring</Text>

            <Divider orientation='vertical' size='S' UNSAFE_className={classes.divider} />

            <Flex alignItems='center' gap='size-100'>
                <LabelPicker
                    availableLabels={availableLabels}
                    backgroundLabel={backgroundLabel}
                    handleSelectLabel={handleSelectLabel}
                />
            </Flex>

            <Divider orientation='vertical' size='S' UNSAFE_className={classes.divider} />

            <SensitivitySlider onSelectSensitivity={handleSelectSensitivity} />

            <Divider orientation='vertical' size='S' UNSAFE_className={classes.divider} />

            <BrushSizeSlider onSelectBrushSize={handleSelectBrushSize} />

            {shouldShowConfirmCancel ? (
                <>
                    <Divider orientation='vertical' size='S' />
                    <ButtonGroup>
                        <TooltipTrigger placement='bottom' delay={0}>
                            <ActionButton
                                isQuiet
                                onPress={handleConfirmAnnotation}
                                isDisabled={!shapes.watershedPolygons.length}
                                id={'confirm-watershed-annotation'}
                                aria-label={'confirm-annotation'}
                            >
                                <Accept />
                            </ActionButton>

                            <Tooltip>Confirm annotation</Tooltip>
                        </TooltipTrigger>
                        <TooltipTrigger placement='bottom' delay={0}>
                            <ActionButton
                                isQuiet
                                onPress={handleCancelAnnotation}
                                id={'cancel-watershed-annotation'}
                                aria-label={'cancel-annotation'}
                            >
                                <Reject />
                            </ActionButton>

                            <Tooltip>Reject annotation</Tooltip>
                        </TooltipTrigger>
                    </ButtonGroup>
                </>
            ) : null}
        </Flex>
    );
};
