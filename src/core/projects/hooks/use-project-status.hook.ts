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
import { useQuery, UseQueryResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import QUERY_KEYS from '../../requests/query-keys';
import { ProjectStatus } from '../project-status.interface';
import { ProjectIdentifier } from '../project.interface';
import { useProjectService } from './use-project-service.hook';

export const useProjectStatus = (projectIdentifier: ProjectIdentifier): UseQueryResult<ProjectStatus, AxiosError> => {
    const { addNotification } = useNotification();
    const service = useProjectService().projectService;

    return useQuery<ProjectStatus, AxiosError>({
        queryKey: QUERY_KEYS.PROJECT_STATUS_KEY(projectIdentifier),
        queryFn: () => {
            return service.getProjectStatus(projectIdentifier);
        },
        onError: (e) => {
            addNotification(e.message, NOTIFICATION_TYPE.ERROR);
        },
        refetchInterval: 1000,
        notifyOnChangeProps: ['data'],
    });
};
