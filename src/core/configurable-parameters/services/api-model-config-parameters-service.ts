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
import { ConfigurableParametersTaskChain } from '../../../shared/components';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import {
    ConfigurableParametersTaskChainDTO,
    ConfigurableParametersDTO,
    ConfigurableParametersReconfigureDTO,
} from '../dtos';
import { getConfigParametersEntity, getModelConfigEntity } from './utils';

export interface CreateApiModelConfigParametersService {
    getModelConfigParameters: (
        workspaceId: string,
        projectId: string,
        taskId: string,
        modelId?: string,
        modelTemplateId?: string,
        editable?: boolean
    ) => Promise<ConfigurableParametersTaskChain>;

    getConfigParameters: (workspaceId: string, projectId: string) => Promise<ConfigurableParametersTaskChain[]>;

    reconfigureParameters: (
        workspaceId: string,
        projectId: string,
        body: ConfigurableParametersReconfigureDTO
    ) => Promise<void>;
}

export const createApiModelConfigParametersService = (): CreateApiModelConfigParametersService => {
    const getModelConfigParameters = async (
        workspaceId: string,
        projectId: string,
        taskId: string,
        modelId?: string,
        modelTemplateId?: string,
        editable?: boolean
    ): Promise<ConfigurableParametersTaskChain> => {
        const { data } = await AXIOS.get<ConfigurableParametersTaskChainDTO>(
            API_URLS.MODEL_CONFIG_PARAMETERS(workspaceId, projectId, taskId, modelId, modelTemplateId)
        );

        return getModelConfigEntity(data, editable);
    };

    const getConfigParameters = async (
        workspaceId: string,
        projectId: string
    ): Promise<ConfigurableParametersTaskChain[]> => {
        const { data } = await AXIOS.get<ConfigurableParametersDTO>(
            API_URLS.CONFIGURATION_PARAMETERS(workspaceId, projectId)
        );

        return getConfigParametersEntity(data);
    };

    const reconfigureParameters = async (
        workspaceId: string,
        projectId: string,
        body: ConfigurableParametersReconfigureDTO
    ) => {
        await AXIOS.post(API_URLS.CONFIGURATION_PARAMETERS(workspaceId, projectId), body);
    };

    return {
        getModelConfigParameters,
        getConfigParameters,
        reconfigureParameters,
    };
};
