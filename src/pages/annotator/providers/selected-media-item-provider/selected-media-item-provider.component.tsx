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
import { createContext, useContext, ReactNode, useState } from 'react';

import { useQuery, UseQueryResult } from 'react-query';

import { Annotation, AnnotationService, PredictionService } from '../../../../core/annotations';
import { PredictionResult } from '../../../../core/annotations/services/prediction-service.interface';
import { MediaItem, SelectedMediaItem } from '../../../../core/media';
import { isClassificationDomain } from '../../../../core/projects';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useProject } from '../../../project-details/providers';
import { useDataset } from '../dataset-provider/dataset-provider.component';
import { useTask } from '../task-provider/task-provider.component';
import { useAnnotationsQuery } from './use-annotations-query.hook';
import { useLoadImageQuery } from './use-load-image-query.hook';
import { usePredictionsQuery } from './use-predictions-query.hook';
import { constructClassificationAnnotations, getPendingMediaItem } from './utils';
interface SelectedMediaItemProps {
    selectedMediaItem: SelectedMediaItem | undefined;
    setSelectedMediaItem: (media: MediaItem) => void;
    selectedMediaItemQuery: UseQueryResult<SelectedMediaItem>;

    predictionsQuery: UseQueryResult<PredictionResult>;
    annotationsQuery: UseQueryResult<Annotation[]>;
    imageQuery: UseQueryResult<HTMLImageElement>;
}
const SelectedMediaItemContext = createContext<SelectedMediaItemProps | undefined>(undefined);
interface SelectedMediaItemProviderProps {
    children: ReactNode;
    annotationService: AnnotationService;
    predictionService: PredictionService;
}
export const SelectedMediaItemProvider = ({
    children,
    annotationService,
    predictionService,
}: SelectedMediaItemProviderProps): JSX.Element => {
    const { datasetIdentifier } = useDataset();
    const { project, isSingleDomainProject } = useProject();
    const { addNotification } = useNotification();
    const { selectedTask } = useTask();

    const [pendingMediaItem, setPendingMediaItem] = useState<MediaItem>();
    const [selectedMediaItem, setSelectedMediaItem] = useState<SelectedMediaItem>();

    const mediaItem = getPendingMediaItem(datasetIdentifier, pendingMediaItem);

    const imageQuery = useLoadImageQuery(mediaItem);

    const annotationsQuery = useAnnotationsQuery({
        annotationService,
        projectLabels: project.labels,
        datasetIdentifier,
        mediaItem,
    });

    const predictionsQuery = usePredictionsQuery({
        predictionService,
        projectLabels: project.labels,
        datasetIdentifier,
        mediaItem,
        taskId: selectedTask?.id,
    });

    const selectedMediaItemQuery = useQuery({
        queryKey: [
            ...QUERY_KEYS.SELECTED_MEDIA_ITEM.SELECTED(pendingMediaItem?.identifier, selectedTask?.id),
            [annotationsQuery.status, predictionsQuery.status, imageQuery.status],
        ],
        queryFn: async () => {
            if (mediaItem === undefined) {
                throw new Error("Can't fetch undefined media item");
            }

            const [image, annotations, predictions] = await new Promise((resolve) => {
                if (imageQuery.data && annotationsQuery.data && predictionsQuery.data) {
                    resolve([imageQuery.data, annotationsQuery.data, predictionsQuery.data]);
                }
            });

            const newlySelectedMediaItem = { ...mediaItem, image, annotations, predictions };

            if (isSingleDomainProject(isClassificationDomain)) {
                return {
                    ...newlySelectedMediaItem,
                    annotations: constructClassificationAnnotations(newlySelectedMediaItem),
                };
            }

            return newlySelectedMediaItem;
        },
        enabled: mediaItem !== undefined,
        onError: () => {
            addNotification('Failed loading media item', NOTIFICATION_TYPE.ERROR);
        },
        onSuccess: (item) => {
            setSelectedMediaItem(item);
        },
        cacheTime: 0,
    });
    const value = {
        selectedMediaItem,
        setSelectedMediaItem: setPendingMediaItem,
        selectedMediaItemQuery,
        predictionsQuery,
        annotationsQuery,
        imageQuery,
    };
    return <SelectedMediaItemContext.Provider value={value}>{children}</SelectedMediaItemContext.Provider>;
};

export const useSelectedMediaItem = (): SelectedMediaItemProps => {
    const context = useContext(SelectedMediaItemContext);

    if (context === undefined) {
        throw new MissingProviderError('useSelectedMediaItem', 'SelectedMediaItemProvider');
    }

    return context;
};
