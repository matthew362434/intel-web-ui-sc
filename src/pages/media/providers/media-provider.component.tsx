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

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { InfiniteData } from 'react-query';

import { Label } from '../../../core/labels';
import { MediaAdvancedCount, MediaAdvancedFilterResponse, MediaItem } from '../../../core/media';
import { MediaSearchOptions, MediaService } from '../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../core/projects';
import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import { UploadMedia } from '../../../providers/media-upload-provider/media-upload.interface';
import { MissingProviderError } from '../../../shared/missing-provider-error';
import { useMediaDelete } from '../hooks';
import { useAdvancedMediaFilter } from '../hooks/media-items/advanced-media-filter.hook';
import {
    AdvancedFilterOptions,
    AdvancedFilterSortingOptions,
    SearchRuleField,
    SearchRuleOperator,
} from '../media-filter.interface';
import { addOrUpdateFilterRule } from '../util';

const MEDIA_ITEMS_DEFAULT_LOAD_SIZE = 100;

export interface MediaContextProps extends MediaAdvancedCount {
    readonly media: MediaItem[];
    readonly mediaSelection: MediaItem[];
    readonly mediaItemsLoadSize: number;
    readonly isMediaFetching: boolean;
    readonly isDeletionInProgress: boolean;
    readonly isMediaFilterEmpty: boolean;
    readonly mediaSearchOptions: Partial<MediaSearchOptions>;
    readonly anomalyLabel?: Label;
    readonly mediaFilterOptions: AdvancedFilterOptions;
    readonly sortingOptions: AdvancedFilterSortingOptions;
    resetMediaSelection: () => void;
    loadNextMedia: (init?: boolean) => Promise<void>;
    deleteMedia: (mediaItems: MediaItem[]) => Promise<void>;
    toggleItemInMediaSelection: (mediaItem: MediaItem) => void;
    addBulkMediaToSelection: (mediaItems: MediaItem[]) => void;
    setMediaSearchOptions: Dispatch<SetStateAction<Partial<MediaSearchOptions>>>;
    setMediaItemsLoadSize: (size: number) => void;
    setUploadMedia: (uploadMedia: UploadMedia) => void;
    setMediaFilterOptions: Dispatch<SetStateAction<AdvancedFilterOptions>>;
    setSortingOptions: Dispatch<SetStateAction<AdvancedFilterSortingOptions>>;
}

interface MediaProviderProps {
    mediaService: MediaService;
    datasetIdentifier: DatasetIdentifier;
    children: ReactNode;
    anomalyLabel?: Label;
}

const MediaContext = createContext<MediaContextProps | undefined>(undefined);

const getFilterOptions = (options: AdvancedFilterOptions, anomalyLabel?: Label) => {
    if (!anomalyLabel) {
        return options;
    }

    return addOrUpdateFilterRule(options, {
        isUnremovable: true,
        field: SearchRuleField.LabelId,
        operator: SearchRuleOperator.In,
        value: [anomalyLabel.id],
    });
};

export const MediaProvider = ({
    mediaService,
    datasetIdentifier,
    anomalyLabel,
    children,
}: MediaProviderProps): JSX.Element => {
    const [mediaSelection, setMediaSelection] = useState<MediaItem[]>([]);
    const [mediaItemsLoadSize, setMediaItemsLoadSize] = useState<number>(MEDIA_ITEMS_DEFAULT_LOAD_SIZE);

    const [mediaSearchOptions, setMediaSearchOptions] = useState<Partial<MediaSearchOptions>>({
        status: '',
        labels: [],
    });
    const [mediaFilterOptions, setMediaFilterOptions] = useState<AdvancedFilterOptions>(
        getFilterOptions({}, anomalyLabel)
    );
    const [sortingOptions, setSortingOptions] = useState<AdvancedFilterSortingOptions>({});

    const {
        media,
        isMediaFetching,
        loadNextMedia,
        totalImages,
        totalVideos,
        totalMatchedImages,
        totalMatchedVideos,
        totalMatchedVideoFrames,
    } = useAdvancedMediaFilter({
        mediaService,
        datasetIdentifier,
        queryOptions: {
            onSuccess: ({ pages }: InfiniteData<MediaAdvancedFilterResponse>) => {
                // Reset media selection if we did not fetch a next page (i.e. refetched the query)
                if (pages.length === 1) resetMediaSelection();
            },
        },
        sortingOptions,
        mediaItemsLoadSize,
        mediaFilterOptions,
    });

    const { setUploadMedia } = useMediaUpload(datasetIdentifier);

    const { deleteMedia, isDeletionInProgress } = useMediaDelete(mediaService, datasetIdentifier);

    const isMediaFilterEmpty = useMemo<boolean>(() => {
        return (
            isEmpty(mediaFilterOptions) ||
            isEmpty(mediaFilterOptions.rules.filter(({ isUnremovable }) => !isUnremovable))
        );
    }, [mediaFilterOptions]);

    const resetMediaSelection = () => {
        setMediaSelection([]);
    };

    const addBulkMediaToSelection = (selectedMediaItems: MediaItem[]): void => {
        setMediaSelection(selectedMediaItems);
    };

    const toggleItemInMediaSelection = useCallback(
        (mediaItem: MediaItem): void => {
            const newSelection = mediaSelection.filter(
                (selectionItem: MediaItem) => selectionItem.thumbnailSrc !== mediaItem.thumbnailSrc
            );

            if (newSelection.length < mediaSelection.length) {
                setMediaSelection(newSelection);

                return;
            }

            setMediaSelection((previousMediaSelection: MediaItem[]) => [...previousMediaSelection, mediaItem]);
        },
        [mediaSelection]
    );

    const value: MediaContextProps = {
        media,
        totalImages,
        totalVideos,
        totalMatchedImages,
        totalMatchedVideos,
        totalMatchedVideoFrames,
        anomalyLabel,
        mediaSelection,
        mediaSearchOptions,
        mediaItemsLoadSize,
        isMediaFetching,
        isDeletionInProgress,
        isMediaFilterEmpty,
        mediaFilterOptions,
        sortingOptions,
        setSortingOptions,
        setMediaSearchOptions,
        setMediaItemsLoadSize,
        setMediaFilterOptions,
        loadNextMedia,
        deleteMedia,
        setUploadMedia,
        resetMediaSelection,
        addBulkMediaToSelection,
        toggleItemInMediaSelection,
    };

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export const useMedia = (): MediaContextProps => {
    const context = useContext(MediaContext);

    if (context === undefined) {
        throw new MissingProviderError('useMedia', 'MediaProvider');
    }

    return context;
};
