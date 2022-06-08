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

import { AdvancedFilterOptions, AdvancedFilterSortingOptions } from '../../../../pages/media/media-filter.interface';
import { MediaUploadItemDTO } from '../../../../providers/media-upload-provider/media-upload.interface';
import { DatasetIdentifier } from '../../../projects';
import { API_URLS } from '../../../services';
import AXIOS from '../../../services/axios-instance';
import {
    ActiveMediaDTO,
    isImage,
    MEDIA_GROUP,
    MEDIA_TYPE,
    MediaDTO,
    MediaItem,
    MediaItemDTO,
    MediaItemResponse,
    MediaAdvancedFilterResponse,
    MediaAdvancedFilterDTO,
    isVideo,
} from '../../index';
import { MediaIdentifier } from '../../media.interface';
import { MediaSearchOptions, MediaService } from '../media-service.interface';
import { getActiveMediaItems, getMediaItemFromDTO } from '../utils';

const API_PREFIX = '/api';
const getNextPage = (nextPage: string | undefined) => {
    if (nextPage === undefined) {
        return nextPage;
    }

    return nextPage.startsWith(API_PREFIX) ? nextPage.slice(API_PREFIX.length) : nextPage;
};

const getActiveMedia = async (
    { workspaceId, projectId }: DatasetIdentifier,
    mediaItemsLoadSize: number,
    taskId?: string
): Promise<{ media: MediaItem[] }> => {
    const { data, status } = await AXIOS.get<ActiveMediaDTO>(
        API_URLS.ACTIVE_MEDIA(workspaceId, projectId, mediaItemsLoadSize, taskId)
    );

    if (status === 204) {
        return { media: [] };
    }

    const media = data.active_set.flatMap((item) => {
        return getActiveMediaItems({ workspaceId, projectId }, item);
    });

    return { media };
};

export const createApiMediaService = (): MediaService => {
    const getMedia = async (
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaItemsLoadSize: number,
        nextPageUrl: string | null | undefined,
        mediaSearchOptions: Partial<MediaSearchOptions>
    ): Promise<MediaItemResponse> => {
        const loadUrl =
            nextPageUrl ?? API_URLS.MEDIA(workspaceId, projectId, datasetId, mediaItemsLoadSize, mediaSearchOptions);
        const { data } = await AXIOS.get<MediaDTO>(loadUrl);
        const nextPage = getNextPage(data.next_page);
        const media = data.media.map((item: MediaItemDTO) => {
            return getMediaItemFromDTO({ workspaceId, projectId, datasetId }, item);
        });

        return { media, nextPage, mediaCount: data.media_count };
    };

    const getAdvancedFilterMedia = async (
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaItemsLoadSize: number,
        nextPageUrl: string | null | undefined,
        searchOptions: AdvancedFilterOptions,
        sortingOptions: AdvancedFilterSortingOptions
    ): Promise<MediaAdvancedFilterResponse> => {
        const loadUrl =
            nextPageUrl ??
            API_URLS.ADVANCED_DATASET_FILTER(workspaceId, projectId, datasetId, mediaItemsLoadSize, sortingOptions);
        const { data } = await AXIOS.post<MediaAdvancedFilterDTO>(loadUrl, searchOptions);
        const nextPage = getNextPage(data.next_page);
        const media = data.items.map((item: MediaItemDTO) => {
            return getMediaItemFromDTO({ workspaceId, projectId, datasetId }, item);
        });

        return {
            media,
            nextPage,
            totalImages: data.total_images,
            totalMatchedImages: data.total_matched_images,
            totalMatchedVideoFrames: data.total_matched_video_frames,
            totalMatchedVideos: data.total_matched_videos,
            totalVideos: data.total_videos,
        };
    };

    const getMediaItem = async (
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaIdentifier: MediaIdentifier
    ): Promise<MediaItem | undefined> => {
        if (mediaIdentifier.type === MEDIA_TYPE.VIDEO_FRAME) {
            // The API doesn't have a get details endpoint for a video frame, so inseatd we will
            // get its details from the associated video
            const mediaItem = await getMediaItem(
                { workspaceId, projectId, datasetId },
                { type: MEDIA_TYPE.VIDEO, videoId: mediaIdentifier.videoId }
            );

            if (mediaItem === undefined || !isVideo(mediaItem)) {
                throw new Error('Could not retrieve video details for video frame');
            }

            const src = API_URLS.MEDIA_ITEM_SRC(workspaceId, projectId, datasetId, mediaIdentifier);

            return { ...mediaItem, identifier: mediaIdentifier, src };
        }

        const loadUrl = API_URLS.MEDIA_ITEM(workspaceId, projectId, datasetId, mediaIdentifier);
        const { data } = await AXIOS.get<MediaItemDTO>(loadUrl);

        return getMediaItemFromDTO({ workspaceId, projectId, datasetId }, data);
    };

    const uploadMedia = (
        datasetIdentifier: DatasetIdentifier,
        uploadId: string,
        media: MediaUploadItemDTO,
        onProgress: (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number) => void,
        setNetworkSpeed: Dispatch<SetStateAction<number[]>>
    ): Promise<AxiosResponse<MediaItemDTO>> => {
        const { file } = media;

        if (file.type.startsWith(MEDIA_TYPE.IMAGE)) {
            return uploadImage(datasetIdentifier, uploadId, media, onProgress, setNetworkSpeed);
        }

        return uploadVideo(datasetIdentifier, uploadId, media, onProgress, setNetworkSpeed);
    };

    const deleteMedia = async (datasetIdentifier: DatasetIdentifier, mediaItem: MediaItem): Promise<void> => {
        if (isImage(mediaItem)) {
            await deleteImage(datasetIdentifier, mediaItem.identifier.imageId);

            return;
        }

        await deleteVideo(datasetIdentifier, mediaItem.identifier.videoId);
    };

    const uploadImage = (
        datasetIdentifier: DatasetIdentifier,
        uploadId: string,
        media: MediaUploadItemDTO,
        onProgress: (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number) => void,
        setNetworkSpeed: Dispatch<SetStateAction<number[]>>
    ): Promise<AxiosResponse<MediaItemDTO>> => {
        const { workspaceId, projectId, datasetId } = datasetIdentifier;
        const { file, uploadInfo } = media;
        const formData = new FormData();

        formData.set('file', file);

        if (uploadInfo) formData.set('upload_info', JSON.stringify(uploadInfo));

        const timeStamp = Date.now();

        return AXIOS.post<MediaItemDTO>(
            API_URLS.MEDIA_UPLOAD(workspaceId, projectId, datasetId, MEDIA_GROUP.IMAGES),
            formData,
            {
                headers: { 'content-type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                    onProgress(uploadId, datasetIdentifier, file, Math.round((event.loaded * 100) / event.total));
                    if (event.loaded === event.total)
                        setNetworkSpeed((networkSpeed: number[]) => [
                            ...networkSpeed,
                            Math.round(event.total / (Date.now() - timeStamp)),
                        ]);
                },
            }
        );
    };

    const uploadVideo = (
        datasetIdentifier: DatasetIdentifier,
        uploadId: string,
        media: MediaUploadItemDTO,
        onProgress: (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number) => void,
        setNetworkSpeed: Dispatch<SetStateAction<number[]>>
    ): Promise<AxiosResponse<MediaItemDTO>> => {
        const { workspaceId, projectId, datasetId } = datasetIdentifier;
        const { file, uploadInfo } = media;
        const formData = new FormData();

        formData.set('file', file);

        if (uploadInfo) formData.set('upload_info', JSON.stringify(uploadInfo));

        const timeStamp = Date.now();

        return AXIOS.post<MediaItemDTO>(
            API_URLS.MEDIA_UPLOAD(workspaceId, projectId, datasetId, MEDIA_GROUP.VIDEOS),
            formData,
            {
                headers: { 'content-type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                    onProgress(uploadId, datasetIdentifier, file, Math.floor((event.loaded * 100) / event.total));
                    if (event.loaded === event.total)
                        setNetworkSpeed((networkSpeed: number[]) => [
                            ...networkSpeed,
                            Math.round(event.total / (Date.now() - timeStamp)),
                        ]);
                },
            }
        );
    };

    const deleteImage = async (
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaItemId: string
    ): Promise<void> => {
        await AXIOS.delete(API_URLS.MEDIA_DELETE(workspaceId, projectId, datasetId, MEDIA_GROUP.IMAGES, mediaItemId));
    };

    const deleteVideo = async (
        { workspaceId, projectId, datasetId }: DatasetIdentifier,
        mediaItemId: string
    ): Promise<void> => {
        await AXIOS.delete(API_URLS.MEDIA_DELETE(workspaceId, projectId, datasetId, MEDIA_GROUP.VIDEOS, mediaItemId));
    };

    return { getMedia, getMediaItem, getActiveMedia, uploadMedia, deleteMedia, getAdvancedFilterMedia };
};
