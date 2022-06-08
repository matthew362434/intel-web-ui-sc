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

import { EditedLabel, Label } from '../labels';
import { ConnectionDTO, ProjectCommon, TaskCreation, TASK_TYPE } from './dtos';

export interface ProjectIdentifier {
    workspaceId: string;
    projectId: string;
}

export enum DOMAIN {
    ANOMALY_CLASSIFICATION = 'Anomaly classification',
    ANOMALY_DETECTION = 'Anomaly detection',
    ANOMALY_SEGMENTATION = 'Anomaly segmentation',
    CLASSIFICATION = 'Classification',
    CROP = 'Crop',
    DETECTION = 'Detection',
    DETECTION_ROTATED_BOUNDING_BOX = 'Detection oriented',
    SEGMENTATION = 'Segmentation',
    SEGMENTATION_INSTANCE = 'Instance segmentation',
}

// In order to control the selected card on project creation, we were
// checking if the card's domain matches the current selection.
// But since we need to distinguish between different types of domains within a domain, this
// enum was created to help with this distinction.
//
// Example: The user selects DETECTION domain, and within that, he picks DETECTION_ROTATED_BOUNDING_BOX as subdomain
export enum SUBDOMAIN {
    ANOMALY_CLASSIFICATION = 'Anomaly classification',
    ANOMALY_DETECTION = 'Anomaly detection',
    ANOMALY_SEGMENTATION = 'Anomaly segmentation',

    CLASSIFICATION_MULTI_CLASS = 'Classification single label',
    CLASSIFICATION_MULTI_LABEL = 'Classification multi label',
    CLASSIFICATION_HIERARCHICAL = 'Classification hierarchical',

    DETECTION_BOUNDING_BOX = 'Detection bounding box',
    DETECTION_ROTATED_BOUNDING_BOX = 'Detection oriented',

    SEGMENTATION_INSTANCE = 'Instance segmentation',
    SEGMENTATION_SEMANTIC = 'Semantic segmentation',
}

const TASK_TYPE_TO_DOMAIN: Record<TASK_TYPE, DOMAIN | undefined> = {
    [TASK_TYPE.ANOMALY_CLASSIFICATION]: DOMAIN.ANOMALY_CLASSIFICATION,
    [TASK_TYPE.ANOMALY_DETECTION]: DOMAIN.ANOMALY_DETECTION,
    [TASK_TYPE.ANOMALY_SEGMENTATION]: DOMAIN.ANOMALY_SEGMENTATION,
    [TASK_TYPE.CLASSIFICATION]: DOMAIN.CLASSIFICATION,
    [TASK_TYPE.DETECTION]: DOMAIN.DETECTION,
    [TASK_TYPE.DETECTION_ROTATED_BOUNDING_BOX]: DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
    [TASK_TYPE.SEGMENTATION]: DOMAIN.SEGMENTATION,
    [TASK_TYPE.SEGMENTATION_INSTANCE]: DOMAIN.SEGMENTATION_INSTANCE,

    [TASK_TYPE.DATASET]: undefined,
    [TASK_TYPE.CROP]: DOMAIN.CROP,
};

export const getDomain = (taskType: TASK_TYPE): DOMAIN | undefined => {
    return TASK_TYPE_TO_DOMAIN[taskType];
};

interface TaskCommon {
    id: string;
    title: string;
    domain: DOMAIN;
}

export interface EditTask extends TaskCommon {
    labels: EditedLabel[];
}

export interface Task extends TaskCommon {
    labels: Label[];
}

interface Dataset {
    id: string;
    name: string;
}

interface TaskPerformance {
    type: 'default_performance';
    score: number;
}
interface AnomalyTaskPerformance {
    type: 'anomaly_performance';
    globalScore: number;
    localScore: number | null;
}
export type Performance = TaskPerformance | AnomalyTaskPerformance;

interface ProjectPropsCommon {
    id: string;
    name: string;
    creationDate: Date;
    domains: DOMAIN[];
    thumbnail: string;
    score: number;

    datasets: Dataset[];
}

export interface EditProjectProps extends ProjectPropsCommon {
    tasks: EditTask[];
}

export interface ProjectProps extends ProjectPropsCommon {
    labels: Label[];
    tasks: Task[];
    performance: Performance;
}

export interface Settings {
    settings: string;
}

export type CreateProjectProps = Omit<ProjectProps, 'datasets'>;

export interface ProjectCreation extends ProjectCommon {
    description?: string;
    pipeline: {
        connections: ConnectionDTO[];
        tasks: TaskCreation[];
    };
}
