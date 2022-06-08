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

import { useCallback } from 'react';

import { InfiniteQueryObserverOptions } from 'react-query';

import { MediaAdvancedCount, MediaAdvancedFilterResponse, MediaItem } from '../../../../core/media';
import { MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';
import { AdvancedFilterOptions, AdvancedFilterSortingOptions } from '../../media-filter.interface';
import { useAdvancedFilterQuery } from './advanced-filter-query.hook';

interface UseAdvancedMediaFilterProps {
    mediaService: MediaService;
    mediaItemsLoadSize: number;
    datasetIdentifier: DatasetIdentifier;
    mediaFilterOptions: AdvancedFilterOptions;
    queryOptions: InfiniteQueryObserverOptions<MediaAdvancedFilterResponse>;
    sortingOptions: AdvancedFilterSortingOptions;
}

interface UseAdvancedMediaFilter extends MediaAdvancedCount {
    media: MediaItem[];
    isMediaFetching: boolean;
    loadNextMedia: (init?: boolean) => Promise<void>;
}

export const useAdvancedMediaFilter = ({
    mediaService,
    datasetIdentifier,
    queryOptions = {},
    mediaItemsLoadSize,
    mediaFilterOptions,
    sortingOptions,
}: UseAdvancedMediaFilterProps): UseAdvancedMediaFilter => {
    const mediaQuery = useAdvancedFilterQuery(
        mediaService,
        datasetIdentifier,
        queryOptions,
        mediaItemsLoadSize,
        mediaFilterOptions,
        sortingOptions
    );

    const { isFetching, isFetchingNextPage, isFetchingPreviousPage, refetch, hasNextPage, fetchNextPage } = mediaQuery;

    const media = mediaQuery.data?.pages?.flatMap((response: MediaAdvancedFilterResponse) => response.media) ?? [];
    const {
        totalImages = 0,
        totalVideos = 0,
        totalMatchedImages = 0,
        totalMatchedVideos = 0,
        totalMatchedVideoFrames = 0,
    } = mediaQuery.data?.pages[0] ?? {};
    const isMediaFetching = isFetching || isFetchingNextPage || isFetchingPreviousPage;
    const loadNextMedia = useCallback(
        async (init = false) => {
            if (init) {
                await refetch();
            } else if (!isFetching && hasNextPage) {
                await fetchNextPage();
            }
        },
        [isFetching, hasNextPage, refetch, fetchNextPage]
    );

    return {
        media,
        totalImages,
        totalMatchedImages,
        totalMatchedVideoFrames,
        totalMatchedVideos,
        totalVideos,
        isMediaFetching,
        loadNextMedia,
    };
};
