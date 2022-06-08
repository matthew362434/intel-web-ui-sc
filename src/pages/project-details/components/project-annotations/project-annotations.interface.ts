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

import { ObjectSizeDistributionDTO, ObjectsPerLabelInterface } from '../../../../core/statistics/dtos';

export interface ObjectSizeDistribution {
    clusterCenter: ObjectSizeDistributionDTO['cluster_center'];
    clusterWidthHeight: ObjectSizeDistributionDTO['cluster_width_height'];
    labelColor: ObjectSizeDistributionDTO['label_color'];
    labelId: ObjectSizeDistributionDTO['label_id'];
    labelName: ObjectSizeDistributionDTO['label_name'];
    aspectRatioThresholdTall: ObjectSizeDistributionDTO['aspect_ratio_threshold_tall'];
    aspectRatioThresholdWide: ObjectSizeDistributionDTO['aspect_ratio_threshold_wide'];
    sizeDistribution: ObjectSizeDistributionDTO['size_distribution'];
    objectDistributionFromAspectRatio: ObjectSizeDistributionDTO['object_distribution_from_aspect_ratio'];
}

export interface DatasetStatistics {
    images: number;
    videos: number;
    annotatedImages: number;
    annotatedVideos: number;
    annotatedFrames: number;
    score: number;
    objectsPerLabel: ObjectsPerLabelInterface[];
    objectSizeDistributionPerLabel: ObjectSizeDistribution[];
}
