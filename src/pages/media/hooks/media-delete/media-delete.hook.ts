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

import { useCallback, useState } from 'react';

import { MediaItem } from '../../../../core/media';
import { MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';

interface UseMediaDelete {
    deleteMedia: (mediaItems: MediaItem[]) => Promise<void>;
    isDeletionInProgress: boolean;
}
export const useMediaDelete = (mediaService: MediaService, datasetIdentifier: DatasetIdentifier): UseMediaDelete => {
    const [isDeletionInProgress, setDeletionInProgress] = useState<boolean>(false);

    const deleteMedia = useCallback(
        async (mediaItems: MediaItem[]): Promise<void> => {
            for (const mediaItem of mediaItems) {
                setDeletionInProgress(true);

                await mediaService.deleteMedia(datasetIdentifier, mediaItem).catch((error) => {
                    setDeletionInProgress(false);

                    throw error;
                });
            }
            setDeletionInProgress(false);
        },
        [datasetIdentifier, mediaService]
    );

    return { deleteMedia, isDeletionInProgress };
};
