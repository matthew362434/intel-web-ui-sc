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
import { ModelDTO } from './models.interface';

type ModelStatusValue = 'SUCCESS' | 'FAILED' | 'NOT_IMPROVED' | 'NOT_READY' | 'WEIGHTS_INITIALIZED';

export interface TrainedModelDTO extends Omit<ModelDTO, 'active_model'> {
    architecture: string;
    fps_throughput: number;
    latency: number;
    precision: string[] | null;
    target_device: string;
    target_device_type: string;
    previous_revision_id: string;
    previous_trained_revision_id: string;
    optimization_capabilities: {
        is_filter_pruning_enabled: boolean;
        is_filter_pruning_supported: boolean;
        is_nncf_supported: boolean;
    };
}

type OptimizationMethods = 'FILTER_PRUNING' | 'QUANTIZATION';

export interface OptimizedModelsDTO extends Omit<TrainedModelDTO, 'architecture' | 'score_up_to_date' | 'version'> {
    model_status: ModelStatusValue;
    optimization_objectives: Record<string, string>;
    optimization_methods: OptimizationMethods[];
    optimization_type: 'MO' | 'POT' | 'NNCF' | 'NONE';
}

export interface ModelDetailsDTO extends TrainedModelDTO {
    optimized_models: OptimizedModelsDTO[];
}
