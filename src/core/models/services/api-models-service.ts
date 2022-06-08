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

import { ArchitectureModels } from '../../../pages/project-details/components';
import { ModelDetails } from '../../../pages/project-details/components/project-model/optimized-model';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { ModelDetailsDTO, ModelsDTO, TrainingBodyDTO } from '../dtos';
import { OptimizeModelDTO } from '../dtos/optimize-model.interface';
import { getModelEntity, getModelsEntity } from './utils';

export interface CreateApiModelsService {
    getModels: (workspaceId: string, projectId: string) => Promise<ArchitectureModels[]>;
    getModel: (
        workspaceId: string,
        projectId: string,
        architectureId: string,
        modelId: string,
        modelVersion: number
    ) => Promise<ModelDetails>;
    getModelsByArchitecture: (
        workspaceId: string,
        projectId: string,
        architectureId: string
    ) => Promise<ArchitectureModels>;
    trainModel: (workspaceId: string, projectId: string, body: TrainingBodyDTO[]) => Promise<void>;
    optimizeModel: (
        workspaceId: string,
        projectId: string,
        architectureId: string,
        modelId: string,
        body: OptimizeModelDTO
    ) => Promise<void>;
}

export const createApiModelsService = (): CreateApiModelsService => {
    const getModels = async (workspaceId: string, projectId: string): Promise<ArchitectureModels[]> => {
        const { data } = await AXIOS.get<ModelsDTO[]>(API_URLS.MODELS(workspaceId, projectId));
        return getModelsEntity(data);
    };

    const getModelsByArchitecture = async (
        workspaceId: string,
        projectId: string,
        architectureId: string
    ): Promise<ArchitectureModels> => {
        const { data } = await AXIOS.get<ModelsDTO>(API_URLS.MODEL_GROUPS(workspaceId, projectId, architectureId));

        return getModelsEntity([data])[0];
    };

    const getModel = async (
        workspaceId: string,
        projectId: string,
        architectureId: string,
        modelId: string,
        modelVersion: number
    ): Promise<ModelDetails> => {
        const { data } = await AXIOS.get<ModelDetailsDTO>(
            API_URLS.MODEL(workspaceId, projectId, architectureId, modelId)
        );

        return getModelEntity(data, modelVersion);
    };

    const trainModel = async (workspaceId: string, projectId: string, body: TrainingBodyDTO[]): Promise<void> => {
        await AXIOS.post(API_URLS.MANUAL_TRAIN_MODEL(workspaceId, projectId), body);
    };

    const optimizeModel = async (
        workspaceId: string,
        projectId: string,
        architectureId: string,
        modelId: string,
        body: OptimizeModelDTO
    ): Promise<void> => {
        await AXIOS.post(API_URLS.OPTIMIZE_MODEL(workspaceId, projectId, architectureId, modelId), body);
    };

    return {
        getModels,
        getModel,
        getModelsByArchitecture,
        trainModel,
        optimizeModel,
    };
};
