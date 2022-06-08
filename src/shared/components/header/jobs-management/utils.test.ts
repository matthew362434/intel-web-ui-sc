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

import { JobState } from '../../../../core/jobs/job.interface';
import { getMockedJob } from '../../../../test-utils/mocked-items-factory/mocked-jobs';
import { returnJobsByState } from './utils';

describe('jobs management - utils', () => {
    it('returningJobsByState - one job per each state - should return 2 runningJobs, 1 finished, 1 scheduled and 3 failed', () => {
        const jobsByState = returnJobsByState([
            getMockedJob(JobState.RUNNING),
            getMockedJob(JobState.FAILED),
            getMockedJob(JobState.FINISHED),
            getMockedJob(JobState.CANCELLED),
            getMockedJob(JobState.IDLE),
            getMockedJob(JobState.ERROR),
            getMockedJob(JobState.PAUSED),
        ]);

        expect(jobsByState.failedJobs).toHaveLength(3);
        expect(jobsByState.finishedJobs).toHaveLength(1);
        expect(jobsByState.runningJobs).toHaveLength(2);
        expect(jobsByState.scheduledJobs).toHaveLength(1);
    });

    it('returningJobsByState - one cancelled and two failed jobs - should return 3 failed and none in rest categories', () => {
        const jobsByState = returnJobsByState([
            getMockedJob(JobState.FAILED),
            getMockedJob(JobState.CANCELLED),
            getMockedJob(JobState.FAILED),
        ]);

        expect(jobsByState.failedJobs).toHaveLength(3);
        expect(jobsByState.finishedJobs).toHaveLength(0);
        expect(jobsByState.runningJobs).toHaveLength(0);
        expect(jobsByState.scheduledJobs).toHaveLength(0);
    });
});
