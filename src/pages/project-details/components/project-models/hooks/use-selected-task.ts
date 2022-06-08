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
import { Key, useCallback, useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';

import { useModelIdentifier } from '../../../../../hooks';

export const useSelectedTask = (defaultValue: Key): [Key, (inputTask: Key) => void] => {
    const { taskName } = useModelIdentifier();
    const [selectedTask, setSelectedTask] = useState<Key>(taskName ?? defaultValue);
    const history = useHistory();

    const handleSelectedTask = useCallback(
        (inputTask: Key): void => {
            setSelectedTask(inputTask);
            history.push(`${inputTask}`);
        },
        [history]
    );

    useEffect(() => {
        // handle proper task when user click go back button in the browser
        taskName && selectedTask !== taskName && setSelectedTask(taskName);
    }, [taskName, selectedTask]);

    return [selectedTask, handleSelectedTask];
};
