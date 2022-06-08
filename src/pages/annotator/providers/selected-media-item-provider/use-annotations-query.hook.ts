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

import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

import { Annotation, AnnotationService } from '../../../../core/annotations';
import { Label } from '../../../../core/labels';
import { MediaItem } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';

interface UseGetAnnotations {
    annotationService: AnnotationService;
    projectLabels: Label[];
    datasetIdentifier: DatasetIdentifier;
    mediaItem: MediaItem | undefined;
}

// We almost always want to receive the most recent annotations and not rely on a
// cache. The only exception is when using the video player, in that case we'd like
// to use the cache from propagating annotations and / or playing videos (where we
// prefetch images and annotations)
const CACHE_TIME = 100;

export const useAnnotationsQuery = ({
    annotationService,
    projectLabels,
    datasetIdentifier,
    mediaItem,
}: UseGetAnnotations): UseQueryResult<Annotation[], AxiosError> => {
    return useQuery({
        queryKey: QUERY_KEYS.SELECTED_MEDIA_ITEM.ANNOTATIONS(mediaItem?.identifier),
        queryFn: async () => {
            if (mediaItem === undefined) {
                throw new Error("Can't fetch undefined media item");
            }

            return await annotationService.getAnnotations(datasetIdentifier, projectLabels, mediaItem);
        },
        enabled: mediaItem !== undefined,
        cacheTime: CACHE_TIME,
    });
};
