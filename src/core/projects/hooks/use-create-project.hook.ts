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
import { CreateProjectProps, DOMAIN } from '../project.interface';
import { TaskMetadata } from '../services';
import { useProjectService } from './use-project-service.hook';

interface UseCreateProjectMutation {
    workspaceId: string;
    name: string;
    domains: DOMAIN[];
    projectTypeMetadata: TaskMetadata[];
}

interface UseCreateProject {
    createProject: UseMutationResult<CreateProjectProps, AxiosError, UseCreateProjectMutation>;
}

export const useCreateProject = (): UseCreateProject => {
    const service = useProjectService().projectService;
    const { addNotification } = useNotification();
    const createProject = useMutation<CreateProjectProps, AxiosError, UseCreateProjectMutation>(
        async (args: UseCreateProjectMutation) => {
            const { workspaceId, name, domains, projectTypeMetadata } = args;

            return await service.createProject(workspaceId, name, domains, projectTypeMetadata);
        },
        {
            onError: (error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return {
        createProject,
    };
};
