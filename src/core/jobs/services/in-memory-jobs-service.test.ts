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

import { returnJobsByState } from '../../../shared/components/header/jobs-management/utils';
import { createInMemoryJobsService } from './in-memory-jobs-service';

describe('api jobs service', () => {
    const workspaceId = 'test-workspace';
    const jobId = 'job123';
    const service = createInMemoryJobsService();

    it('Check if delete returns proper result', async () => {
        const response = await service.deleteJob(workspaceId, jobId);
        expect(response).toBe('Job with ID job123 is successfully deleted.');
    });

    it('Check if getJobs returns proper result', async () => {
        const jobs = await service.getJobs(workspaceId);
        expect(jobs).toHaveLength(3);

        const { failedJobs, scheduledJobs, runningJobs, finishedJobs } = returnJobsByState(jobs);

        expect(failedJobs).toHaveLength(2);
        expect(scheduledJobs).toHaveLength(0);
        expect(runningJobs).toHaveLength(1);
        expect(finishedJobs).toHaveLength(0);
    });
});
