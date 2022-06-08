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
import { Annotation } from '../../../../core/annotations';
import { isClassificationDomain } from '../../../../core/projects/domains';
import { AnnotationToolContext } from '../../core';
import { useTaskChain } from './task-chain-provider.component';
import { getPreviousTask } from './utils';

// NOTE: this hook might be refactored later on
export const useTaskChainOutput = (
    annotationToolContext: Pick<AnnotationToolContext, 'tasks' | 'selectedTask'>
): Annotation[] => {
    const { inputs, outputs } = useTaskChain();

    const { selectedTask, tasks } = annotationToolContext;
    const previousTask = getPreviousTask(annotationToolContext, annotationToolContext.selectedTask);

    if (previousTask === undefined) {
        // There is no associated input to our outputs when we don't have a previous task,
        // so instead we always return all outputs
        return [...outputs];
    }

    const isTaskChainSelectedClassification =
        tasks.length > 1 && selectedTask !== null && isClassificationDomain(selectedTask.domain);
    if (isTaskChainSelectedClassification) {
        // Task chain classification is special in that its outputs are the inputs
        return [...inputs];
    }

    return inputs.filter(({ isSelected }) => isSelected).flatMap((input) => input.outputs);
};
