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

import { createContext, ReactNode, useContext, useState } from 'react';

import { MissingProviderError } from '../../../../shared/missing-provider-error';
import {
    AnnotationScene,
    AnnotationToolContext as AnnotationToolContextProps,
    ToolSettings,
    ToolType,
} from '../../core';
import { useZoom } from '../../zoom';
import { useAnnotationScene } from '../annotation-scene-provider/annotation-scene-provider.component';
import { AnnotatorContextProps, useAnnotator } from '../annotator-provider/annotator-provider.component';
import { useTask } from '../task-provider/task-provider.component';

interface AnnotationToolProviderProps {
    children: ReactNode;
}

const AnnotationToolContext = createContext<AnnotationToolContextProps | undefined>(undefined);

const DEFAULT_TOOLS_SETTINGS = new Map([
    [
        ToolType.CircleTool,
        {
            size: 20,
        },
    ],
    [
        ToolType.WatershedTool,
        {
            brushSize: 2,
            sensitivity: 2,
        },
    ],
]);

export const AnnotationToolProvider = ({ children }: AnnotationToolProviderProps): JSX.Element => {
    const { tasks, selectedTask, activeDomains, defaultLabel } = useTask();
    const scene: AnnotationScene = useAnnotationScene();
    const { activeTool, setActiveTool, selectedMediaItem, mode }: AnnotatorContextProps = useAnnotator();

    const [toolsSettings, setToolsSettings] =
        useState<Map<ToolType, ToolSettings[keyof ToolSettings]>>(DEFAULT_TOOLS_SETTINGS);
    const { zoomState } = useZoom();

    const image = selectedMediaItem === undefined ? new Image() : selectedMediaItem.image;

    const getToolSettings = (type: ToolType): ToolSettings[keyof ToolSettings] | undefined => {
        return toolsSettings.get(type);
    };

    const updateToolSettings = (type: ToolType, settings: ToolSettings[keyof ToolSettings]): void => {
        setToolsSettings(new Map(toolsSettings.set(type, settings)));
    };

    const toggleTool = (tool: ToolType): void => {
        setActiveTool(tool);
    };

    const value: AnnotationToolContextProps = {
        zoomState,
        tool: activeTool,
        scene,
        image,
        mode,
        defaultLabel,
        getToolSettings,
        updateToolSettings,
        toggleTool,
        tasks,
        selectedTask,
        activeDomains,
    };

    return <AnnotationToolContext.Provider value={value}>{children}</AnnotationToolContext.Provider>;
};

export const useAnnotationToolContext = (): AnnotationToolContextProps => {
    const context = useContext(AnnotationToolContext);

    if (context === undefined) {
        throw new MissingProviderError('useAnnotationToolContext', 'AnnotationToolProvider');
    }

    return context;
};
