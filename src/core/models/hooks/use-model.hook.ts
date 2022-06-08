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
import { ModelDetails } from '../../../pages/project-details/components/project-model/optimized-model';
import QUERY_KEYS from '../../requests/query-keys';
import { useModelsService } from './use-models-service.hook';

export const useModel = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string,
    modelVersion: number
): UseQueryResult<ModelDetails, AxiosError> => {
    const { modelService } = useModelsService();
    const { addNotification } = useNotification();

    return useQuery({
        queryKey: QUERY_KEYS.MODEL_KEY(workspaceId, projectId, architectureId, modelId),
        queryFn: () => {
            return modelService.getModel(workspaceId, projectId, architectureId, modelId, modelVersion);
        },
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
    });
};
