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
import { rest } from 'msw';

import { server } from '../../annotations/services/test-utils';
import { API_URLS } from '../../services';
import { createApiModelConfigParametersService } from './api-model-config-parameters-service';
import {
    mockedConfigParamData,
    mockedConfigParamDTO,
    mockedReadOnlyConfigTaskChainData,
    mockedConfigTaskChainDTO,
} from './test-utils';

jest.mock('uuid', () => ({
    v4: jest.fn(() => 1),
}));

describe('API model config parameters service', () => {
    const workspaceId = 'workspace-id';
    const projectId = 'test-project';
    const taskId = 'task-id';
    const modelId = 'model-id';
    const { getModelConfigParameters, getConfigParameters } = createApiModelConfigParametersService();

    it('should get configurable parameters for specified model', async () => {
        const modelUrl = `/api/${API_URLS.MODEL_CONFIG_PARAMETERS(workspaceId, projectId, taskId, modelId)}`;
        server.use(rest.get(modelUrl, (req, res, ctx) => res(ctx.json(mockedConfigTaskChainDTO))));
        const modelConfigParameters = await getModelConfigParameters(workspaceId, projectId, taskId, modelId);
        expect(modelConfigParameters).toEqual(mockedReadOnlyConfigTaskChainData);
    });

    it('should get configurable parameters for the tasks', async () => {
        const tasksConfigUrl = `/api/${API_URLS.CONFIGURATION_PARAMETERS(workspaceId, projectId)}`;
        server.use(rest.get(tasksConfigUrl, (req, res, ctx) => res(ctx.json(mockedConfigParamDTO))));
        const configParameters = await getConfigParameters(workspaceId, projectId);
        expect(configParameters).toEqual(mockedConfigParamData);
    });
});
