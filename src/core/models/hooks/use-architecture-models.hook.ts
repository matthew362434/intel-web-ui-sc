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
import { ArchitectureModels } from '../../../pages/project-details/components';
import QUERY_KEYS from '../../requests/query-keys';
import { useModelsService } from './use-models-service.hook';

export const useArchitectureModels = (
    workspaceId: string,
    projectId: string,
    architectureId: string
): UseQueryResult<ArchitectureModels, AxiosError> => {
    const service = useModelsService().modelService;
    const { addNotification } = useNotification();

    return useQuery<ArchitectureModels, AxiosError>({
        queryKey: QUERY_KEYS.MODELS_ARCHITECTURE(workspaceId, projectId, architectureId),
        queryFn: () => {
            return service.getModelsByArchitecture(workspaceId, projectId, architectureId);
        },
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
    });
};
