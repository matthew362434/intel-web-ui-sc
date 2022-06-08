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
import { createApiModelsService } from './api-models-service';
import { mockedArchitectureModels, mockedArchitectureModelsDTO } from './test-utils';

describe('Api models service', () => {
    const workspaceId = 'workspace-id';
    const projectId = 'project-id';
    const { getModels } = createApiModelsService();
    it('Should get models', async () => {
        server.use(
            rest.get(`/api/${API_URLS.MODELS(workspaceId, projectId)}`, (req, res, ctx) =>
                res(ctx.json(mockedArchitectureModelsDTO))
            )
        );
        const result = await getModels(workspaceId, projectId);
        expect(result).toEqual(mockedArchitectureModels);
    });
});
