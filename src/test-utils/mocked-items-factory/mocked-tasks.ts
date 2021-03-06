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

/* eslint-disable @typescript-eslint/no-unused-vars */

import { DOMAIN, Task } from '../../core/projects';
import { TaskContextProps } from '../../pages/annotator/providers/task-provider/task-provider.component';

const mockedTask: Task = {
    id: 'task',
    title: 'Task',
    domain: DOMAIN.CLASSIFICATION,
    labels: [],
};

export const getMockedTask = (customTaskValues: Partial<Task>): Task => {
    return {
        ...mockedTask,
        ...customTaskValues,
    };
};

export const mockedTaskContextProps = (customValues: Partial<TaskContextProps>): TaskContextProps => ({
    tasks: [],
    selectedTask: null,
    setSelectedTask: jest.fn(),
    defaultLabel: null,
    setDefaultLabel: jest.fn(),
    isTaskChainDomainSelected: (domain: DOMAIN) => false,
    activeDomains: [],
    labels: [],
});
