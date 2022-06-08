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
import { useMemo } from 'react';

import { QueryObserverResult } from 'react-query';

import { useModel } from '../../../../../../core/models/hooks/use-model.hook';
import { useModelIdentifier } from '../../../../../../hooks';
import { ModelDetails } from '../../optimized-model';

export interface UseOptimizedModels {
    isImproveSpeedOptimizationVisible: boolean;
    areOptimizedModelsVisible: boolean;
    displayNNCFNoModels: boolean;
    displayPOTBtnAfterNNCF: boolean;
    displayPOTBtnNoNNCF: boolean;
    isFilterPruningDisabled: boolean;
    isFilterPruningSupported: boolean;
    displayMessageIsPOTAndNNCFNotSupported: boolean;
    isPOTModel: boolean;
    shouldRefetchModels: boolean;
    modelDetails?: ModelDetails;
    refetchModels: () => Promise<QueryObserverResult>;
}

export const useOptimizedModels = (modelVersion: number): UseOptimizedModels => {
    const { workspaceId, projectId, architectureId, modelId } = useModelIdentifier();
    const { data, refetch: refetchModels } = useModel(workspaceId, projectId, architectureId, modelId, modelVersion);

    const isNNCFModel = useMemo(
        () => !!data?.optimizedModels.find(({ optimizationType }) => optimizationType === 'NNCF'),
        [data?.optimizedModels]
    );

    const isPOTModel = useMemo(
        () => !!data?.optimizedModels.find(({ optimizationType }) => optimizationType === 'POT'),
        [data?.optimizedModels]
    );

    const isNNCFSupported = !!data?.trainedModel.optimizationCapabilities.isNNCFSupported;
    const isFilterPruningDisabled = !data?.trainedModel.optimizationCapabilities.isFilterPruningEnabled;
    const isFilterPruningSupported = !data?.trainedModel.optimizationCapabilities.isFilterPruningSupported;
    const displayNNCFNoModels = isNNCFSupported && !isNNCFModel;
    const displayPOTBtnAfterNNCF = isNNCFSupported && isNNCFModel && !isPOTModel;
    const displayPOTBtnNoNNCF = !isNNCFSupported && !isPOTModel;
    const displayMessageIsPOTAndNNCFNotSupported = !isNNCFSupported && isPOTModel;
    const isImproveSpeedOptimizationVisible = !isNNCFModel || !isPOTModel;
    const areOptimizedModelsVisible = !!data && data.optimizedModels.length > 0;
    const shouldRefetchModels = !!data?.optimizedModels.every(({ modelStatus }) => modelStatus === 'SUCCESS');

    return {
        modelDetails: data,
        isPOTModel,
        isFilterPruningDisabled,
        isFilterPruningSupported,
        isImproveSpeedOptimizationVisible,
        areOptimizedModelsVisible,
        shouldRefetchModels,
        displayMessageIsPOTAndNNCFNotSupported,
        displayNNCFNoModels,
        displayPOTBtnAfterNNCF,
        displayPOTBtnNoNNCF,
        refetchModels,
    };
};
