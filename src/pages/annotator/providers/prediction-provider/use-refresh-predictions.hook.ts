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

import { useQueryClient } from 'react-query';

import { useTask } from '..';
import { PredictionMode } from '../../../../core/annotations/services/prediction-service.interface';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { useApplicationServices } from '../../../../providers/application-provider/application-services-provider.component';
import { useProject } from '../../../project-details/providers';
import { useDataset } from '../dataset-provider/dataset-provider.component';
import { useSelectedMediaItem } from '../selected-media-item-provider/selected-media-item-provider.component';

export const useRefreshPredictions = (): (() => Promise<void>) => {
    const { datasetIdentifier } = useDataset();
    const { predictionService } = useApplicationServices();
    const { selectedMediaItemQuery, selectedMediaItem } = useSelectedMediaItem();
    const { project } = useProject();
    const { selectedTask } = useTask();
    const taskId = selectedTask?.id;
    const projectLabels = project.labels;
    const queryCache = useQueryClient();

    return async () => {
        if (selectedMediaItem === undefined) {
            return;
        }

        const predictions = await predictionService.getPredictions(
            datasetIdentifier,
            projectLabels,
            selectedMediaItem,
            PredictionMode.ONLINE,
            taskId
        );

        // When the server returns an error, in which case we default to empty annotations, or
        // if there are no predictions we don't want to update the existing cache
        if (predictions.annotations.length > 0) {
            const key = QUERY_KEYS.SELECTED_MEDIA_ITEM.PREDICTIONS(selectedMediaItem?.identifier, taskId);
            queryCache.setQueryData(key, predictions);
            selectedMediaItemQuery.remove();
        }
    };
};
