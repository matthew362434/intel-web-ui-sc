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
import { Annotation } from '../annotation.interface';
import { PredictionMap } from '../prediction.interface';

export interface PredictionResult {
    annotations: ReadonlyArray<Annotation>;
    maps: PredictionMap[];
}

export enum PredictionMode {
    AUTO = 'auto',
    ONLINE = 'online',
    LATEST = 'latest',
}

interface PredictionService {
    getPredictions(
        datasetIdentifier: DatasetIdentifier,
        projectLabels: Label[],
        mediaItemId: MediaItem,
        mode?: PredictionMode,
        taskId?: string
    ): Promise<PredictionResult>;

    getVideoPredictionsTimeline(
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        mode?: PredictionMode
    ): Promise<Record<number, Set<string>>>;
}

export default PredictionService;
