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

import isEqual from 'lodash/isEqual';
import { InfiniteData, useQueryClient } from 'react-query';

import { Annotation } from '../../../../core/annotations';
import {
    AnnotationStatePerTask,
    isVideoFrame,
    MediaItem,
    MediaItemResponse,
    MEDIA_ANNOTATION_STATUS,
    MEDIA_TYPE,
} from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { useTask } from '../task-provider/task-provider.component';

interface UseOptimisticallyUpdateAnnotationStatus {
    (mediaItem: MediaItem, annotations: ReadonlyArray<Annotation>, annotationStates?: AnnotationStatePerTask[]): void;
}
export const useOptimisticallyUpdateAnnotationStatus = (
    datasetIdentifier: DatasetIdentifier
): UseOptimisticallyUpdateAnnotationStatus => {
    const queryClient = useQueryClient();

    const { selectedTask } = useTask();

    const mediaQueryKey = QUERY_KEYS.MEDIA_ITEMS(datasetIdentifier);
    const advancedMediaQueryKey = QUERY_KEYS.ADVANCED_MEDIA_ITEMS(datasetIdentifier, {}, {});

    const optimisticallyUpdateAnnotationStatus = (
        mediaItem: MediaItem,
        annotations: ReadonlyArray<Annotation>,
        annotationStates?: AnnotationStatePerTask[]
    ) => {
        const status = annotations.length > 0 ? MEDIA_ANNOTATION_STATUS.ANNOTATED : MEDIA_ANNOTATION_STATUS.NONE;

        queryClient.setQueryData<ReadonlyArray<Annotation> | undefined>(
            QUERY_KEYS.SELECTED_MEDIA_ITEM.ANNOTATIONS(mediaItem.identifier),
            () => annotations
        );

        // Remove the currently selected media item's query so that it uses the
        // new annotations as the currently saved annotations.
        // This disables saving the same annotations twice since we only allow
        // the user to submit annotations if they've made changes.
        queryClient.removeQueries(QUERY_KEYS.SELECTED_MEDIA_ITEM.SELECTED(mediaItem.identifier, selectedTask?.id));

        // Fuzzy match all mediaQueryKeys
        queryClient.setQueriesData<InfiniteData<MediaItemResponse> | undefined>(mediaQueryKey, (data) => {
            if (data === undefined) {
                return data;
            }

            const pages = data.pages.map((page): MediaItemResponse => {
                const nextPage = page.nextPage;

                // Update status of mediaItem
                const media = page.media.map((cachedMediaItem) => {
                    if (isEqual(cachedMediaItem.identifier, mediaItem.identifier)) {
                        return { ...cachedMediaItem, status, annotationStatePerTask: annotationStates };
                    }

                    return cachedMediaItem;
                });

                return { nextPage, media, mediaCount: page.mediaCount };
            });

            return { ...data, pages };
        });

        queryClient.setQueriesData<InfiniteData<MediaItemResponse> | undefined>(advancedMediaQueryKey, (data) => {
            if (data === undefined) {
                return data;
            }

            const pages = data.pages.map((page): MediaItemResponse => {
                const nextPage = page.nextPage;

                // Update status of mediaItem
                const media = page.media.map((cachedMediaItem) => {
                    if (isEqual(cachedMediaItem.identifier, mediaItem.identifier)) {
                        return { ...cachedMediaItem, status, annotationStatePerTask: annotationStates };
                    }

                    return cachedMediaItem;
                });

                return { nextPage, media, mediaCount: page.mediaCount };
            });

            return { ...data, pages };
        });

        // Optimistically update queries that fetch the label ids assigned to a video frame
        if (isVideoFrame(mediaItem)) {
            const videoQueryKey = QUERY_KEYS.VIDEO_TIMELINE_ANNOTATIONS(datasetIdentifier, {
                type: MEDIA_TYPE.VIDEO,
                videoId: mediaItem.identifier.videoId,
            });

            queryClient.setQueryData<Record<number, Set<string>>>(videoQueryKey, (data) => {
                if (data === undefined) {
                    return {};
                }

                const labelIds = annotations.flatMap(({ labels }) => labels.map(({ id }) => id));

                data[mediaItem.identifier.frameNumber] = new Set(labelIds);

                return data;
            });
        }
    };

    return optimisticallyUpdateAnnotationStatus;
};
