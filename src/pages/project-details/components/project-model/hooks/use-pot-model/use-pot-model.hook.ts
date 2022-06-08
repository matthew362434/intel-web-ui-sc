// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { useEffect } from 'react';

import { useQueryClient } from 'react-query';

import { OptimizeModelDTO } from '../../../../../../core/models/dtos/optimize-model.interface';
import { useOptimizeModel } from '../../../../../../core/models/hooks';
import QUERY_KEYS from '../../../../../../core/requests/query-keys';
import { useModelIdentifier } from '../../../../../../hooks';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../../notification';
import { STARTED_OPTIMIZATION } from '../../optimized-model/utils';

interface UsePOTModel {
    optimizePOTModel: () => void;
}

export const usePOTModel = (): UsePOTModel => {
    const modelIdentifier = useModelIdentifier();
    const { optimizeModel } = useOptimizeModel();
    const { addNotification } = useNotification();
    const queryClient = useQueryClient();

    const optimizePOTModel = (): void => {
        const body: OptimizeModelDTO = {
            enable_nncf_optimization: false,
            enable_pot_optimization: true,
            optimization_parameters: {
                pot: {},
                nncf: undefined,
            },
        };

        const { workspaceId, projectId, architectureId, modelId } = modelIdentifier;
        optimizeModel.mutate(
            { workspaceId, projectId, architectureId, modelId, body },
            {
                onSuccess: async () => {
                    await queryClient.invalidateQueries(
                        QUERY_KEYS.MODEL_KEY(workspaceId, projectId, architectureId, modelId)
                    );
                },
            }
        );
    };

    useEffect(() => {
        return () => {
            optimizeModel.isSuccess && addNotification(STARTED_OPTIMIZATION, NOTIFICATION_TYPE.DEFAULT);
        };
    }, [addNotification, optimizeModel]);

    return {
        optimizePOTModel,
    };
};
