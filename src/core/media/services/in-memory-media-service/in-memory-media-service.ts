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

import { Dispatch, SetStateAction } from 'react';

import { AxiosResponse } from 'axios';
import isEqual from 'lodash/isEqual';

import { MediaUploadItemDTO } from '../../../../providers/media-upload-provider/media-upload.interface';
import { DatasetIdentifier } from '../../../projects';
import { MediaItemDTO } from '../../dtos';
import { MediaAdvancedFilterResponse, MediaItem, MediaIdentifier, MediaItemResponse } from '../../media.interface';
import { MediaService } from '../media-service.interface';
import { DEFAULT_IN_MEMORY_MEDIA } from './default-media';

export const createInMemoryMediaService = (defaultMedia: MediaItem[] = DEFAULT_IN_MEMORY_MEDIA): MediaService => {
    const getMedia = async (_datasetIdentifier: DatasetIdentifier): Promise<MediaItemResponse> => {
        return {
            nextPage: '',
            media: defaultMedia,
            mediaCount: { images: 10, videos: 10 },
        };
    };

    const getAdvancedFilterMedia = async (
        _datasetIdentifier: DatasetIdentifier
    ): Promise<MediaAdvancedFilterResponse> => {
        return {
            nextPage: '',
            media: defaultMedia,
            totalImages: 10,
            totalMatchedImages: 10,
            totalMatchedVideoFrames: 10,
            totalMatchedVideos: 10,
            totalVideos: 10,
        };
    };

    const getActiveMedia = async (
        datasetIdentifier: DatasetIdentifier,
        _mediaItemsLoadSize: number
    ): Promise<{ media: MediaItem[] }> => {
        return getMedia(datasetIdentifier);
    };

    const uploadMedia = (
        _datasetIdentifier: DatasetIdentifier,
        _uploadId: string,
        _media: MediaUploadItemDTO,
        _onProgress: (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number) => void,
        _setNetworkSpeed: Dispatch<SetStateAction<number[]>>
    ): Promise<AxiosResponse<MediaItemDTO>> => {
        return new Promise<AxiosResponse<MediaItemDTO>>(() => undefined);
    };

    const deleteMedia = (_datasetIdentifier: DatasetIdentifier, _mediaItem: MediaItem): Promise<void> => {
        return Promise.resolve(undefined);
    };

    const getMediaItem = async (
        datasetIdentifier: DatasetIdentifier,
        mediaIdentifier: MediaIdentifier
    ): Promise<MediaItem | undefined> => {
        const { media } = await getMedia(datasetIdentifier);
        return media.find((mediaItem) => {
            return isEqual(mediaItem.identifier, mediaIdentifier);
        });
    };

    return { getMedia, getMediaItem, getActiveMedia, uploadMedia, deleteMedia, getAdvancedFilterMedia };
};
