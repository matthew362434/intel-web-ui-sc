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

/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArchitectureModels } from '../../../pages/project-details/components';
import { ModelDetails } from '../../../pages/project-details/components/project-model/optimized-model';
import { TrainingBodyDTO } from '../dtos';
import { OptimizeModelDTO } from '../dtos/optimize-model.interface';
import { CreateApiModelsService } from './api-models-service';
import { mockedArchitectureModels, mockedOptimizedModels, mockedTrainedModel } from './test-utils';

export const createInMemoryModelsService = (): CreateApiModelsService => {
    const getModels = async (_workspaceId = 'workspaceId', _projectId = 'projectId'): Promise<ArchitectureModels[]> =>
        Promise.resolve(mockedArchitectureModels);

    const getModel = async (
        _workspaceId: string,
        _projectId: string,
        _architectureId: string,
        _modelId: string,
        _modelVersion: number
    ): Promise<ModelDetails> => {
        return Promise.resolve({
            trainedModel: mockedTrainedModel,
            optimizedModels: mockedOptimizedModels,
        });
    };

    const getModelsByArchitecture = async (
        _workspaceId: string,
        _projectId: string,
        _architectureId: string
    ): Promise<ArchitectureModels> => {
        return Promise.resolve(mockedArchitectureModels[0]);
    };

    const trainModel = async (_workspaceId: string, _projectId: string, _body: TrainingBodyDTO[]): Promise<void> => {
        await Promise.resolve();
    };

    const optimizeModel = async (
        _workspaceId: string,
        _projectId: string,
        _architectureId: string,
        _modelId: string,
        _body: OptimizeModelDTO
    ): Promise<void> => {
        await Promise.resolve();
    };

    return { getModels, getModel, getModelsByArchitecture, trainModel, optimizeModel };
};
