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
import { useMemo } from 'react';

import { DOMAIN } from '../../../../core/projects';
import { SupportedAlgorithm } from '../../../../core/supported-algorithms/dtos';
import { useSupportedAlgorithms } from '../../../../core/supported-algorithms/hooks';
import { useProject } from '../../providers';

export type TaskWithSupportedAlgorithms = Record<string, SupportedAlgorithm[]>;

interface UseTasksWithSupportedAlgorithms {
    tasksWithSupportedAlgorithms: TaskWithSupportedAlgorithms;
}

export const useTasksWithSupportedAlgorithms = (): UseTasksWithSupportedAlgorithms => {
    const { data: supportedAlgorithms } = useSupportedAlgorithms();
    const {
        project: { tasks },
    } = useProject();

    const tasksWithSupportedAlgorithms: TaskWithSupportedAlgorithms = useMemo(
        () =>
            supportedAlgorithms
                ? tasks.reduce<TaskWithSupportedAlgorithms>((prev, curr) => {
                      if (curr.domain === DOMAIN.CROP) {
                          return prev;
                      }
                      return {
                          [curr.id]: supportedAlgorithms.filter(
                              ({ domain }) => domain !== DOMAIN.CROP && domain === curr.domain
                          ),
                          ...prev,
                      };
                  }, {})
                : {},
        [tasks, supportedAlgorithms]
    );
    return { tasksWithSupportedAlgorithms };
};
