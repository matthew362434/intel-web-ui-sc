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

import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import QUERY_KEYS from '../../requests/query-keys';
import { ProjectIdentifier, ProjectProps } from '../project.interface';
import { useProjectService } from './use-project-service.hook';

interface UseDeleteProject {
    deleteProject: UseMutationResult<string, Error, ProjectIdentifier>;
}

export const useDeleteProject = (): UseDeleteProject => {
    const service = useProjectService().projectService;
    const client = useQueryClient();

    const { addNotification } = useNotification();

    const deleteProject = useMutation<string, Error, ProjectIdentifier>(
        async ({ workspaceId, projectId }: ProjectIdentifier) => {
            return await service.deleteProject({ workspaceId, projectId });
        },
        {
            onSuccess: (_, variables: ProjectIdentifier) => {
                const { workspaceId, projectId } = variables;

                client.setQueryData<ProjectProps[]>(QUERY_KEYS.PROJECTS_KEY(workspaceId), (oldData) =>
                    oldData ? oldData.filter((prevProject) => prevProject.id !== projectId) : []
                );
            },
            onError: (error: Error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return { deleteProject };
};
