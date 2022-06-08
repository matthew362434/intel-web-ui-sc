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
import { QueryObserverOptions, useQuery, UseQueryResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import QUERY_KEYS from '../../requests/query-keys';
import { JobProps, JobState, JobType } from '../job.interface';
import { useJobsService } from './use-jobs-service.hook';

export const useJobs = (
    workspaceId: string,
    jobState?: JobState,
    jobType?: JobType,
    projectId?: string,
    options: QueryObserverOptions<JobProps[], AxiosError> = {}
): UseQueryResult<JobProps[]> => {
    const { addNotification } = useNotification();
    const { jobsService } = useJobsService();
    return useQuery<JobProps[], AxiosError>({
        queryKey: QUERY_KEYS.JOBS_KEY(workspaceId),
        queryFn: () => {
            return jobsService.getJobs(workspaceId, jobState, jobType, projectId);
        },
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
        refetchInterval: 1000,
        notifyOnChangeProps: ['data', 'isLoading'],
        ...options,
    });
};
