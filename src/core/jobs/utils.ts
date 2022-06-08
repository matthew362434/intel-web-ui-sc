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
import { getFormattedTimeRemaining, getRoundedProgress } from '../projects/utils';
import { JobDTO } from './dtos/jobs.interface';
import { GlobalStatusDTO } from './dtos/status.interface';
import { JobGeneralProps, JobProps, JobState, RunningJobProps } from './job.interface';
import { StatusProps } from './status.interface';

export const getJobEntity = (job: JobDTO): JobProps => {
    const {
        id,
        project_id,
        description,
        name,
        status,
        metadata: { task },
    } = job;
    const jobStatus = getJobStateFromDTO(status.state);

    const generalAttributes: JobGeneralProps = {
        id,
        description,
        name,
        projectId: project_id,
        taskMetadata: {
            architecture: task.model_architecture,
            name: task.name,
            version: task.model_version,
        },
    };

    switch (jobStatus) {
        case JobState.RUNNING:
            return {
                ...generalAttributes,
                state: jobStatus,
                status: {
                    message: status.message,
                    timeRemaining: getFormattedTimeRemaining(status.time_remaining),
                    progress: getRoundedProgress(status.progress),
                },
            };
        case JobState.PAUSED:
            return {
                ...generalAttributes,
                state: jobStatus,
                status: {
                    message: status.message,
                    timeRemaining: getFormattedTimeRemaining(status.time_remaining),
                    progress: getRoundedProgress(status.progress),
                },
            };
        case JobState.FAILED:
            return {
                ...generalAttributes,
                state: jobStatus,
                message: status.message,
            };
        case JobState.ERROR:
            return {
                ...generalAttributes,
                state: jobStatus,
                message: status.message,
            };
        case JobState.FINISHED:
            return {
                ...generalAttributes,
                state: jobStatus,
            };
        case JobState.CANCELLED:
            return {
                ...generalAttributes,
                state: jobStatus,
                message: status.message,
            };
        case JobState.IDLE:
            return {
                ...generalAttributes,
                state: jobStatus,
            };
        default:
            throw new Error('Unhandled job state.');
    }
};

export const getJobStateFromDTO = (state: string): JobState => {
    switch (state) {
        case 'running':
            return JobState.RUNNING;
        case 'paused':
            return JobState.PAUSED;
        case 'finished':
            return JobState.FINISHED;
        case 'cancelled':
            return JobState.CANCELLED;
        case 'failed':
            return JobState.FAILED;
        case 'error':
            return JobState.ERROR;
        case 'idle':
            return JobState.IDLE;
        default:
            throw new Error('Unhandled job state.');
    }
};

export const getGlobalStatus = (status: GlobalStatusDTO): StatusProps => {
    return {
        freeSpace: status.free_space,
        runningJobs: status.n_running_jobs,
        warning: status.warning,
    };
};

export const mockedJobs: JobProps[] = [
    {
        id: 'job-1',
        name: 'Train task job',
        projectId: 'project-1',
        description:
            'Training job for task torch_segmentation in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        state: JobState.RUNNING,
        status: {
            message: 'torch_segmentation - Training (Step 2/6)',
            progress: '64%',
            timeRemaining: '01:19',
        },
        taskMetadata: {
            architecture: 'YoloV4',
            name: 'Detection',
            version: 1,
        },
    },
    {
        id: 'job-2',
        name: 'Train task job',
        projectId: 'project-2',
        description:
            'Training job for task torch_segmentation in project ' +
            'test_project using model UNet/DeepLab (PyTorch variant - Class)',
        state: JobState.FAILED,
        message: 'Failed. One or more tasks did not yield a better model during training. (Step 0/6)',
        taskMetadata: {
            architecture: 'YoloV4',
            name: 'Detection',
            version: 2,
        },
    },
    {
        description:
            'Training job for task torch_segmentation in project test_project ' +
            'using model UNet/DeepLab (PyTorch variant - Class)',
        id: '60ed89589e7651b7da5654ec',
        projectId: 'project-3',
        name: 'Train task job',
        state: JobState.FAILED,
        message: 'Failed. One or more tasks did not yield a better model during training. (Step 0/6)',
        taskMetadata: {
            architecture: 'YoloV4',
            name: 'Detection',
            version: 1,
        },
    },
];

export const mockedRunningJobs = mockedJobs.filter(({ state }) => state === JobState.RUNNING) as RunningJobProps[];
