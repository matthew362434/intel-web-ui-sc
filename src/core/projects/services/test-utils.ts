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
    LabelItemEditionState,
    LabelItemType,
    LabelTreeItem,
} from '../../../pages/annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../pages/create-project/components/select-project-template/utils';
import { getMockedLabel } from '../../../test-utils/mocked-items-factory';
import { DatasetDTO, ProjectDTO, TASK_TYPE } from '../dtos';

const DEFAULT_DATASETS: DatasetDTO[] = [{ id: 'default-dataset', name: 'Default dataset' }];

export const FLAT_LABELS: LabelTreeItem[] = [
    {
        ...getMockedLabel({ id: 'label', name: 'label', color: '#eeddbb' }),
        open: false,
        inEditMode: false,
        children: [],
        state: LabelItemEditionState.IDLE,
        relation: LabelsRelationType.SINGLE_SELECTION,
        type: LabelItemType.LABEL,
    },
    {
        ...getMockedLabel({ id: 'label2', name: 'label2', color: '#eeddbb' }),
        open: false,
        inEditMode: false,
        children: [],
        state: LabelItemEditionState.IDLE,
        relation: LabelsRelationType.SINGLE_SELECTION,
        type: LabelItemType.LABEL,
    },
];

export const HIERARCHY_LABELS: LabelTreeItem[] = [
    {
        ...getMockedLabel({
            id: 'label',
            name: 'label',
            color: '#eeddbb',
            group: 'Default group',
        }),
        open: false,
        inEditMode: false,
        state: LabelItemEditionState.IDLE,
        relation: LabelsRelationType.SINGLE_SELECTION,
        type: LabelItemType.LABEL,
        children: [
            {
                ...getMockedLabel({
                    id: 'label-child',
                    name: 'label child',
                    color: '#eeddbb',
                    group: 'Default group',
                    parentLabelId: 'label',
                    hotkey: 'ctrl+2',
                }),
                open: false,
                inEditMode: false,
                state: LabelItemEditionState.IDLE,
                relation: LabelsRelationType.SINGLE_SELECTION,
                type: LabelItemType.LABEL,
                children: [
                    {
                        ...getMockedLabel({
                            id: 'label-child-child',
                            name: 'label child child',
                            color: '#eeddbb',
                            group: 'Default group',
                            parentLabelId: 'label-child',
                            hotkey: 'ctrl+3',
                        }),
                        open: false,
                        children: [],
                        inEditMode: false,
                        state: LabelItemEditionState.IDLE,
                        relation: LabelsRelationType.SINGLE_SELECTION,
                        type: LabelItemType.LABEL,
                    },
                ],
            },
            {
                ...getMockedLabel({
                    id: 'label-child2',
                    name: 'label child2',
                    color: '#eeddbb',
                    group: 'Default group',
                    parentLabelId: 'label',
                    hotkey: 'ctrl+4',
                }),
                open: false,
                children: [],
                inEditMode: false,
                state: LabelItemEditionState.IDLE,
                relation: LabelsRelationType.SINGLE_SELECTION,
                type: LabelItemType.LABEL,
            },
        ],
    },
];

const FLAT_LABELS_BODY = [
    {
        id: '1',
        name: 'label',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: null,
        hotkey: 'ctrl+1',
        is_empty: false,
    },
    {
        id: '2',
        name: 'label2',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: null,
        hotkey: 'ctrl+1',
        is_empty: false,
    },
];

export const PROJECT_DETECTION: ProjectDTO = {
    id: 'project-detection',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 65,
    performance: { score: 65 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Detection task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Image Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.DATASET,
                title: 'Detection task',
                labels: FLAT_LABELS_BODY,
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

export const PROJECT_DETECTION_ORIENTED = {
    ...PROJECT_DETECTION,
    id: 'project-detection-oriented',
    pipeline: {
        ...PROJECT_DETECTION.pipeline,
        connections: [
            {
                from: 'Dataset',
                to: 'Detection oriented task',
            },
        ],
    },
};

export const PROJECT_SEGMENTATION: ProjectDTO = {
    id: 'project-segmentation',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 65,
    performance: { score: 65 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Segmentation task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Image Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.DATASET,
                title: 'Segmentation task',
                labels: FLAT_LABELS_BODY,
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

export const PROJECT_SEGMENTATION_INSTANCE = {
    ...PROJECT_SEGMENTATION,
    id: 'project-segmentation-instance',
    pipeline: {
        ...PROJECT_SEGMENTATION.pipeline,
        connections: [
            {
                from: 'Dataset',
                to: 'Segmentation instance task',
            },
        ],
    },
};

const HIERARCHY_LABELS_BODY = [
    {
        id: 'label1',
        name: 'label',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: null,
        hotkey: 'ctrl+1',
        is_empty: false,
    },
    {
        id: 'label2',
        name: 'label child',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: 'label',
        hotkey: 'ctrl+2',
        is_empty: false,
    },
    {
        id: 'label3',
        name: 'label child child',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: 'label child',
        hotkey: 'ctrl+3',
        is_empty: false,
    },
    {
        id: 'label4',
        name: 'label child2',
        group: 'Default group',
        color: '#eeddbb',
        parent_id: 'label',
        hotkey: 'ctrl+4',
        is_empty: false,
    },
];

export const PROJECT_CLASSIFICATION: ProjectDTO = {
    id: 'project-classification',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 69,
    performance: { score: 69 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Classification task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.CLASSIFICATION,
                title: 'Classification task',
                labels: HIERARCHY_LABELS_BODY,
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

const PROJECT_ANOMALY: ProjectDTO = {
    id: 'project-anomaly',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 75,
    performance: { score: 75 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Anomaly task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.ANOMALY_CLASSIFICATION,
                title: 'Anomaly task',
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

export const PROJECT_ANOMALY_CLASSIFICATION = {
    ...PROJECT_ANOMALY,
    pipeline: {
        ...PROJECT_ANOMALY.pipeline,
        connections: [
            {
                from: 'Dataset',
                to: 'Anomaly classification task',
            },
        ],
    },
};

export const PROJECT_ANOMALY_DETECTION = {
    ...PROJECT_ANOMALY,
    pipeline: {
        ...PROJECT_ANOMALY.pipeline,
        connections: [
            {
                from: 'Dataset',
                to: 'Anomaly detection task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.ANOMALY_DETECTION,
                title: 'Anomaly task',
            },
        ],
    },
};

export const PROJECT_ANOMALY_SEGMENTATION = {
    ...PROJECT_ANOMALY,
    pipeline: {
        ...PROJECT_ANOMALY.pipeline,
        connections: [
            {
                from: 'Dataset',
                to: 'Anomaly segmentation task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.ANOMALY_SEGMENTATION,
                title: 'Anomaly task',
            },
        ],
    },
};

export const PROJECT_DETECTION_CLASSIFICATION: ProjectDTO = {
    id: 'project-detection-classification',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 90,
    performance: { score: 90 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Detection task',
            },
            {
                from: 'Detection task',
                to: 'Crop task',
            },
            {
                from: 'Crop task',
                to: 'Classification task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.DETECTION,
                title: 'Detection task',
                labels: FLAT_LABELS_BODY,
            },
            {
                id: 'task3',
                task_type: TASK_TYPE.CLASSIFICATION,
                title: 'Classification task',
                labels: HIERARCHY_LABELS_BODY,
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

export const PROJECT_DETECTION_SEGMENTATION: ProjectDTO = {
    id: 'project-detection-segmentation',
    creation_time: new Date().toISOString(),
    thumbnail: '',
    score: 99,
    performance: { score: 99 },
    name: 'test-project',
    pipeline: {
        connections: [
            {
                from: 'Dataset',
                to: 'Detection task',
            },
            {
                from: 'Detection task',
                to: 'Crop task',
            },
            {
                from: 'Crop task',
                to: 'Segmentation task',
            },
        ],
        tasks: [
            {
                id: 'task1',
                task_type: TASK_TYPE.DATASET,
                title: 'Dataset',
            },
            {
                id: 'task2',
                task_type: TASK_TYPE.DETECTION,
                title: 'Detection task',
                labels: FLAT_LABELS_BODY,
            },
            {
                id: 'task3',
                task_type: TASK_TYPE.SEGMENTATION,
                title: 'Segmentation task',
                labels: FLAT_LABELS_BODY,
            },
        ],
    },
    datasets: DEFAULT_DATASETS,
};

export const PROJECT_RESPONSE = (): ProjectDTO => {
    return {
        creation_time: '2021-06-01T10:20:16.209000+00:00',
        id: '60b609e0d036ba4566726c7f',
        name: 'Card detection',
        pipeline: {
            connections: [
                {
                    from: '60b609e0d036ba4566726c80',
                    to: '60b609e0d036ba4566726c81',
                },
            ],
            tasks: [
                {
                    task_type: TASK_TYPE.DATASET,
                    id: '60b609e0d036ba4566726c80',
                    labels: [],
                    title: 'Dataset',
                },
                {
                    task_type: TASK_TYPE.DETECTION,
                    id: '60b609e0d036ba4566726c81',
                    labels: [
                        {
                            color: '#fff5f7ff',
                            group: 'Label Group 1',
                            id: '60b609e0d036ba4566726c82',
                            name: 'card',
                            parent_id: null,
                            hotkey: 'ctrl+1',
                            is_empty: false,
                        },
                    ],
                    title: 'Detection',
                },
            ],
        },
        score: 50,
        performance: { score: 50 },
        thumbnail: '/v2/projects/60b609e0d036ba4566726c7f/thumbnail',
        datasets: DEFAULT_DATASETS,
    };
};
