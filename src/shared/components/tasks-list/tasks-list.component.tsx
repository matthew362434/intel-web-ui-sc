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
import { Dispatch, Key, SetStateAction } from 'react';

import { Picker, Item } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';
import { ViewProps } from '@react-types/view';

import { TasksItems } from '../../../pages/project-details/components';
import { idMatchingFormat } from '../../../test-utils';
import classes from './tasks-list.module.scss';

interface TasksListProps {
    items: TasksItems[];
    selectedTask: Key;
    setSelectedTask: Dispatch<SetStateAction<Key>> | ((inputValue: Key) => void);
    marginTop?: ViewProps['marginTop'];
    marginBottom?: ViewProps['marginBottom'];
}

export const TasksList = ({
    items,
    selectedTask,
    setSelectedTask,
    marginTop,
    marginBottom,
}: TasksListProps): JSX.Element => {
    return (
        <Picker
            items={items}
            selectedKey={selectedTask}
            onSelectionChange={setSelectedTask}
            marginTop={marginTop}
            marginBottom={marginBottom}
            UNSAFE_className={classes.taskListButton}
            aria-label={'Select task'}
            id={'task-selection-id'}
        >
            {(item) => (
                <Item key={item.path ?? item.domain} textValue={item.domain}>
                    <Text id={`${idMatchingFormat(item.domain)}-id`} UNSAFE_className={classes.taskItem}>
                        @{item.domain}
                    </Text>
                </Item>
            )}
        </Picker>
    );
};
