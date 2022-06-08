// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { sortAscending } from '../../../shared/utils';
import { DOMAIN, TASK_TYPE } from '../../projects';
import { SupportedAlgorithm, SupportedAlgorithmDTO } from '../dtos';
import { getSupportedAlgorithmEntity } from './utils';

export const mockedSupportedAlgorithmsDTO: SupportedAlgorithmDTO[] = [
    {
        algorithm_name: 'Yolo',
        task_type: TASK_TYPE.DETECTION,
        model_size: '200',
        model_template_id: 'detection_yolo',
        gigaflops: 5,
        summary: 'YOLO architecture for detection',
        supports_auto_hpo: true,
    },
    {
        algorithm_name: 'SSD',
        task_type: TASK_TYPE.DETECTION,
        model_size: '200',
        model_template_id: 'detection_ssd',
        gigaflops: 3,
        summary: 'SSD architecture for detection',
        supports_auto_hpo: true,
    },
    {
        algorithm_name: 'HDD',
        task_type: TASK_TYPE.DETECTION,
        model_size: '300',
        model_template_id: 'detection_hdd',
        gigaflops: 1,
        summary: 'HDD architecture for detection',
        supports_auto_hpo: true,
    },
    {
        algorithm_name: 'Efficient-B0',
        task_type: TASK_TYPE.CLASSIFICATION,
        model_size: '100',
        model_template_id: 'classification_efficient_b0',
        gigaflops: 0.8,
        summary: 'Efficient-B0 architecture for classification',
        supports_auto_hpo: false,
    },
    {
        algorithm_name: 'Mobile-Net',
        task_type: TASK_TYPE.CLASSIFICATION,
        model_size: '300',
        model_template_id: 'classification_mobile_net',
        gigaflops: 1.1,
        summary: 'Mobile-Net architecture for classification',
        supports_auto_hpo: false,
    },
    {
        algorithm_name: 'Segmentation-HDD',
        task_type: TASK_TYPE.SEGMENTATION,
        model_size: '250',
        model_template_id: 'segmentation_hdd',
        gigaflops: 1,
        summary: 'Segmentation-HDD architecture for segmentation',
        supports_auto_hpo: false,
    },
    {
        algorithm_name: 'Anomaly-SSD',
        task_type: TASK_TYPE.ANOMALY_CLASSIFICATION,
        model_size: '300',
        model_template_id: 'annomaly_ssd',
        gigaflops: 1,
        summary: 'Anomaly-SSD architecture for anomaly',
        supports_auto_hpo: true,
    },
    {
        algorithm_name: 'Segmentation-SSD',
        task_type: TASK_TYPE.SEGMENTATION,
        model_size: '150',
        model_template_id: 'segmentation_ssd',
        gigaflops: 23,
        summary: 'Segmentation-SSD for segmentation',
        supports_auto_hpo: false,
    },
];

export const mockedSupportedAlgorithms: SupportedAlgorithm[] = sortAscending(
    mockedSupportedAlgorithmsDTO
        .map(getSupportedAlgorithmEntity)
        .filter((supportedAlgorithm): supportedAlgorithm is SupportedAlgorithm => supportedAlgorithm !== undefined),
    'gigaflops'
);

export const mockedDetectionSupportedAlgorithms = mockedSupportedAlgorithms.filter(
    ({ domain }) => domain === DOMAIN.DETECTION
);
