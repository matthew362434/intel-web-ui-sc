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

import { useMutation, UseMutationResult, useQuery, UseQueryResult } from 'react-query';

import { LabeledVideoRange } from '../../../../core/annotations';
import { Label } from '../../../../core/labels';
import { Video } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { useApplicationServices } from '../../../../providers/application-provider/application-services-provider.component';

export const useLabeledVideoRangesQuery = (
    datasetIdentifier: DatasetIdentifier,
    mediaItem: Video,
    labels: Label[],
    onSuccess: () => void
): UseQueryResult<LabeledVideoRange[]> => {
    const { annotationService } = useApplicationServices();

    return useQuery({
        queryKey: QUERY_KEYS.VIDEO_RANGE_ANNOTATIONS(datasetIdentifier, mediaItem.identifier),
        queryFn: async () => {
            return await annotationService.getLabeledVideoRanges(datasetIdentifier, mediaItem, labels);
        },
        onSuccess,
    });
};

export const useLabeledVideoRangesMutation = (
    datasetIdentifier: DatasetIdentifier,
    mediaItem: Video
): UseMutationResult<void, unknown, LabeledVideoRange[]> => {
    const { annotationService } = useApplicationServices();

    return useMutation({
        mutationFn: async (ranges: LabeledVideoRange[]) => {
            return await annotationService.saveLabeledVideoRanges(datasetIdentifier, mediaItem, ranges);
        },
    });
};
