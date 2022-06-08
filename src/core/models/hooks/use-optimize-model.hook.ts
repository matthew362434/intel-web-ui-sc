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
import { ModelIdentifier } from '../dtos';
import { OptimizeModelDTO } from '../dtos/optimize-model.interface';
import { useModelsService } from './use-models-service.hook';

interface UseOptimizeModelMutation extends Omit<ModelIdentifier, 'taskName'> {
    body: OptimizeModelDTO;
}

interface UseOptimizeModel {
    optimizeModel: UseMutationResult<unknown, AxiosError, UseOptimizeModelMutation>;
}

export const useOptimizeModel = (): UseOptimizeModel => {
    const { modelService } = useModelsService();
    const { addNotification } = useNotification();
    const optimizeModel = useMutation<unknown, AxiosError, UseOptimizeModelMutation>({
        mutationFn: async ({ workspaceId, projectId, architectureId, modelId, body }: UseOptimizeModelMutation) => {
            await modelService.optimizeModel(workspaceId, projectId, architectureId, modelId, body);
        },
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
    });
    return { optimizeModel };
};
