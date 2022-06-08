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

import { useQuery } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { DatasetStatistics } from '../../../pages/project-details/components';
import QUERY_KEYS from '../../requests/query-keys';
import { TaskIdentifier } from '../dtos';
import { useDatasetStatisticsService } from './use-dataset-statistics-service.hook';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDatasetStatistics = ({ workspaceId, projectId, datasetId, taskId }: TaskIdentifier) => {
    const { addNotification } = useNotification();
    const { datasetStatisticsService } = useDatasetStatisticsService();

    return useQuery<DatasetStatistics, Error>({
        queryKey: QUERY_KEYS.DATASET_STATISTICS_KEY(projectId, datasetId, taskId ?? ''),
        queryFn: () => {
            return datasetStatisticsService.getDatasetStatistics({ workspaceId, projectId, datasetId, taskId });
        },
        onError: (e) => {
            addNotification(e.message, NOTIFICATION_TYPE.ERROR);
        },
    });
};
