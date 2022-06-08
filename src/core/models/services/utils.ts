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
import filesize from 'file-size';

import { ArchitectureModels } from '../../../pages/project-details/components';
import {
    ModelDetails,
    OptimizedModel,
    TrainedModel,
} from '../../../pages/project-details/components/project-model/optimized-model';
import { ModelCardProps } from '../../../pages/project-details/components/project-models/model-container/model-card';
import { sortDescending } from '../../../shared/utils';
import { Performance, PerformanceDTO } from '../../projects';
import { ModelsDTO, OptimizedModelsDTO, TrainedModelDTO, ModelDetailsDTO, ModelDTO } from '../dtos';

export const getPerformance = (performanceDTO: PerformanceDTO): Performance => {
    if (!('score' in performanceDTO)) {
        const localScore = performanceDTO.local_score === null ? null : Math.max(0, 100 * performanceDTO.local_score);

        return {
            type: 'anomaly_performance',
            localScore,
            globalScore: Math.max(0, 100 * performanceDTO.global_score),
        };
    } else {
        return {
            type: 'default_performance',
            score: Math.max(0, 100 * performanceDTO.score),
        };
    }
};

export const getModelsEntity = (modelsDTO: ModelsDTO[]): ArchitectureModels[] => {
    return modelsDTO.map(({ name, models, id, task_id, model_template_id }) => {
        const modelNameOfFirstModel = models.length ? models[0].name : '';
        const sortedModelsByCreationDate: ModelDTO[] = sortDescending(models, 'creation_date');
        const modelsEntity: ModelCardProps[] = sortedModelsByCreationDate.map((model, index) => {
            const { id: modelId, active_model, creation_date, name: architectureName, score, score_up_to_date } = model;

            const performance: Performance = getPerformance(model.performance);

            return {
                architectureName,
                id: modelId,
                version: sortedModelsByCreationDate.length - index,
                isActiveModel: active_model,
                accuracy: score > 0 ? Math.round(score * 100) : 0,
                performance,
                upToDate: score_up_to_date,
                creationDate: creation_date,
                architectureId: id,
            };
        });

        return {
            name: modelNameOfFirstModel,
            architectureId: id,
            architectureName: name,
            taskId: task_id,
            modelTemplateId: model_template_id,
            modelVersions: modelsEntity,
        };
    });
};

const getTrainedModel = (trainedModel: TrainedModelDTO, modelVersion: number): TrainedModel => {
    const {
        id,
        score,
        precision,
        latency,
        target_device_type,
        target_device,
        fps_throughput,
        name,
        size,
        architecture,
        previous_trained_revision_id,
        previous_revision_id,
        creation_date,
        score_up_to_date,
        optimization_capabilities: { is_nncf_supported, is_filter_pruning_enabled, is_filter_pruning_supported },
    } = trainedModel;

    return {
        id,
        precision,
        architecture,
        latency,
        version: modelVersion,
        modelName: name,
        modelSize: `${filesize(size).to('MB')} MB`,
        accuracy: score > 0 ? `${Math.round(score * 100)}%` : '0%',
        accuracyUpToDate: score_up_to_date,
        fpsThroughput: fps_throughput,
        creationDate: creation_date,
        previousRevisionId: previous_revision_id,
        previousTrainedRevisionId: previous_trained_revision_id,
        targetDevice: target_device,
        targetDeviceType: target_device_type,
        optimizationCapabilities: {
            isFilterPruningEnabled: is_filter_pruning_enabled,
            isFilterPruningSupported: is_filter_pruning_supported,
            isNNCFSupported: is_nncf_supported,
        },
    };
};

const getOptimizedModelsEntity = (optimizedModels: OptimizedModelsDTO[]): OptimizedModel[] => {
    return optimizedModels.map(
        ({
            id,
            target_device,
            target_device_type,
            creation_date,
            optimization_type,
            optimization_methods,
            optimization_objectives,
            name,
            score,
            performance,
            fps_throughput,
            latency,
            precision,
            previous_revision_id,
            previous_trained_revision_id,
            model_status,
            size,
        }) => {
            return {
                id,
                precision,
                latency,
                modelSize: score >= 0 ? `${filesize(size).to('MB')} MB` : '-',
                modelName: name,
                modelStatus: model_status,
                accuracy: score >= 0 ? `${Math.round(score * 100)}%` : '-',
                performance: getPerformance(performance),
                fpsThroughput: fps_throughput,
                creationDate: creation_date,
                previousRevisionId: previous_revision_id,
                previousTrainedRevisionId: previous_trained_revision_id,
                targetDevice: target_device,
                targetDeviceType: target_device_type,
                optimizationMethods: optimization_methods,
                optimizationObjectives: optimization_objectives,
                optimizationType: optimization_type,
            };
        }
    );
};

export const getModelEntity = (model: ModelDetailsDTO, modelVersion: number): ModelDetails => {
    const trainedModel: TrainedModel = getTrainedModel(model, modelVersion);

    const optimizedModels: OptimizedModel[] = getOptimizedModelsEntity(model.optimized_models);

    return {
        trainedModel,
        optimizedModels,
    };
};
