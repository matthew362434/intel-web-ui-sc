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

import { InfiniteQueryObserverOptions, useInfiniteQuery, UseInfiniteQueryResult } from 'react-query';

import { MediaItemResponse } from '../../../../core/media';
import { MediaSearchOptions, MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';

export const useMediaQuery = (
    mediaService: MediaService,
    datasetIdentifier: DatasetIdentifier,
    queryOptions: InfiniteQueryObserverOptions<MediaItemResponse> = {},
    mediaItemsLoadSize = 50,
    searchOptions: Partial<MediaSearchOptions> = {}
): UseInfiniteQueryResult<MediaItemResponse> => {
    const mediaQueryKey = QUERY_KEYS.MEDIA_ITEMS(datasetIdentifier, searchOptions);

    return useInfiniteQuery<MediaItemResponse>({
        queryKey: mediaQueryKey,
        queryFn: async ({ pageParam: nextPage = null }) => {
            return await mediaService.getMedia(datasetIdentifier, mediaItemsLoadSize, nextPage, searchOptions);
        },
        getNextPageParam: ({ nextPage }) => nextPage,
        getPreviousPageParam: () => undefined,
        ...queryOptions,
    });
};
