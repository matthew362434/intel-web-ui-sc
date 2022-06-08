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

import { useEffect } from 'react';

import { MEDIA_ANNOTATION_STATUS } from '../../../../core/media';
import { useAnnotator } from '../../providers';
import { useDataset } from '../../providers/dataset-provider/dataset-provider.component';

export const useSelectFirstMediaItem = (): void => {
    const { setSelectedMediaItem } = useAnnotator();
    const { mediaItemsQuery } = useDataset();
    const { isFetching, data } = mediaItemsQuery;

    useEffect(() => {
        if (data !== undefined && !isFetching) {
            const mediaItems = data.pages.flatMap(({ media }) => media);

            if (mediaItems.length === 0) {
                return;
            }

            // Help the user by selecting an item that's not been annotated
            const firstUnannotatedMediaItem = mediaItems.find((media) => {
                return media.status === MEDIA_ANNOTATION_STATUS.NONE;
            });

            if (firstUnannotatedMediaItem !== undefined) {
                setSelectedMediaItem(firstUnannotatedMediaItem);
            } else {
                setSelectedMediaItem(mediaItems[0]);
            }
        }
    }, [data, setSelectedMediaItem, isFetching]);
};
