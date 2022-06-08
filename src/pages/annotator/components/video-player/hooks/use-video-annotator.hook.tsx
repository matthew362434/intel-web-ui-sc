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

import { Dispatch, SetStateAction, useState } from 'react';

import { useQuery, UseQueryResult } from 'react-query';

import { AnnotationService, PredictionService } from '../../../../../core/annotations';
import { MEDIA_TYPE, Video, VideoFrame } from '../../../../../core/media';
import { DatasetIdentifier } from '../../../../../core/projects';
import QUERY_KEYS from '../../../../../core/requests/query-keys';

export interface UseVideoEditor {
    isEnabled: boolean;
    setIsEnabled: Dispatch<SetStateAction<boolean>>;
    annotationsQuery: UseQueryResult<Record<number, Set<string>>>;
    predictionsQuery: UseQueryResult<Record<number, Set<string>>>;
}
export const useVideoEditor = (
    annotationService: AnnotationService,
    predictionService: PredictionService,
    datasetIdentifier: DatasetIdentifier,
    videoFrame: VideoFrame
): UseVideoEditor => {
    const [isEnabled, setIsEnabled] = useState(false);

    const video: Video = {
        ...videoFrame,
        identifier: {
            type: MEDIA_TYPE.VIDEO,
            videoId: videoFrame.identifier.videoId,
        },
    };

    const annotationsQuery = useQuery<Record<number, Set<string>>>({
        queryKey: QUERY_KEYS.VIDEO_TIMELINE_ANNOTATIONS(datasetIdentifier, video.identifier),
        queryFn: () => {
            return annotationService.getVideoAnnotationsTimeline(datasetIdentifier, video);
        },
        enabled: isEnabled,
    });

    const predictionsQuery = useQuery<Record<number, Set<string>>>({
        queryKey: QUERY_KEYS.VIDEO_TIMELINE_PREDICTIONS(datasetIdentifier, video.identifier),
        queryFn: () => {
            return predictionService.getVideoPredictionsTimeline(datasetIdentifier, video);
        },
        enabled: isEnabled,
    });

    return { isEnabled, setIsEnabled, annotationsQuery, predictionsQuery };
};
