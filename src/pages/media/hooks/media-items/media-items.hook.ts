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

import { MediaCount, MediaItem, MediaItemResponse } from '../../../../core/media';
import { MediaSearchOptions, MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';
import { useMediaQuery } from './media-query.hook';

interface UseMediaItemsProps {
    mediaService: MediaService;
    datasetIdentifier: DatasetIdentifier;
    queryOptions: InfiniteQueryObserverOptions<MediaItemResponse>;
    mediaItemsLoadSize: number;
    mediaSearchOptions: Partial<MediaSearchOptions>;
}

interface UseMediaItems {
    media: MediaItem[];
    mediaCount: MediaCount | undefined;
    isMediaLoading: boolean;
    loadNextMedia: (init?: boolean) => Promise<void>;
}

export const useMediaItems = ({
    mediaService,
    datasetIdentifier,
    queryOptions = {},
    mediaItemsLoadSize,
    mediaSearchOptions,
}: UseMediaItemsProps): UseMediaItems => {
    const mediaQuery = useMediaQuery(
        mediaService,
        datasetIdentifier,
        queryOptions,
        mediaItemsLoadSize,
        mediaSearchOptions
    );

    const { isLoading, isFetching, isFetchingNextPage, isFetchingPreviousPage, refetch, hasNextPage, fetchNextPage } =
        mediaQuery;

    const media = mediaQuery.data?.pages?.flatMap((response: MediaItemResponse) => response.media) ?? [];
    const mediaCount = mediaQuery.data?.pages[0].mediaCount;
    const isMediaLoading = isLoading || isFetching || isFetchingNextPage || isFetchingPreviousPage;
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

    return { media, mediaCount, isMediaLoading, loadNextMedia };
};
