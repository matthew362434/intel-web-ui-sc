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

import { Label } from '../../labels';
import { MediaItem, Video } from '../../media';
import { DatasetIdentifier } from '../../projects';
import { ShapeType } from '../shapetype.enum';
import { labelFromModel } from '../utils';
import { Annotation } from './../';
import PredictionService, { PredictionMode, PredictionResult } from './prediction-service.interface';

const createInmemoryPredictionService = (): PredictionService => {
    const getPredictions = async (
        datasetIdentifier: DatasetIdentifier,
        labels: Label[],
        mediaItem: MediaItem,
        _mode: PredictionMode = PredictionMode.AUTO
    ): Promise<PredictionResult> => {
        const annotations: Annotation[] = [
            {
                id: 'rect-1',
                labels: [
                    labelFromModel(labels[1], 0.1),
                    labelFromModel(labels[0], 0.4),
                    labelFromModel(labels[10], 0.7),
                    labelFromModel(labels[12], 0.9),
                ],
                shape: { shapeType: ShapeType.Rect as const, x: 500, y: 100, width: 200, height: 200 },
                zIndex: 0,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'rect-2',
                labels: [labelFromModel(labels[1], 0.3)],
                shape: { shapeType: ShapeType.Rect as const, x: 110, y: 310, width: 100, height: 200 },
                zIndex: 1,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'circle-1',
                labels: [labelFromModel(labels[2], 0.9)],
                shape: { shapeType: ShapeType.Circle as const, x: 200, y: 150, r: 100 },
                zIndex: 2,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
            {
                id: 'polygon-1',
                labels: [labelFromModel(labels[3], 0.1)],
                shape: {
                    shapeType: ShapeType.Polygon as const,
                    points: [
                        { x: 550, y: 300 },
                        { x: 550, y: 450 },
                        { x: 750, y: 540 },
                    ],
                },
                zIndex: 3,
                isSelected: false,
                isHovered: false,
                isHidden: false,
                isLocked: false,
            },
        ];

        return { annotations, maps: [] };
    };
    const getVideoPredictionsTimeline = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        _mode: PredictionMode = PredictionMode.LATEST
    ) => {
        return {};
    };

    return { getPredictions, getVideoPredictionsTimeline };
};

export default createInmemoryPredictionService;
