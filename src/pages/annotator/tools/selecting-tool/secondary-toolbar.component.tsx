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

import { Divider, Flex, Text } from '@adobe/react-spectrum';
import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';

import { Annotation } from '../../../../core/annotations';
import { isClassificationDomain } from '../../../../core/projects';
import { ToolToggleButton } from '../../components/primary-toolbar/tool-toggle-button.component';
import { ToolType } from '../../core';
import { getOutputFromTask } from '../../providers/task-chain-provider/utils';
import { ToolAnnotationContextProps } from '../tools.interface';
import PolygonSelectionToolbar from './components/polygon-selection-toolbar.component';
import { useSelectingState } from './selecting-state-provider.component';
import { SelectingToolLabel, SelectingToolType } from './selecting-tool.enums';
import { getSelectedPolygonAnnotations } from './utils';

const SecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { updateToolSettings, selectedTask } = annotationToolContext;

    const showSubTools = selectedTask && !isClassificationDomain(selectedTask.domain);
    const { activeTool, setActiveTool } = useSelectingState();
    const polygonAnnotations = getSelectedPolygonAnnotations(
        getOutputFromTask(annotationToolContext, selectedTask) as Annotation[]
    );

    useEffect(() => {
        //Deselect brushing tool when there is more than one polygon selected
        if (polygonAnnotations.length !== 1) {
            setActiveTool(SelectingToolType.SelectionTool);
            updateToolSettings(ToolType.SelectTool, { isBrushSubTool: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [polygonAnnotations.length]);

    return (
        <Flex direction='row' alignItems='center' justifyContent='center' gap='size-200'>
            <Text>Selector</Text>
            <Divider orientation='vertical' size='S' />

            {showSubTools && (
                <>
                    <ToolToggleButton
                        placement='bottom'
                        type={SelectingToolType.SelectionTool}
                        label={SelectingToolLabel.SelectionTool}
                        isActive={activeTool === SelectingToolType.SelectionTool}
                        onSelect={() => {
                            setActiveTool(SelectingToolType.SelectionTool);
                            updateToolSettings(ToolType.SelectTool, { isBrushSubTool: false });
                        }}
                    >
                        <AnnotatePen />
                    </ToolToggleButton>

                    <PolygonSelectionToolbar
                        annotationToolContext={annotationToolContext}
                        showToolbar={polygonAnnotations.length === 1}
                    />
                </>
            )}
        </Flex>
    );
};

export default SecondaryToolbar;
