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

import { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { useQuery, UseQueryResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { TrainingModelStatistic } from '../../../pages/project-details/components/project-model/model-statistics';
import QUERY_KEYS from '../../requests/query-keys';
import { useModelStatisticsService } from './use-model-statistics-service.hook';

export const useModelStatistics = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string
): UseQueryResult<TrainingModelStatistic[], AxiosError> => {
    const service = useModelStatisticsService().modelStatisticsService;
    const { addNotification } = useNotification();
    return useQuery<TrainingModelStatistic[], AxiosError>({
        queryKey: QUERY_KEYS.MODEL_STATISTICS_KEY(workspaceId, projectId, architectureId, modelId),
        queryFn: () => {
            return service.getModelStatistics(workspaceId, projectId, architectureId, modelId);
        },
        onError: (error) => {
            if (error.response?.status !== StatusCodes.NOT_FOUND) {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            }
        },
        retry: 1,
    });
};
