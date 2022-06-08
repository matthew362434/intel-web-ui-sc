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
import { JobProps, JobsByState, JobState, RunningJobProps } from '../../../../core/jobs/job.interface';

export const returnJobsByState = (jobs: JobProps[]): JobsByState => {
    return {
        runningJobs: jobs.filter(
            ({ state }: JobProps) => state === JobState.RUNNING || state === JobState.PAUSED
        ) as JobsByState['runningJobs'],
        finishedJobs: jobs.filter(({ state }: JobProps) => state === JobState.FINISHED) as JobsByState['finishedJobs'],
        scheduledJobs: jobs.filter(({ state }: JobProps) => state === JobState.IDLE) as JobsByState['scheduledJobs'],
        failedJobs: jobs.filter(
            ({ state }: JobProps) =>
                state === JobState.FAILED || state === JobState.ERROR || state === JobState.CANCELLED
        ) as JobsByState['failedJobs'],
    };
};

export const isRunningJob = (job?: JobProps): job is RunningJobProps => job?.state === JobState.RUNNING;

export const isNegativePercentage = (val: string): boolean => Number(val.replace('%', '')) < 0;
