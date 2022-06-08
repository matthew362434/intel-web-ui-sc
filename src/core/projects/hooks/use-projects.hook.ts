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
import { useQuery, UseQueryResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import QUERY_KEYS from '../../requests/query-keys';
import { ProjectProps } from '../project.interface';
import { useProjectService } from './use-project-service.hook';

export const useProjects = (workspaceId: string): UseQueryResult<ProjectProps[]> => {
    const service = useProjectService().projectService;
    const { addNotification } = useNotification();

    const ERROR_MESSAGE = 'Failed to load the projects - something went wrong. Please, try again later.';

    return useQuery<ProjectProps[]>({
        queryKey: QUERY_KEYS.PROJECTS_KEY(workspaceId),
        queryFn: () => {
            return service.getProjects(workspaceId);
        },
        onError: () => {
            addNotification(ERROR_MESSAGE, NOTIFICATION_TYPE.ERROR);
        },
    });
};
