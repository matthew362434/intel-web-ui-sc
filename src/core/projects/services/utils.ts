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
    ConnectionDTO,
    DatasetTask,
    DOMAIN,
    EditTask,
    getDomain,
    Performance,
    ProjectDTO,
    ProjectProps,
    ProjectStatusDTO,
    Task,
    TASK_TYPE,
    TaskCreation,
    TaskDTO,
} from '../../../core/projects';
import {
    LabelItemType,
    LabelTreeItem,
    LabelTreeLabel,
} from '../../../pages/annotator/components/labels/label-tree-view';
import { GROUP_SEPARATOR } from '../../../pages/annotator/components/labels/utils';
import { LabelsRelationType } from '../../../pages/create-project/components/select-project-template/utils';
import {
    DeletedLabel,
    DeletedLabelDTO,
    EditedLabel,
    getBehaviourFromDTO,
    isExclusive,
    Label,
    LabelCreation,
    LabelDTO,
    NewLabel,
    NewLabelDTO,
} from '../../labels';
import { getFlattenedItems } from '../../labels/utils';
import { CropTask, PerformanceDTO } from '../dtos';
import { getTaskTypeFromDomain } from '../utils';

export const getNewLabel = (label: NewLabelDTO, domain: DOMAIN): NewLabel => {
    const { name, color, group, parent_id, hotkey, revisit_affected_annotations } = label;
    const behaviour = getBehaviourFromDTO(label, domain);

    return {
        name,
        color,
        group,
        parentLabelId: parent_id || null,
        hotkey,
        behaviour,
        revisitAffectedAnnotations: revisit_affected_annotations,
    };
};

export const getDeletedLabel = (label: DeletedLabelDTO, domain: DOMAIN): DeletedLabel => {
    const { name, color, group, parent_id, hotkey, is_deleted, id } = label;
    const behaviour = getBehaviourFromDTO(label, domain);

    return {
        id,
        name,
        color,
        group,
        parentLabelId: parent_id || null,
        hotkey,
        behaviour,
        isDeleted: is_deleted,
    };
};

export const getLabel = (label: LabelDTO, domain: DOMAIN): Label => {
    const { id, name, color, group, parent_id, hotkey } = label;
    const behaviour = getBehaviourFromDTO(label, domain);

    return {
        id,
        name,
        color,
        group,
        parentLabelId: parent_id || null,
        hotkey,
        behaviour,
    };
};

export const getPerformance = (performanceDTO: PerformanceDTO): Performance => {
    if (performanceDTO && !('score' in performanceDTO)) {
        const localScore = performanceDTO.local_score === null ? null : Math.max(0, 100 * performanceDTO.local_score);

        return {
            type: 'anomaly_performance',
            localScore,
            globalScore: Math.max(0, performanceDTO.global_score),
        };
    }

    return {
        type: 'default_performance',
        score: Math.max(0, performanceDTO?.score),
    };
};

export const getPerformanceDTO = (performance: Performance): PerformanceDTO => {
    if (performance.type === 'default_performance') {
        return {
            score: performance.score,
        };
    }

    return {
        local_score: performance.localScore ?? 0,
        global_score: performance.globalScore,
    };
};

export const getProjectEntity = (serverProject: ProjectDTO): ProjectProps => {
    const { id, name, creation_time, thumbnail, score, datasets, performance: performanceDTO } = serverProject;
    const {
        pipeline: { tasks },
    } = serverProject;

    const projectTasks = tasks
        .map((task): Task | EditTask | undefined => {
            const domain = getDomain(task.task_type);

            if (domain === undefined) {
                return undefined;
            }

            return {
                id: task.id,
                title: task.title,
                domain,
                labels: (task.labels ?? []).map((label) => {
                    if ('revisit_affected_annotations' in label) {
                        return getNewLabel(label, domain);
                    } else if ('is_deleted' in label) {
                        return getDeletedLabel(label, domain);
                    } else {
                        return getLabel(label, domain);
                    }
                }),
            };
        })
        .filter((task): task is Task => task !== undefined);

    const labels = projectTasks.flatMap((task) => task.labels);
    const domains = projectTasks.map((task) => task.domain);

    const performance = getPerformance(performanceDTO);

    return {
        id,
        name,
        thumbnail,
        score: Math.max(0, score),
        performance,
        tasks: projectTasks,
        creationDate: new Date(creation_time),
        domains,
        labels,
        datasets,
    };
};

export const getLabelDTO = (label: EditedLabel): LabelDTO | NewLabelDTO | DeletedLabelDTO => {
    const { name, color, group, parentLabelId, hotkey } = label;

    const common = {
        name,
        color,
        group,
        hotkey,
        parent_id: parentLabelId,
        is_empty: isExclusive(label),
    };

    if ('revisitAffectedAnnotations' in label) {
        return {
            ...common,
            revisit_affected_annotations: label.revisitAffectedAnnotations,
        } as NewLabelDTO;
    } else if ('isDeleted' in label) {
        return {
            ...common,
            id: label.id,
            is_deleted: label.isDeleted,
        } as DeletedLabelDTO;
    } else {
        return {
            id: label.id,
            ...common,
        } as LabelDTO;
    }
};

export const getProjectDTO = (project: ProjectProps): ProjectDTO => {
    const { id, name, creationDate, score, thumbnail, domains, datasets } = project;

    const filteredDomains = domains.filter((domain) => domain !== DOMAIN.CROP);

    const tasks = project.tasks.map((task): TaskDTO => {
        return {
            id: task.id,
            task_type: getTaskTypeFromDomain(task.domain),
            title: task.title,
            labels: task.labels.map(getLabelDTO),
        };
    });

    return {
        creation_time: creationDate.toUTCString(),
        id,
        name,
        pipeline: {
            connections: getConnections(filteredDomains),
            tasks: [...tasks],
        },
        score,
        performance: getPerformanceDTO({ type: 'default_performance', score }),
        thumbnail,
        datasets,
    };
};

export const getConnections = (domains: DOMAIN[]): ConnectionDTO[] => {
    if (domains.length === 1) {
        const domain = domains[0];

        return [
            {
                from: 'Dataset',
                to: `${domain} task`,
            },
        ];
    }

    return domains.flatMap((domain: DOMAIN, index) => {
        if (index === 0) {
            return [
                {
                    from: 'Dataset',
                    to: `${domain} task`,
                },
            ];
        } else
            return [
                { from: `${domains[index - 1]} task`, to: 'Crop task' },
                { from: 'Crop task', to: `${domain} task` },
            ];
    });
};

const updateHierarchyParentId = (flatItems: LabelTreeItem[]): LabelTreeItem[] => {
    return flatItems.map((item) => {
        const parent = flatItems.find(({ id }) => id === item.parentLabelId);
        if (parent?.type === LabelItemType.GROUP) {
            return { ...item, parentLabelId: parent.parentLabelId };
        } else {
            return item;
        }
    });
};

export const getTasks = (tasks: TaskMetadata[], domains: DOMAIN[]): TaskCreation[] => {
    const datasetTask: DatasetTask = {
        title: 'Dataset',
        task_type: TASK_TYPE.DATASET,
    };

    // TODO: in the future if when we support task chains with more than 2 tasks,
    // we will need to generate a crop task in between each domain
    const cropTasks: CropTask[] = domains.length > 1 ? [{ title: 'Crop task', task_type: TASK_TYPE.CROP }] : [];

    const preparedTasks = tasks.map((task, index): TaskCreation => {
        let flatItems = getFlattenedItems(task.labels);

        if (task.relation === LabelsRelationType.MIXED) {
            flatItems = updateHierarchyParentId(flatItems);
        }

        const flatLabels = flatItems.filter(({ type }) => type === LabelItemType.LABEL);
        const taskLabels = flatLabels.map((label: LabelTreeItem): LabelCreation => {
            const { name, color, group, hotkey, parentLabelId } = label as Label;

            const parentLabelElement = flatLabels.find(({ id }: LabelTreeItem) => id === parentLabelId);

            const groupName =
                index === 1 ? `${(tasks[0].labels[0] as LabelTreeLabel).group}${GROUP_SEPARATOR}${group}` : group;

            return {
                name,
                color,
                group: groupName,
                parent_id: parentLabelElement ? parentLabelElement.name : null,
                hotkey,
            };
        });

        return {
            title: `${task.domain} task`,
            task_type: getTaskTypeFromDomain(task.domain),
            labels: taskLabels,
        };
    });
    const tasksDomains = tasks.map((task) => task.domain);
    const tasksWithoutLabels = domains
        .filter((domain) => {
            return !tasksDomains.includes(domain);
        })
        .map((domain) => {
            return {
                title: `${domain} task`,
                task_type: getTaskTypeFromDomain(domain),
            } as TaskCreation;
        });

    return [datasetTask, ...preparedTasks, ...tasksWithoutLabels, ...cropTasks];
};

export interface TaskMetadata {
    labels: LabelTreeItem[];
    domain: DOMAIN;
    relation: LabelsRelationType;
}

export const getProjectStatusBody = (time_remaining?: number, progress?: number): ProjectStatusDTO => {
    return {
        is_training: true,
        n_required_annotations: 0,
        project_score: 0.0,
        tasks: [],
        status: {
            message: 'torch_segmentation - Training',
            progress: progress || 4.132231404958678,
            time_remaining: time_remaining || 63,
        },
    };
};
