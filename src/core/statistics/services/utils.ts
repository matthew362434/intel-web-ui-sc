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
import { DatasetStatistics } from '../../../pages/project-details/components';
import { DatasetStatisticsDTO } from '../dtos';

export const getDatasetStatisticsEntity = (statistics: DatasetStatisticsDTO): DatasetStatistics => {
    const {
        annotated_videos,
        annotated_images,
        annotated_frames,
        videos,
        score,
        images,
        objects_per_label,
        object_size_distribution_per_label,
    } = statistics;

    return {
        videos,
        images,
        score: !score || score < 0 ? 0 : score * 100,
        annotatedFrames: annotated_frames,
        annotatedImages: annotated_images,
        annotatedVideos: annotated_videos,
        objectsPerLabel: objects_per_label,
        objectSizeDistributionPerLabel: object_size_distribution_per_label.map(
            ({
                label_color,
                label_id,
                label_name,
                aspect_ratio_threshold_tall,
                aspect_ratio_threshold_wide,
                cluster_center,
                cluster_width_height,
                object_distribution_from_aspect_ratio,
                size_distribution,
            }) => ({
                labelColor: label_color,
                labelId: label_id,
                labelName: label_name,
                aspectRatioThresholdTall: aspect_ratio_threshold_tall,
                aspectRatioThresholdWide: aspect_ratio_threshold_wide,
                objectDistributionFromAspectRatio: object_distribution_from_aspect_ratio,
                sizeDistribution: size_distribution,
                clusterCenter: cluster_center,
                clusterWidthHeight: cluster_width_height,
            })
        ),
    };
};

const mockedDatasetStatisticsDTO: DatasetStatisticsDTO = {
    images: 8,
    videos: 6,
    score: 68,
    annotated_frames: 2,
    annotated_images: 5,
    annotated_videos: 4,
    objects_per_label: [
        {
            color: '#b100ffff',
            label: 'circle',
            value: 2,
        },
        {
            color: '#00147fff',
            label: 'square',
            value: 4,
        },
        {
            color: '#00fffaff',
            label: 'rectangle',
            value: 1,
        },
        {
            color: '#2a2b2eff',
            label: 'Empty torch_segmentation torch_segmentation',
            value: 0,
        },
    ],
    object_size_distribution_per_label: [
        {
            cluster_center: [402, 276],
            cluster_width_height: [304, 277],
            label_color: '#edb200ff',
            label_id: '619b97d3f19eee235e66b8d8',
            label_name: 'testdetc',
            object_distribution_from_aspect_ratio: {
                balanced: 2,
                tall: 0,
                wide: 0,
            },
            size_distribution: [
                [554, 414],
                [250, 137],
            ],
            aspect_ratio_threshold_wide: 0.07,
            aspect_ratio_threshold_tall: 6.87,
        },
    ],
};

export const mockedDatasetStatistics = getDatasetStatisticsEntity(mockedDatasetStatisticsDTO);
