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

import { useEffect, useState } from 'react';

import { SelectedMediaItem } from '../../../../core/media';
import { DOMAIN, isRotatedDetectionDomain, Task } from '../../../../core/projects';
import {
    isAnomalyDomain,
    isClassificationDomain,
    isDetectionDomain,
    isSegmentationDomain,
} from '../../../../core/projects/domains';
import { usePrevious } from '../../../../hooks/use-previous/use-previous.hook';
import { useProject } from '../../../project-details/providers';
import { AnnotationScene, ANNOTATOR_MODE, ToolType } from '../../core';
import { GrabcutToolType } from '../../tools/grabcut-tool/grabcut-tool.enums';
import { PolygonMode } from '../../tools/polygon-tool/polygon-tool.enum';
import { SelectingToolType } from '../../tools/selecting-tool/selecting-tool.enums';
import { TaskChainContextProps } from '../task-chain-provider/task-chain-provider.component';
import { getSceneInputs } from '../task-chain-provider/use-scene-inputs.hook';
import { getPreviousTask } from '../task-chain-provider/utils';
import { useTask } from '../task-provider/task-provider.component';

type HotKeysActions =
    | ToolType
    | GrabcutToolType
    | SelectingToolType
    | PolygonMode.MagneticLasso
    | 'delete'
    | 'deleteSecond'
    | 'selectAll'
    | 'deselectAll'
    | 'undo'
    | 'redo'
    | 'redoSecond'
    | 'playOrPause'
    | 'nextFrame'
    | 'previousFrame'
    | 'zoom';

export type HotKeys = Record<HotKeysActions, string>;

export const defaultToolForProject = (domains: DOMAIN[]): ToolType => {
    if (domains.some(isSegmentationDomain)) {
        return ToolType.PolygonTool;
    }

    if (domains.some(isDetectionDomain)) {
        return ToolType.BoxTool;
    }

    if (domains.some(isRotatedDetectionDomain)) {
        return ToolType.RotatedBoxTool;
    }

    return ToolType.SelectTool;
};

const taskHasUserOutput = (
    selectedTask: null | Task,
    inputs: TaskChainContextProps,
    previousTask: Task | undefined
): boolean => {
    if (selectedTask !== null && isClassificationDomain(selectedTask.domain)) {
        // Task chain classification is special in that its outputs are the inputs
        const outputs = inputs.outputs.filter(({ labels }) =>
            labels.some(({ id }) => selectedTask.labels.some((label) => label.id === id))
        );

        return outputs.length > 0;
    }

    if (previousTask === undefined) {
        // There is no associated input to our outputs when we don't have a previous task,
        // so instead we always return all outputs
        return inputs.outputs.length > 0;
    }

    const outputs = inputs.inputs.flatMap((input) => input.outputs);
    return outputs.length > 0;
};

type useAnnotatorModeInterface = [ANNOTATOR_MODE, (mode: ANNOTATOR_MODE) => void];
export const useAnnotatorMode = (
    selectedMediaItem: SelectedMediaItem | undefined,
    userAnnotationScene: AnnotationScene
): useAnnotatorModeInterface => {
    const [mode, setMode] = useState(ANNOTATOR_MODE.ANNOTATION);
    const { isSingleDomainProject } = useProject();
    const isSingleAnomalyDomain = isSingleDomainProject(isAnomalyDomain);
    const { tasks, selectedTask, labels: taskLabels } = useTask();

    const previousTaskId = usePrevious(selectedTask?.id);
    const previousMediaItemIdentifier = usePrevious(selectedMediaItem?.identifier);
    const previousMediaItemPredictions = usePrevious(selectedMediaItem?.predictions);

    useEffect(() => {
        if (selectedMediaItem === undefined) {
            return;
        }

        // We only want to update the annotator mode if the user's selected task,
        // or its media have changed
        if (selectedMediaItem?.identifier === previousMediaItemIdentifier && selectedTask?.id === previousTaskId) {
            return;
        }

        // First check if the selected media item's predictions contain any predictions for this task
        const labelIdsForTask = taskLabels.map(({ id }) => id);
        const predictionsForThisTask = selectedMediaItem.predictions?.annotations.some((annotation) => {
            return annotation.labels.some(({ id }) => {
                return labelIdsForTask.includes(id);
            });
        });

        if (predictionsForThisTask !== true) {
            setMode(ANNOTATOR_MODE.ANNOTATION);
            return;
        }

        // If we have predictions for this task, we now try to determine if the user has
        // made any annotaitons for this task, in which case we show the annotation mode

        // NOTE: this should be a temporary fix, it only occurs when initialy opening
        // the annotator page, in which case the user hasn't made any changes nor
        // selected a specific task, so we will use the old non task chain logic
        const scene =
            selectedMediaItem?.identifier !== previousMediaItemIdentifier
                ? { ...userAnnotationScene, annotations: selectedMediaItem.annotations }
                : userAnnotationScene;

        const inputs = getSceneInputs(scene, tasks, selectedTask);
        const previousTask = getPreviousTask({ tasks }, selectedTask);
        const hasUserAnnotations = taskHasUserOutput(selectedTask, inputs, previousTask);

        if (!hasUserAnnotations || isSingleAnomalyDomain) {
            setMode(ANNOTATOR_MODE.PREDICTION);
        } else {
            setMode(ANNOTATOR_MODE.ANNOTATION);
        }
    }, [
        selectedMediaItem,
        previousMediaItemIdentifier,
        selectedTask,
        previousTaskId,
        userAnnotationScene,
        tasks,
        isSingleAnomalyDomain,
        taskLabels,
        previousMediaItemPredictions,
    ]);

    return [mode, setMode];
};

export const DefaultToolTypes: Omit<HotKeys, GrabcutToolType | SelectingToolType | PolygonMode.MagneticLasso> = {
    delete: 'delete',
    deleteSecond: 'backspace',
    selectAll: 'ctrl+a',
    deselectAll: 'ctrl+d',
    undo: 'ctrl+z',
    redo: 'ctrl+y',
    redoSecond: 'ctrl+shift+z',
    playOrPause: 'k',
    nextFrame: 'right',
    previousFrame: 'left',
    zoom: 'ctrl+f',
    [ToolType.SelectTool]: 'v',
    [ToolType.BoxTool]: 'b',
    [ToolType.CircleTool]: 'c',
    [ToolType.PolygonTool]: 'p',
    [ToolType.RotatedBoxTool]: 'r',
    [ToolType.GrabcutTool]: 'g',
    [ToolType.WatershedTool]: 'w',
    [ToolType.EditTool]: '/* not implemented */',
};
