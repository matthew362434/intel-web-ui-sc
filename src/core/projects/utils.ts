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

import { TASK_TYPE } from './dtos';
import { DOMAIN } from './project.interface';

export const getTaskTypeFromDomain = (domain: DOMAIN): TASK_TYPE => {
    switch (domain) {
        case DOMAIN.ANOMALY_CLASSIFICATION:
            return TASK_TYPE.ANOMALY_CLASSIFICATION;
        case DOMAIN.ANOMALY_DETECTION:
            return TASK_TYPE.ANOMALY_DETECTION;
        case DOMAIN.ANOMALY_SEGMENTATION:
            return TASK_TYPE.ANOMALY_SEGMENTATION;
        case DOMAIN.DETECTION:
            return TASK_TYPE.DETECTION;
        case DOMAIN.DETECTION_ROTATED_BOUNDING_BOX:
            return TASK_TYPE.DETECTION_ROTATED_BOUNDING_BOX;
        case DOMAIN.CROP:
            return TASK_TYPE.CROP;
        case DOMAIN.SEGMENTATION:
            return TASK_TYPE.SEGMENTATION;
        case DOMAIN.SEGMENTATION_INSTANCE:
            return TASK_TYPE.SEGMENTATION_INSTANCE;
        case DOMAIN.CLASSIFICATION:
            return TASK_TYPE.CLASSIFICATION;
        default:
            return TASK_TYPE.DETECTION;
    }
};

export const getRoundedProgress = (progress: number): string => {
    return progress > 0 ? `${progress > 99 ? Math.floor(progress) : Math.round(progress)}%` : '0%';
};

export const getFormattedTimeRemaining = (time: number): string | undefined => {
    return time > 0 ? new Date(time * 1000).toISOString().substr(11, 8).replace(/^00:/, '') : undefined;
};
