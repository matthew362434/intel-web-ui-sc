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

import { TaskDTO } from './task.interface';

export interface ConnectionDTO {
    from: string;
    to: string;
}

export interface ProjectCommon {
    name: string;
}

export interface DatasetDTO {
    id: string;
    name: string;
}

export interface SettingsDTO {
    settings: string;
}

export type PerformanceDTO = { global_score: number; local_score: number | null } | { score: number };

export interface ProjectDTO extends ProjectCommon {
    creation_time: string;
    id: string;
    name: string;
    datasets: DatasetDTO[];
    pipeline: {
        connections: ConnectionDTO[];
        tasks: TaskDTO[];
    };
    performance: PerformanceDTO;
    score: number;
    thumbnail: string;
}
