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

import { useTask } from '../../providers/task-provider/task-provider.component';
import classes from './navigation-toolbar.module.scss';

export const NavigationBreadcrumbs = (): JSX.Element => {
    const { setSelectedTask, selectedTask, tasks } = useTask();

    const handleSelectBreadcrumb = (id: string) => {
        const task = tasks.find((t) => t.id === id);

        setSelectedTask(task ?? null);
    };

    const handleSelectAllTasks = () => {
        setSelectedTask(null);
    };

    return (
        <nav role='navigation' aria-label='navigation-breadcrumbs' className={classes.breadcrumbsNav}>
            <ul className={classes.breadcrumbsList}>
                <li
                    id={'breadcrumb-all-tasks'}
                    className={`${classes.breadcrumbItem} ${selectedTask ? '' : classes.selected}`}
                    onClick={handleSelectAllTasks}
                    key={'breadcrumb-all-tasks'}
                >
                    All Tasks
                </li>
                {tasks.map((task) => (
                    <li
                        id={`breadcrumb-${task.title}`}
                        className={`${classes.breadcrumbItem} ${selectedTask?.id === task.id ? classes.selected : ''}`}
                        onClick={() => handleSelectBreadcrumb(task.id)}
                        key={task.id}
                    >
                        {task.domain}
                    </li>
                ))}
            </ul>
        </nav>
    );
};
