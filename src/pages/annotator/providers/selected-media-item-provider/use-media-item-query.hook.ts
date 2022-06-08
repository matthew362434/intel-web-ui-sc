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

import { useQuery, QueryObserverOptions } from 'react-query';

import { MediaIdentifier, MediaItem } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { useApplicationServices } from '../../../../providers/application-provider/application-services-provider.component';

export const useMediaItemQuery = (
    datasetIdentifier: DatasetIdentifier,
    mediaItemId: MediaIdentifier | undefined,
    options: QueryObserverOptions<MediaItem>
) => {
    const { mediaService } = useApplicationServices();
    const { addNotification } = useNotification();

    return useQuery<MediaItem>({
        queryKey: QUERY_KEYS.MEDIA_ITEM(datasetIdentifier, mediaItemId),
        queryFn: async () => {
            if (mediaItemId === undefined) {
                throw new Error('Could not retrieve media item');
            }

            const media = await mediaService.getMediaItem(datasetIdentifier, mediaItemId);

            if (media === undefined) {
                throw new Error('Could not retrieve media item');
            }

            return media;
        },
        onError: () => {
            addNotification('Could not retrieve media item', NOTIFICATION_TYPE.ERROR);
        },
        enabled: mediaItemId !== undefined,
        ...options,
    });
};
