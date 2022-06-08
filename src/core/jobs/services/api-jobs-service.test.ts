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

import { returnJobsByState } from '../../../shared/components/header/jobs-management/utils';
import { server } from '../../annotations/services/test-utils';
import { API_URLS } from '../../services';
import { JobDTO } from '../dtos/jobs.interface';
import { createApiJobsService } from './api-jobs-service';

const MOCKED_JOBS: JobDTO[] = [
    {
        id: 'mocked-job-1',
        name: 'Train task job',
        project_id: '123',
        description:
            'Training job for task detection in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        status: {
            state: 'running',
            message: 'detection - Training (Step 1/6)',
            progress: 21.123,
            time_remaining: 63,
        },
        metadata: {
            task: {
                model_version: 1,
                model_architecture: 'Test architecture',
                dataset_storage_id: '546352475463742342',
                name: 'Detection',
                model_template_id: '123456778',
            },
        },
    },
    {
        id: 'mocked-job-2',
        name: 'Train task job',
        project_id: '123',
        description:
            'Training job for task detection in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        status: {
            state: 'idle',
            message: 'detection - idle',
            progress: -1,
            time_remaining: -1,
        },
        metadata: {
            task: {
                model_version: 1,
                model_architecture: 'Test architecture',
                dataset_storage_id: '546352475463742342',
                name: 'Detection',
                model_template_id: '123456778',
            },
        },
    },
    {
        id: 'mocked-job-3',
        name: 'Train task job',
        project_id: '123',
        description:
            'Training job for task detection in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        status: {
            state: 'finished',
            message: 'detection - finished',
            progress: -1,
            time_remaining: -1,
        },
        metadata: {
            task: {
                model_version: 1,
                model_architecture: 'Test architecture',
                dataset_storage_id: '546352475463742342',
                name: 'Detection',
                model_template_id: '123456778',
            },
        },
    },
    {
        id: 'mocked-job-4',
        name: 'Train task job',
        project_id: '123',
        description:
            'Training job for task detection in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        status: {
            state: 'failed',
            message: 'Job failed because of some random server issue',
            progress: -1,
            time_remaining: -1,
        },
        metadata: {
            task: {
                model_version: 1,
                model_architecture: 'Test architecture',
                dataset_storage_id: '546352475463742342',
                name: 'Detection',
                model_template_id: '123456778',
            },
        },
    },
];

describe('api jobs service', () => {
    const workspaceId = 'test-workspace';
    const jobId = 'job123';
    const jobsUrl = API_URLS.JOBS(workspaceId);
    const jobUrl = API_URLS.JOB(workspaceId, jobId);
    const service = createApiJobsService();

    it('Check if delete request is called', async () => {
        server.use(
            rest.delete(`/api/${jobUrl}`, (req, res, ctx) => {
                return res(ctx.json('Deleted'));
            })
        );

        const response = await service.deleteJob(workspaceId, jobId);
        expect(response).toBe('Deleted');
    });

    it('Check if getJobs returns proper result', async () => {
        server.use(
            rest.get(`/api/${jobsUrl}`, (req, res, ctx) => {
                return res(ctx.json({ items: MOCKED_JOBS }));
            })
        );
        const jobs = await service.getJobs(workspaceId);
        expect(jobs).toHaveLength(4);

        const { failedJobs, scheduledJobs, runningJobs, finishedJobs } = returnJobsByState(jobs);

        expect(failedJobs).toHaveLength(1);
        expect(scheduledJobs).toHaveLength(1);
        expect(runningJobs).toHaveLength(1);
        expect(finishedJobs).toHaveLength(1);
    });
});
