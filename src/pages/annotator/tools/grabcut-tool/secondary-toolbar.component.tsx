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

import { ActionButton, Divider, Flex, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { Accept, Reject, New, Combine, Subtract } from '../../../../assets/icons';
import { useEventListener } from '../../../../hooks';
import { NumberSlider } from '../../../../shared/components';
import { KeyboardEvents } from '../../../../shared/keyboard-events';
import { ToolToggleButton } from '../../components/primary-toolbar/tool-toggle-button.component';
import { ToolAnnotationContextProps } from '../tools.interface';
import { useGrabcutState } from './grabcut-state-provider.component';
import { GrabcutToolType } from './grabcut-tool.enums';
import { GrabcutHotKeys } from './grabcut-tool.interface';
import { calcStrokeWidth, sensitivityConfig, sensitivityOptions } from './util';

export const SecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { scene, image } = annotationToolContext;
    const { activeTool, setActiveTool, toolsState, setToolsState, resetConfig, isLoading, inputRect, runGrabcut } =
        useGrabcutState();

    useEventListener(KeyboardEvents.KeyDown, (event: KeyboardEvent) => {
        event.preventDefault();

        if (!toolsState?.polygon) return;

        const code = event.code.toLocaleLowerCase();

        if (code.includes(GrabcutHotKeys['grabcut-foreground-tool'])) {
            setActiveTool(GrabcutToolType.ForegroundTool);
        }

        if (code.includes(GrabcutHotKeys['grabcut-background-tool'])) {
            setActiveTool(GrabcutToolType.BackgroundTool);
        }
    });

    const updateAndRunGrabcut = (sensitivity: number): void => {
        setToolsState((prev) => ({ ...prev, sensitivity }));

        const strokeWidth = calcStrokeWidth(inputRect.current?.width ?? 0);

        runGrabcut(image, strokeWidth, sensitivity);
    };

    const acceptShapes = () => {
        if (toolsState?.polygon) {
            scene.addShapes([toolsState.polygon]);

            resetConfig();
        }
    };

    return (
        <Flex direction='row' alignItems='center' justifyContent='center' gap='size-200'>
            <Text>Object selection</Text>

            <Divider orientation='vertical' size='S' />

            <ToolToggleButton
                type={GrabcutToolType.InputTool}
                label={'New selection'}
                isDisabled={isLoading}
                placement='bottom'
                isActive={activeTool === GrabcutToolType.InputTool}
                onSelect={() => setActiveTool(GrabcutToolType.InputTool)}
            >
                <New />
            </ToolToggleButton>
            <ToolToggleButton
                type={GrabcutToolType.ForegroundTool}
                label={'Add to selection'}
                isDisabled={!toolsState?.polygon || isLoading}
                placement='bottom'
                isActive={activeTool === GrabcutToolType.ForegroundTool}
                onSelect={() => setActiveTool(GrabcutToolType.ForegroundTool)}
            >
                <Combine />
            </ToolToggleButton>
            <ToolToggleButton
                type={GrabcutToolType.BackgroundTool}
                label={'Subtract from selection'}
                isDisabled={!toolsState?.polygon || isLoading}
                placement='bottom'
                isActive={activeTool === GrabcutToolType.BackgroundTool}
                onSelect={() => setActiveTool(GrabcutToolType.BackgroundTool)}
            >
                <Subtract />
            </ToolToggleButton>

            <Divider orientation='vertical' size='S' />

            <NumberSlider
                id='sensitivity'
                isDisabled={isLoading}
                displayText={(val: number) => sensitivityOptions[val]}
                label={'Sensitivity'}
                ariaLabel='Sensitivity'
                min={sensitivityConfig.min}
                max={sensitivityConfig.max}
                step={sensitivityConfig.step}
                onChange={updateAndRunGrabcut}
                defaultValue={toolsState?.sensitivity}
            />

            <Divider orientation='vertical' size='S' />

            {toolsState?.polygon && (
                <>
                    <TooltipTrigger placement='bottom' delay={0}>
                        <ActionButton isQuiet onPress={resetConfig} aria-label={'reject annotation'}>
                            <Reject />
                        </ActionButton>

                        <Tooltip>Reject annotation</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger placement='bottom' delay={0}>
                        <ActionButton isQuiet onPress={acceptShapes} aria-label={'accept annotation'}>
                            <Accept />
                        </ActionButton>

                        <Tooltip>Accept annotation</Tooltip>
                    </TooltipTrigger>
                </>
            )}
        </Flex>
    );
};
