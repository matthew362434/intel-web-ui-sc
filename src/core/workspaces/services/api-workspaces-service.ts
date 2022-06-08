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
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { WorkspaceDTO } from '../dtos';
import { CreateApiWorkspacesService, VersionEntity, WorkspacesEntity } from './workspaces-service.interface';

export const createApiWorkspacesService = (): CreateApiWorkspacesService => {
    const getWorkspaces = async (): Promise<WorkspacesEntity[]> => {
        const { data = [] } = await AXIOS.get<WorkspaceDTO[]>(API_URLS.WORKSPACES);

        return data.map(({ id, name }) => ({ workspaceId: id, workspaceName: name }));
    };

    const getProductVersion = async (): Promise<VersionEntity> => {
        const { data = '' } = await AXIOS.get(API_URLS.PRODUCT_INFO);

        return { productVersion: data['product-version'] };
    };

    return { getWorkspaces, getProductVersion };
};
