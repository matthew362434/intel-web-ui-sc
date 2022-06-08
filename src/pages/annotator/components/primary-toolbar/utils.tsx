// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { useEffect } from 'react';

import { DOMAIN } from '../../../../core/projects';
import { AnnotationToolContext, ToolType } from '../../core';
import { getPreviousTask, getFilterAnnotationByTask } from '../../providers/task-chain-provider/utils';
import useAvailableTools from '../../tools/available-tools';
import { ToolProps } from '../../tools/tools.interface';

export const shouldDisableTools = (annotationToolContext: AnnotationToolContext): boolean => {
    const { tasks, selectedTask, scene, toggleTool } = annotationToolContext;

    const isTaskChainProject = tasks.length > 1;

    // If it's not a task chain project, the rest of the verification is unnecessary
    if (!isTaskChainProject) {
        return false;
    }

    const previousTask = getPreviousTask(annotationToolContext, selectedTask);

    if (previousTask) {
        const annotationsFromPreviousTask = scene.annotations.filter(getFilterAnnotationByTask(previousTask));

        // If the user is on the second task and the first one has no annotations (output),
        // then we should hide all the tools and toggle the SelectTool
        if (!annotationsFromPreviousTask.length) {
            toggleTool(ToolType.SelectTool);

            return true;
        }
    }

    return false;
};

export const useDrawingTools = (activeDomains: DOMAIN[]): ToolProps[] => {
    const tools = useAvailableTools(activeDomains);

    return tools.filter(({ type }: ToolProps) => type !== ToolType.SelectTool);
};

export const useDisableTools = (annotationToolContext: AnnotationToolContext): boolean => {
    const isDisabled = shouldDisableTools(annotationToolContext);

    useEffect(() => {
        if (isDisabled && annotationToolContext.tool !== ToolType.SelectTool) {
            annotationToolContext.toggleTool(ToolType.SelectTool);
        }
    }, [annotationToolContext, isDisabled]);

    return isDisabled;
};
