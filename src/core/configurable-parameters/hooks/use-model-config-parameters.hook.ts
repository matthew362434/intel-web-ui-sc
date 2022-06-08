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
import { ConfigurableParametersTaskChain } from '../../../shared/components';
import QUERY_KEYS from '../../requests/query-keys';
import { useConfigParametersService } from './use-config-parameters-service.hook';

export const useModelConfigParameters = (
    workspaceId: string,
    projectId: string,
    taskId: string,
    modelId?: string,
    modelTemplateId?: string,
    editable?: boolean
): UseQueryResult<ConfigurableParametersTaskChain, AxiosError> => {
    const { configParametersService } = useConfigParametersService();
    const { addNotification } = useNotification();

    return useQuery<ConfigurableParametersTaskChain, AxiosError>({
        queryKey: QUERY_KEYS.MODEL_CONFIG_PARAMETERS(workspaceId, projectId, taskId, modelId, modelTemplateId),
        queryFn: () => {
            return configParametersService.getModelConfigParameters(
                workspaceId,
                projectId,
                taskId,
                modelId,
                modelTemplateId,
                editable
            );
        },
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
    });
};
