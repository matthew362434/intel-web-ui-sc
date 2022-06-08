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

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { isExclusive, Label } from '../../../../core/labels';
import { DOMAIN, Task } from '../../../../core/projects';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useProject } from '../../../project-details/providers';

export interface TaskContextProps {
    tasks: Task[];
    selectedTask: null | Task;
    setSelectedTask: Dispatch<SetStateAction<Task | null>>;
    defaultLabel: Label | null;
    setDefaultLabel: (label: Label | null) => void;
    isTaskChainDomainSelected: (domain: DOMAIN) => boolean;
    activeDomains: DOMAIN[];
    labels: Label[];
}
const TaskContext = createContext<TaskContextProps | undefined>(undefined);

const ALL_TASKS = 'All tasks';

interface TaskProviderProps {
    children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps): JSX.Element => {
    const { project, isTaskChainProject } = useProject();

    const tasks = useMemo(() => {
        return project.tasks.filter(({ domain }) => domain !== undefined && domain !== DOMAIN.CROP);
    }, [project]);

    const [selectedTask, setSelectedTask] = useState<Task | null>(() => {
        return tasks.length === 1 ? tasks[0] : null;
    });

    const [defaultLabelMap, setDefaultLabelMap] = useState<Record<string, Label | null>>({});

    const activeDomains = useMemo(() => {
        return selectedTask === null ? tasks.map(({ domain }) => domain) : [selectedTask.domain];
    }, [selectedTask, tasks]);

    const labels = useMemo(() => {
        return selectedTask === null ? tasks.flatMap((task) => task.labels) : selectedTask.labels;
    }, [selectedTask, tasks]);

    const isTaskChainDomainSelected = useCallback(
        (domain: DOMAIN) => isTaskChainProject && selectedTask?.domain === domain,
        [isTaskChainProject, selectedTask?.domain]
    );

    const setDefaultLabel = (label: Label | null) => {
        // If the user selects a label while on "All Tasks", we assign a specific default
        // label for it, but it doesn't affect the default labels for other tasks
        if (!selectedTask) {
            setDefaultLabelMap({ ...defaultLabelMap, [ALL_TASKS]: label });
        } else {
            setDefaultLabelMap({ ...defaultLabelMap, [selectedTask.title]: label });
        }
    };

    useEffect(() => {
        const initialMap: Record<string, Label | null> = {};
        // Set the default labels for all the tasks upon mount
        tasks.forEach((task) => {
            const nonEmptyLabels = task.labels.filter((label) => !isExclusive(label));
            const hasOnlyOneLabel = nonEmptyLabels.length === 1;
            const hasNoLabelAssigned = !defaultLabelMap[task.title];

            if (hasOnlyOneLabel && hasNoLabelAssigned) {
                // Assign the only label from this task as default
                initialMap[task.title] = nonEmptyLabels[0];
            } else {
                // Or else, initialize it as null
                initialMap[task.title] = null;
            }
        });

        setDefaultLabelMap(initialMap);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        tasks,
        selectedTask,
        setSelectedTask,
        setDefaultLabel,
        defaultLabel: defaultLabelMap[selectedTask ? selectedTask.title : ALL_TASKS] ?? null,
        isTaskChainDomainSelected,
        labels,
        activeDomains,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextProps => {
    const context = useContext(TaskContext);

    if (context === undefined) {
        throw new MissingProviderError('useTask', 'TaskProvider');
    }

    return context;
};
