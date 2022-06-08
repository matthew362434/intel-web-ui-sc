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

import { RequiredAnnotationsDetailsEntry } from '../../../core/projects/project-status.interface';
import { useProject } from '../../project-details/providers';
import { useTask } from '../providers';
import { getTaskRequiredAnnotationsDetails } from '../providers/task-provider/utils';

export interface TaskRequiredAnnotations {
    title: string;
    details: RequiredAnnotationsDetailsEntry[];
    value: number;
}

export const useRequiredAnnotations = (): TaskRequiredAnnotations[] => {
    const { selectedTask } = useTask();
    const { projectStatus } = useProject();

    const projectTasks = projectStatus?.tasks || [];

    if (selectedTask === null) {
        return projectTasks.map((projectTask) => {
            return {
                title: projectTask.title,
                details: getTaskRequiredAnnotationsDetails(projectTask),
                value: projectTask.required_annotations.value,
            };
        });
    }

    const currentTaskStatus = projectTasks.find((task) => task.id === selectedTask.id);

    return [
        {
            title: currentTaskStatus?.title || '',
            details: getTaskRequiredAnnotationsDetails(currentTaskStatus, selectedTask),
            value: currentTaskStatus?.required_annotations.value || 0,
        },
    ];
};
