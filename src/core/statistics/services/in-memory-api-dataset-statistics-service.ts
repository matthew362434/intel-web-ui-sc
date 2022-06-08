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
import { TaskIdentifier } from '../dtos';
import { mockedDatasetStatistics } from './utils';

interface CreateInMemoryApiDatasetStatisticsServiceInterface {
    getDatasetStatistics: (params: TaskIdentifier) => DatasetStatistics;
}

export const createInMemoryDatasetStatisticsService = (): CreateInMemoryApiDatasetStatisticsServiceInterface => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getDatasetStatistics = ({ workspaceId, projectId, datasetId, taskId }: TaskIdentifier): DatasetStatistics =>
        mockedDatasetStatistics;
    return { getDatasetStatistics };
};
