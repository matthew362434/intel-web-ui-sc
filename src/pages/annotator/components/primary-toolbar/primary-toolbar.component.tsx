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

import { Provider } from '@adobe/react-spectrum';
import { Divider } from '@react-spectrum/divider';
import { Flex } from '@react-spectrum/layout';
import { View } from '@react-spectrum/view';

import { ANNOTATOR_MODE } from '../../core';
import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import { ActionButtons } from './action-buttons.component';
import { DrawingToolButtons } from './drawing-tool-buttons.component';
import classes from './primaryToolBar.module.scss';
import { SelectToolButton } from './select-tool-button.component';
import { UndoRedoButtons } from './undo-redo-buttons.component';
import { useDisableTools, useDrawingTools } from './utils';

export const PrimaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { mode, tool, toggleTool, activeDomains } = annotationToolContext;

    const disabledTools = useDisableTools(annotationToolContext);

    const drawingTools = useDrawingTools(activeDomains);

    return (
        <View gridArea='primaryToolbar' backgroundColor='gray-200' padding='size-100' id={'annotator-toolbar'}>
            <Provider isQuiet>
                <Flex
                    direction='column'
                    gap='size-100'
                    alignItems='center'
                    justify-content='center'
                    UNSAFE_className={classes.primaryToolBar}
                >
                    <SelectToolButton activeTool={tool} setActiveTool={toggleTool} />

                    {mode === ANNOTATOR_MODE.ANNOTATION && (
                        <>
                            <Divider size='S' marginY='size-100' UNSAFE_className={classes.primaryToolBarDivider} />

                            {drawingTools.length > 0 ? (
                                <>
                                    <DrawingToolButtons
                                        activeTool={tool}
                                        setActiveTool={toggleTool}
                                        drawingTools={drawingTools}
                                        isDisabled={disabledTools}
                                    />

                                    <Divider
                                        size='S'
                                        marginY='size-100'
                                        UNSAFE_className={classes.primaryToolBarDivider}
                                    />
                                </>
                            ) : (
                                <></>
                            )}

                            <UndoRedoButtons isDisabled={disabledTools} />

                            <Divider size='S' marginY='size-100' UNSAFE_className={classes.primaryToolBarDivider} />
                        </>
                    )}
                    <ActionButtons annotationToolContext={annotationToolContext} />
                </Flex>
            </Provider>
        </View>
    );
};
