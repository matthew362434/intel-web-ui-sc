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

import { AdvancedFilterOptions, AdvancedFilterSortingOptions } from '../../../pages/media/media-filter.interface';
import { MediaUploadItemDTO } from '../../../providers/media-upload-provider/media-upload.interface';
import { DatasetIdentifier } from '../../projects';
import { MediaAdvancedFilterResponse, MediaItem, MediaItemDTO, MediaItemResponse } from '../index';
import { MediaIdentifier } from '../media.interface';

export interface MediaSearchOptions {
    readonly name: string;
    setName: (search: string) => void;
    readonly sortBy: string;
    setSortBy: (sortBy: string) => void;
    readonly sortDir: string;
    setSortDir: (sortDir: string) => void;
    readonly status: string;
    setStatus: (statusFilter: string) => void;
    readonly labels: string[];
    setLabels: (labelIds: string[]) => void;
}

export interface MediaService {
    getMedia(
        datasetIdentifier: DatasetIdentifier,
        mediaItemsLoadSize: number,
        nextPage: string | null | undefined,
        mediaSearchOptions: Partial<MediaSearchOptions>
    ): Promise<MediaItemResponse>;

    getAdvancedFilterMedia(
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaItemsLoadSize: number,
        nextPageUrl: string | null | undefined,
        searchOptions: AdvancedFilterOptions,
        sortingOptions: AdvancedFilterSortingOptions
    ): Promise<MediaAdvancedFilterResponse>;

    getActiveMedia(
        datasetIdentifier: DatasetIdentifier,
        mediaItemsLoadSize: number,
        taskId?: string
    ): Promise<{ media: MediaItem[] }>;

    getMediaItem(
        datasetIdentifier: DatasetIdentifier,
        mediaIdentifier: MediaIdentifier
    ): Promise<MediaItem | undefined>;

    uploadMedia(
        datasetIdentifier: DatasetIdentifier,
        uploadId: string,
        media: MediaUploadItemDTO,
        onProgress: (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number) => void,
        setNetworkSpeed: Dispatch<SetStateAction<number[]>>
    ): Promise<AxiosResponse<MediaItemDTO>>;
    deleteMedia(datasetIdentifier: DatasetIdentifier, mediaItem: MediaItem): Promise<void>;
}
