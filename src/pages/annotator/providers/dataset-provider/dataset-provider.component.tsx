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

import { createContext, Dispatch, SetStateAction, useContext, useState, ReactNode, useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { UseInfiniteQueryResult } from 'react-query';

import { Annotation } from '../../../../core/annotations';
import {
    AnnotationStatePerTask,
    MediaAdvancedFilterResponse,
    MediaItem,
    MediaItemResponse,
} from '../../../../core/media';
import { MediaService } from '../../../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../../../core/projects';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useActiveMediaQuery } from '../../../media/hooks';
import { useAdvancedFilterQuery } from '../../../media/hooks/media-items/advanced-filter-query.hook';
import { AdvancedFilterOptions } from '../../../media/media-filter.interface';
import { useOptimisticallyUpdateAnnotationStatus } from './utils';

interface DatasetContextProps {
    datasetIdentifier: DatasetIdentifier;

    isInActiveMode: boolean;
    setIsInActiveMode: Dispatch<SetStateAction<boolean>>;
    isDatasetMode: boolean;
    setIsDatasetMode: Dispatch<SetStateAction<boolean>>;

    mediaItemsQuery: UseInfiniteQueryResult<MediaItemResponse | MediaAdvancedFilterResponse>;

    mediaFilterQuery: UseInfiniteQueryResult<MediaAdvancedFilterResponse>;
    mediaFilterOptions: AdvancedFilterOptions;
    setMediaFilterOptions: Dispatch<SetStateAction<AdvancedFilterOptions>>;
    isMediaFilterEmpty: boolean;

    activeMediaItemsQuery: UseInfiniteQueryResult<MediaItemResponse>;
    optimisticallyUpdateAnnotationStatus: (
        mediaItem: MediaItem,
        annotations: ReadonlyArray<Annotation>,
        annotationStates?: AnnotationStatePerTask[]
    ) => void;
}

const DatasetContext = createContext<DatasetContextProps | undefined>(undefined);

export interface DatasetProviderProps {
    children: ReactNode;
    datasetIdentifier: DatasetIdentifier;
    mediaService: MediaService;
    isActiveMode?: boolean;
}

export const DatasetProvider = ({
    children,
    datasetIdentifier,
    mediaService,
    isActiveMode = true,
}: DatasetProviderProps): JSX.Element => {
    const [isDatasetMode, setIsDatasetMode] = useState(false);
    const [isInActiveMode, setIsInActiveMode] = useState(isActiveMode);
    const optimisticallyUpdateAnnotationStatus = useOptimisticallyUpdateAnnotationStatus(datasetIdentifier);

    const [mediaFilterOptions, setMediaFilterOptions] = useState<AdvancedFilterOptions>({});

    const activeMediaItemsQuery = useActiveMediaQuery(mediaService, datasetIdentifier);
    const mediaFilterQuery = useAdvancedFilterQuery(mediaService, datasetIdentifier, {}, 50, mediaFilterOptions, {});

    const isMediaFilterEmpty = useMemo<boolean>(() => {
        return isEmpty(mediaFilterOptions) || isEmpty(mediaFilterOptions.rules);
    }, [mediaFilterOptions]);

    const value = {
        mediaItemsQuery: isInActiveMode ? activeMediaItemsQuery : mediaFilterQuery,
        isDatasetMode,
        setIsDatasetMode,
        mediaFilterQuery,
        mediaFilterOptions,
        isMediaFilterEmpty,
        setMediaFilterOptions,
        activeMediaItemsQuery,
        datasetIdentifier,
        isInActiveMode,
        setIsInActiveMode,
        optimisticallyUpdateAnnotationStatus,
    };

    return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
};

export const useDataset = (): DatasetContextProps => {
    const context = useContext(DatasetContext);

    if (context === undefined) {
        throw new MissingProviderError('useDataset', 'DatasetProvider');
    }

    return context;
};
