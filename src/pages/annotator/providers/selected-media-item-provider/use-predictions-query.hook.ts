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
import { QueryClient, useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { PredictionService } from '../../../../core/annotations';
import { PredictionMode, PredictionResult } from '../../../../core/annotations/services/prediction-service.interface';
import { Label } from '../../../../core/labels';
import { isVideoFrame, MediaItem, MEDIA_TYPE, VideoFrame } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';

const updateVideoTimeline = (
    queryClient: QueryClient,
    datasetIdentifier: DatasetIdentifier,
    mediaItem: VideoFrame,
    prediction: PredictionResult
) => {
    // Optimistically update queries that fetch the label ids assigned to a video frame
    const videoQueryKey = QUERY_KEYS.VIDEO_TIMELINE_PREDICTIONS(datasetIdentifier, {
        type: MEDIA_TYPE.VIDEO,
        videoId: mediaItem.identifier.videoId,
    });
    queryClient.setQueryData<Record<number, Set<string>>>(videoQueryKey, (data) => {
        if (data === undefined) {
            return {};
        }

        const labelIds = prediction.annotations.flatMap(({ labels }) => labels.map(({ id }) => id));

        data[mediaItem.identifier.frameNumber] = new Set(labelIds);

        return data;
    });
};

interface UseGetPredictions {
    predictionService: PredictionService;
    projectLabels: Label[];
    datasetIdentifier: DatasetIdentifier;
    mediaItem: MediaItem | undefined;
    taskId?: string;
}

export const usePredictionsQuery = ({
    predictionService,
    projectLabels,
    datasetIdentifier,
    mediaItem,
    taskId,
}: UseGetPredictions): UseQueryResult<PredictionResult> => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: QUERY_KEYS.SELECTED_MEDIA_ITEM.PREDICTIONS(mediaItem?.identifier, taskId),
        queryFn: async () => {
            if (mediaItem === undefined) {
                throw new Error("Can't fetch undefined media item");
            }

            return await predictionService.getPredictions(
                datasetIdentifier,
                projectLabels,
                mediaItem,
                PredictionMode.AUTO,
                taskId
            );
        },
        enabled: mediaItem !== undefined,
        onSuccess: (prediction) => {
            if (mediaItem !== undefined && isVideoFrame(mediaItem)) {
                updateVideoTimeline(queryClient, datasetIdentifier, mediaItem, prediction);
            }
        },
    });
};
