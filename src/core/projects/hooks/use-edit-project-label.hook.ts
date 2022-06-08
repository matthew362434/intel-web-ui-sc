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
import { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { EditedLabel } from '../../labels';
import { DatasetIdentifier } from '../dataset.interface';
import { EditProjectProps, ProjectProps } from '../project.interface';
import { useProjectService } from './use-project-service.hook';

interface UseEditLabelParams {
    labels: EditedLabel[];
    project: EditProjectProps;
    datasetIdentifier: DatasetIdentifier;
}

interface UseEditProjectLabel {
    editLabels: UseMutationResult<ProjectProps, AxiosError, UseEditLabelParams>;
}

export const useEditProjectLabel = (): UseEditProjectLabel => {
    const service = useProjectService().projectService;
    const { addNotification } = useNotification();

    const editLabels = useMutation<ProjectProps, AxiosError, UseEditLabelParams>(
        async ({ datasetIdentifier, labels, project }: UseEditLabelParams) => {
            const { workspaceId, projectId } = datasetIdentifier;
            let tasks;

            if (project.tasks.length > 1) {
                const [firstLabel, ...restLabels] = labels;
                const [firstTask, cropTask, secondTask] = project.tasks;

                tasks = [{ ...firstTask, labels: [firstLabel] }, cropTask, { ...secondTask, labels: restLabels }];
            } else {
                const [firstTask] = project.tasks;

                tasks = [{ ...firstTask, labels: labels }];
            }

            return await service.editProject({ workspaceId, projectId }, { ...project, tasks });
        },
        {
            onError: (error: AxiosError) => {
                const message = error?.message ?? 'Labels were not updated due to an error';

                addNotification(message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return { editLabels };
};
