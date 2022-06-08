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
import { JobProps, JobState } from '../../core/jobs/job.interface';

export const getMockedJob = (state: JobState, job?: Partial<JobProps>): JobProps => {
    const DEFAULT_COMMON = {
        state,
        name: 'test',
        id: 'test',
        description: '',
        projectId: '1',
    };

    const common = {
        ...DEFAULT_COMMON,
        ...job,
    };

    const status = { message: '', progress: '', timeRemaining: '' };

    if (state === JobState.RUNNING || state === JobState.PAUSED) {
        return {
            ...common,
            status,
        } as JobProps;
    } else if (state === JobState.FINISHED || state === JobState.IDLE) {
        return common as JobProps;
    } else if (state === JobState.FAILED || state === JobState.ERROR || state === JobState.CANCELLED) {
        return {
            ...common,
            message: job && 'message' in job ? job?.message : 'failed',
        } as JobProps;
    } else {
        return common as JobProps;
    }
};
