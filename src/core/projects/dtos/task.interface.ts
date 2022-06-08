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

import { DeletedLabelDTO, LabelCreation, LabelDTO, NewLabelDTO } from '../../labels';

export enum TASK_TYPE {
    ANOMALY_CLASSIFICATION = 'anomaly_classification',
    ANOMALY_DETECTION = 'anomaly_detection',
    ANOMALY_SEGMENTATION = 'anomaly_segmentation',
    CLASSIFICATION = 'classification',
    CROP = 'crop',
    DETECTION = 'detection',
    DETECTION_ROTATED_BOUNDING_BOX = 'rotated_detection',
    SEGMENTATION = 'segmentation',
    SEGMENTATION_INSTANCE = 'instance_segmentation',
    DATASET = 'dataset',
}

export interface DatasetTask {
    task_type: TASK_TYPE.DATASET;
    title: 'Dataset';
}

export interface CropTask {
    task_type: TASK_TYPE.CROP;
    title: 'Crop task';
}

type AnomalyTaskType = TASK_TYPE.ANOMALY_CLASSIFICATION | TASK_TYPE.ANOMALY_DETECTION | TASK_TYPE.ANOMALY_SEGMENTATION;
interface AnomalyTask {
    task_type: AnomalyTaskType;
    title: 'Anomaly task';
}

interface TaskCommon {
    task_type: TASK_TYPE;
    title: string;
}

export type TaskCreation = AnomalyTask | DatasetTask | CropTask | NotDefaultTaskCreation;

interface NotDefaultTaskCreation extends TaskCommon {
    labels: LabelCreation[];
}

export interface TaskDTO extends TaskCommon {
    id: string;
    labels?: (LabelDTO | NewLabelDTO | DeletedLabelDTO)[];
}
