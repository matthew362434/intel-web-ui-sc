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
import { TrainingDetails } from '../projects/project-status.interface';

export enum JobState {
    RUNNING = 'running',
    FINISHED = 'finished',
    FAILED = 'failed',
    IDLE = 'idle',
    ERROR = 'error',
    PAUSED = 'paused',
    CANCELLED = 'cancelled',
}

export enum JobType {
    UNDEFINED = 'undefined',
    TRAIN = 'train',
    INFERENCE = 'inference',
    RECONSTRUCT_VIDEO = 'reconstruct_video',
    EVALUATE = 'evaluate',
    OPTIMIZATION = 'optimization',
}

export interface JobGeneralProps {
    id: string;
    projectId: string;
    description: string;
    name: string;
    taskMetadata: {
        name: string;
        architecture: string;
        version: number;
    };
}

export interface RunningJobProps extends JobGeneralProps {
    state: JobState.RUNNING | JobState.PAUSED;
    status: TrainingDetails;
}

interface FailedJobProps extends JobGeneralProps {
    state: JobState.FAILED | JobState.ERROR | JobState.CANCELLED;
    message: string;
}

interface NotRunningJobProps extends JobGeneralProps {
    state: JobState.FINISHED | JobState.IDLE;
}

export interface JobsByState {
    runningJobs: RunningJobProps[];
    finishedJobs: NotRunningJobProps[];
    scheduledJobs: NotRunningJobProps[];
    failedJobs: FailedJobProps[];
}

export type JobProps = RunningJobProps | FailedJobProps | NotRunningJobProps;
