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
import { ConfigurableParametersReconfigureDTO } from '../dtos';
import { CreateApiModelConfigParametersService } from './api-model-config-parameters-service';
import { mockedReadOnlyConfigTaskChainData, mockedConfigParamData } from './test-utils';

export const createInMemoryApiModelConfigParametersService = (): CreateApiModelConfigParametersService => {
    const getModelConfigParameters = async (
        _workspaceId: string,
        _projectId: string,
        _taskId: string,
        _modelId?: string,
        _modelTemplateId?: string,
        _editable?: boolean
    ): Promise<ConfigurableParametersTaskChain> => {
        return Promise.resolve(mockedReadOnlyConfigTaskChainData);
    };

    const getConfigParameters = async (
        _workspaceId: string,
        _projectId: string
    ): Promise<ConfigurableParametersTaskChain[]> => {
        return Promise.resolve(mockedConfigParamData);
    };

    const reconfigureParameters = async (
        _workspaceId: string,
        _projectId: string,
        _body: ConfigurableParametersReconfigureDTO
    ): Promise<void> => {
        return Promise.resolve();
    };

    return {
        getModelConfigParameters,
        getConfigParameters,
        reconfigureParameters,
    };
};
