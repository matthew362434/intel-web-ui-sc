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

// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import {
    Annotation,
    containsCenterOfShape,
    getBoundingBox,
    getCenterOfShape,
    Point,
} from '../../../../core/annotations';
import { isClassificationDomain, Task } from '../../../../core/projects';
import { AnnotationScene } from '../../core';
import { TaskChainContextProps } from './task-chain-provider.component';
import { getFilterAnnotationByTask, getInputForTask } from './utils';

// This logic is temporarily moved to a stand alone function so that it can be used conditionally when
// mergin prediction annotations
export const getSceneInputs = (
    scene: AnnotationScene,
    tasks: Task[],
    selectedTask: Task | null
): TaskChainContextProps => {
    const inputs = getInputForTask({ tasks, scene }, selectedTask);

    const outputs =
        selectedTask === null ? scene.annotations : scene.annotations.filter(getFilterAnnotationByTask(selectedTask));

    const inputsWithBoundingBoxes = inputs.map((annotation) => {
        const boundingBox = getBoundingBox(annotation.shape);

        return { ...annotation, boundingBox };
    });

    const centersByAnnotationId: Record<string, Point> = outputs.reduce(
        (centers, annotation) => ({ ...centers, [annotation.id]: getCenterOfShape(annotation.shape) }),
        {}
    );

    // NOTE: for now we group each output into exactly 1 input (possibly the "empty input")
    // later we might want to group it into multiple inputs, but this would require some
    // changes to the useTaskChainOutput hook.
    const grouped = groupBy(outputs, (output) => {
        const center = centersByAnnotationId[output.id];

        // Find all input annotations that containing this output
        const inputsContainingOutput = inputsWithBoundingBoxes.filter((input) => {
            return containsCenterOfShape(input.boundingBox, center);
        });

        // Since we can only group by 1 input, we prefer one that is selected,
        // so that if a user draws an annotation that is inside of both a
        // selected input and one that is not selected, it will still be drawn
        // inside the selected input
        const selectedInput = inputsContainingOutput.find(({ isSelected }) => isSelected);
        if (selectedInput !== undefined) {
            return selectedInput.id;
        }

        // Otherwise we choose the first input or the empty input
        return inputsContainingOutput.length > 0 ? inputsContainingOutput[0].id : '_';
    });

    const inputsWithOutputs = inputs.map((annotation) => {
        // For classification (more specificly global tasks) the input and output annotations are the same
        if (selectedTask !== null && isClassificationDomain(selectedTask.domain)) {
            const containsOutputLabel = ({ labels }: Annotation) => {
                // NOTE for classification this is only false if the input does not contain classification labels
                // this can probably be simplified
                return labels.some(({ id }) => {
                    return selectedTask?.labels.some((label) => label.id === id);
                });
            };
            return { ...annotation, outputs: containsOutputLabel(annotation) ? [annotation] : [] };
        }

        const annotationOutputs = grouped[annotation.id] ?? [];

        return { ...annotation, outputs: annotationOutputs };
    });

    return {
        inputs: inputsWithOutputs,
        outputs,
    };
};

// This hook groups annotations from an annotation scene into input and output
// annotations for a selected task.
// The logic for determining wether an annotation is an input is based on its
// labels, while an annotation being an input's output is based on its shape:
// if the center of an annotation's shape lies inside of an input, it is considered
// to be its output.
export const useSceneInputs = (
    scene: AnnotationScene,
    tasks: Task[],
    selectedTask: Task | null
): TaskChainContextProps => {
    return useMemo(() => {
        return getSceneInputs(scene, tasks, selectedTask);
    }, [scene, tasks, selectedTask]);
};
