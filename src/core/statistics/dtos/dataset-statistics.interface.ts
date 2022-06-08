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

import { DatasetIdentifier } from '../../projects';

export interface ObjectsPerLabelInterface {
    color: string;
    label: string;
    value: number;
}

interface ObjectDistributionAspectRatio {
    balanced: number;
    tall: number;
    wide: number;
}

export interface ObjectSizeDistributionDTO {
    cluster_center: [number, number];
    cluster_width_height: [number, number];
    label_color: string;
    label_id: string;
    label_name: string;
    aspect_ratio_threshold_tall: number | null;
    aspect_ratio_threshold_wide: number | null;
    size_distribution: [number, number][];
    object_distribution_from_aspect_ratio: ObjectDistributionAspectRatio;
}

export interface DatasetStatisticsDTO {
    images: number;
    videos: number;
    annotated_images: number;
    annotated_videos: number;
    annotated_frames: number;
    score: number;
    objects_per_label: ObjectsPerLabelInterface[];
    object_size_distribution_per_label: ObjectSizeDistributionDTO[];
}

export interface TaskIdentifier extends DatasetIdentifier {
    taskId: string;
}
