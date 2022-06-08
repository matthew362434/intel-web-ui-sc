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

import axios from 'axios';

import { Label, LABEL_SOURCE } from '../../labels';
import { MediaItem, Video } from '../../media';
import { DatasetIdentifier } from '../../projects';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { PredictionDTO, VideoAnnotationsDTO } from '../dtos';
import PredictionService, { PredictionMode, PredictionResult } from './prediction-service.interface';
import { getAnnotatedVideoLabels, getAnnotation, getPredictionMaps } from './utils';

// Since predictions can take a while to load we want to throwa  timeout exception
// if they aren't returned in proper time (in this case 3 seconds)
const PREDICTION_TIMEOUT = 3000;

const createApiPredictionService = (): PredictionService => {
    const getPredictions = async (
        datasetIdentifier: DatasetIdentifier,
        projectLabels: Label[],
        mediaItem: MediaItem,
        mode: PredictionMode = PredictionMode.AUTO,
        taskId?: string
    ): Promise<PredictionResult> => {
        try {
            const options =
                mode === PredictionMode.AUTO
                    ? { timeout: PREDICTION_TIMEOUT, timeoutErrorMessage: 'Failed retrieving predictions' }
                    : undefined;

            const response = await AXIOS.get<PredictionDTO>(
                API_URLS.PREDICTION(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    mediaItem.identifier,
                    mode,
                    taskId
                ),
                options
            );

            const data = response.data;

            if (!data) {
                return { annotations: [], maps: [] };
            }

            const annotations = data.annotations.map((annotation, index) => {
                return getAnnotation(mediaItem, annotation, projectLabels, index, LABEL_SOURCE.MODEL);
            });

            const maps = getPredictionMaps(data.maps);

            return { annotations, maps };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // NOTE: using error.code === "ECONNABORTED" we could provide a notification
                // that we weren't able to get predictions in time
                return { annotations: [], maps: [] };
            }

            throw error;
        }
    };

    const getVideoPredictionsTimeline = async (
        datasetIdentifier: DatasetIdentifier,
        mediaItem: Video,
        mode: PredictionMode = PredictionMode.LATEST
    ) => {
        const url = API_URLS.PREDICTION(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            mediaItem.identifier,
            mode
        );

        const { data } = await AXIOS.get<VideoAnnotationsDTO>(url);

        return getAnnotatedVideoLabels(data);
    };

    return { getPredictions, getVideoPredictionsTimeline };
};

export default createApiPredictionService;
