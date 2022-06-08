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
import { StatusProps } from '../status.interface';
import { StatusService } from './status-service.interface';

export const createInMemoryStatusService = (): StatusService => {
    const getStatus = async (): Promise<StatusProps> => {
        return { runningJobs: 1, warning: '', freeSpace: '85.14 GB' };
    };

    return { getStatus };
};
