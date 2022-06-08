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
import { MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { usePrevious } from '../../../../hooks/use-previous/use-previous.hook';
import { useTask } from '../../../annotator/providers';

// We don't want to refetch the active set when the user switches between tasks or dataset
// (i.e. change the datasetIdentifier or selectedTask?.id), therefore we set the stale time
// to Infinity.
// However we do want to refetch when the user opens the annotator, because they may have
// uploaded new media so when this hook is unmounted we reset the stale data.
const useStaleTime = () => {
    const wasUnMounted = usePrevious(null);
    return wasUnMounted === undefined ? undefined : Infinity;
};

export const useActiveMediaQuery = (
    mediaService: MediaService,
    datasetIdentifier: DatasetIdentifier,
    queryOptions: InfiniteQueryObserverOptions<MediaItemResponse> = {},
    mediaItemsLoadSize = 50
): UseInfiniteQueryResult<MediaItemResponse> => {
    const { selectedTask } = useTask();
    const activeQueryKey = QUERY_KEYS.ACTIVE_MEDIA_ITEMS(datasetIdentifier, selectedTask);
    const staleTime = useStaleTime();

    return useInfiniteQuery<MediaItemResponse>({
        queryKey: activeQueryKey,
        queryFn: async () => {
            const { media } = await mediaService.getActiveMedia(
                datasetIdentifier,
                mediaItemsLoadSize,
                selectedTask?.id
            );

            return { media, nextPage: 'true', mediaCount: undefined };
        },
        getNextPageParam: (_, pages) => {
            if (pages.length === 1) {
                return true;
            }

            // Collect all used media identifiers from previous pages
            const identifiers = new Set();
            for (let idx = 0; idx < pages.length - 1; idx++) {
                pages[idx].media.forEach(({ identifier }) => {
                    identifiers.add(JSON.stringify(identifier));
                });
            }

            // There is a next page is the current page contains unused media identifiers
            const lastPage = pages[pages.length - 1];
            return lastPage.media.some(({ identifier }) => {
                return !identifiers.has(JSON.stringify(identifier));
            });
        },
        getPreviousPageParam: () => undefined,
        // Remove any duplicated media items since active set is not deterministic?
        select: (data) => {
            const identifiers = new Set();

            const pages = data.pages.map((page) => {
                const media = page.media.filter(({ identifier }) => {
                    return !identifiers.has(JSON.stringify(identifier));
                });

                media.forEach(({ identifier }) => {
                    identifiers.add(JSON.stringify(identifier));
                });

                return { ...page, media };
            });

            return { ...data, pages };
        },
        staleTime,
        ...queryOptions,
    });
};
