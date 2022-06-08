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

import { DatasetStatistics } from '../../../pages/project-details/components';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { DatasetStatisticsDTO, TaskIdentifier } from '../dtos';
import { getDatasetStatisticsEntity } from './utils';

interface CreateApiDatasetStatisticsInterface {
    getDatasetStatistics: (params: TaskIdentifier) => Promise<DatasetStatistics>;
}

export const createApiDatasetStatisticsService = (): CreateApiDatasetStatisticsInterface => {
    const getDatasetStatistics = async ({
        workspaceId,
        projectId,
        datasetId,
        taskId,
    }: TaskIdentifier): Promise<DatasetStatistics> => {
        const { data } = await AXIOS.get<DatasetStatisticsDTO>(
            API_URLS.ANNOTATIONS_STATISTICS({ workspaceId, projectId, datasetId, taskId })
        );

        return getDatasetStatisticsEntity(data);
    };
    return { getDatasetStatistics };
};
