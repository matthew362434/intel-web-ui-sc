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
import { ConfigurableParametersReconfigureDTO } from '../dtos';
import { useConfigParametersService } from './use-config-parameters-service.hook';

interface UseReconfigureParams {
    workspaceId: string;
    projectId: string;
    body: ConfigurableParametersReconfigureDTO;
}

interface UseReconfigureParameters {
    reconfigureParameters: UseMutationResult<void, AxiosError, UseReconfigureParams>;
}

export const useReconfigureParameters = (): UseReconfigureParameters => {
    const { configParametersService } = useConfigParametersService();
    const { addNotification } = useNotification();
    const reconfigureParameters = useMutation<void, AxiosError, UseReconfigureParams>(
        async ({ workspaceId, projectId, body }: UseReconfigureParams) => {
            await configParametersService.reconfigureParameters(workspaceId, projectId, body);
        },
        {
            onError: (error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return {
        reconfigureParameters,
    };
};
