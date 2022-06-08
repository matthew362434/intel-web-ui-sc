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
import { JobDTO } from '../dtos/jobs.interface';
import { JobProps, JobState, JobType } from '../job.interface';
import { getJobEntity } from '../utils';
import { JobsService } from './jobs-service.interface';

export const createApiJobsService = (): JobsService => {
    const getJobsList = async (
        workspaceId: string,
        jobState?: JobState,
        jobType?: JobType,
        projectId?: string
    ): Promise<JobProps[]> => {
        const url = API_URLS.JOBS_QUERY_PARAMS(workspaceId, jobState, jobType, projectId);
        const { data } = await AXIOS.get<{ items: JobDTO[] }>(url);
        return data.items.map((serverJobs: JobDTO) => getJobEntity(serverJobs));
    };

    const deleteJob = async (workspaceId: string, jobId: string): Promise<string> => {
        const url = API_URLS.JOB(workspaceId, jobId);
        const response = await AXIOS.delete(url);
        return response.data;
    };

    return { getJobs: getJobsList, deleteJob };
};
