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
import { JobProps } from '../job.interface';
import { mockedJobs } from '../utils';
import { JobsService } from './jobs-service.interface';

export const createInMemoryJobsService = (): JobsService => {
    const getJobsList = async (): Promise<JobProps[]> => {
        return Promise.resolve(mockedJobs);
    };

    const resolveAfter2Seconds = (jobId: string): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Job with ID ${jobId} is successfully deleted.`);
            }, 2000);
        });
    };

    const deleteJob = async (workspaceId: string, jobId: string): Promise<string> => {
        if (jobId === 'job-2') {
            return Promise.reject({
                response: {
                    data: {
                        message: 'Job cannot be deleted just because',
                    },
                },
            });
        } else if (jobId === 'job-3') {
            return Promise.reject({
                message: 'Some error occurred',
            });
        } else {
            return await resolveAfter2Seconds(jobId);
        }
    };

    return { getJobs: getJobsList, deleteJob };
};
