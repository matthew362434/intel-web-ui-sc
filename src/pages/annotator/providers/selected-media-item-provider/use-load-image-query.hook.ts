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

import { MediaItem } from '../../../../core/media';
import QUERY_KEYS from '../../../../core/requests/query-keys';

export const loadImage = (media: MediaItem): Promise<HTMLImageElement> => {
    return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();

        image.onload = () => {
            resolve(image);
        };

        image.src = media.src;
    });
};

export const useLoadImageQuery = (mediaItem: MediaItem | undefined): UseQueryResult<HTMLImageElement, AxiosError> => {
    return useQuery({
        queryKey: QUERY_KEYS.SELECTED_MEDIA_ITEM.IMAGE(mediaItem?.identifier),
        queryFn: async () => {
            if (mediaItem === undefined) {
                throw new Error("Can't fetch undefined media item");
            }

            return loadImage(mediaItem);
        },
        enabled: mediaItem !== undefined,
    });
};
