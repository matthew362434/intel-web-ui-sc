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

import { ModelDetailsDTO, OptimizedModelsDTO, TrainedModelDTO } from '../../../../../core/models/dtos';

type ModelOmitFields =
    | 'name'
    | 'fps_throughput'
    | 'target_device'
    | 'target_device_type'
    | 'previous_revision_id'
    | 'previous_trained_revision_id'
    | 'creation_date'
    | 'score'
    | 'score_up_to_date'
    | 'model_status'
    | 'optimization_capabilities'
    | 'size'
    | 'performance';

type OptimizedModelOmitFields = 'accuracyUpToDate' | 'architecture' | 'version' | 'optimizationCapabilities';

export interface TrainedModel extends Omit<TrainedModelDTO, ModelOmitFields> {
    modelName: ModelDetailsDTO['name'];
    modelSize: string;
    fpsThroughput: ModelDetailsDTO['fps_throughput'];
    creationDate: ModelDetailsDTO['creation_date'];
    targetDevice: ModelDetailsDTO['target_device'];
    targetDeviceType: ModelDetailsDTO['target_device_type'];
    accuracy: string;
    version: number;
    accuracyUpToDate: ModelDetailsDTO['score_up_to_date'];
    previousRevisionId: ModelDetailsDTO['previous_revision_id'];
    previousTrainedRevisionId: ModelDetailsDTO['previous_trained_revision_id'];
    optimizationCapabilities: {
        isFilterPruningEnabled: ModelDetailsDTO['optimization_capabilities']['is_filter_pruning_enabled'];
        isFilterPruningSupported: ModelDetailsDTO['optimization_capabilities']['is_filter_pruning_supported'];
        isNNCFSupported: ModelDetailsDTO['optimization_capabilities']['is_nncf_supported'];
    };
}

export interface OptimizedModel extends Omit<TrainedModel, OptimizedModelOmitFields> {
    modelStatus: OptimizedModelsDTO['model_status'];
    optimizationObjectives: OptimizedModelsDTO['optimization_objectives'];
    optimizationMethods: OptimizedModelsDTO['optimization_methods'];
    optimizationType: OptimizedModelsDTO['optimization_type'];
}

export interface ModelDetails {
    trainedModel: TrainedModel;
    optimizedModels: OptimizedModel[];
}
