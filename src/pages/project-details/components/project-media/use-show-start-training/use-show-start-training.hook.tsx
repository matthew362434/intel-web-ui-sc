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

import { Dispatch, FunctionComponent, useEffect, useReducer } from 'react';

import { CustomNotificationProps } from '../custom-notification-wrapper';
import { MoreImagesNotification } from '../more-images-notification';
import { TrainingDialogWrapper } from '../training-dialog-wrapper';
import { TrainingNotification } from '../training-notification';
import { TrainingProgressNotification } from '../training-progress-notification';
import { startTrainingNotification } from './actions';
import { trainingNotificationReducer } from './reducer';
import { StartTrainingActions, StartTrainingEvents, StartTrainingState } from './training-notification.interface';

type UseShowStartTraining = [
    state: StartTrainingState,
    dispatch: Dispatch<StartTrainingActions>,
    Component: FunctionComponent<CustomNotificationProps> | null
];

export const useShowStartTraining = (): UseShowStartTraining => {
    const [state, dispatch] = useReducer(trainingNotificationReducer, {
        type: StartTrainingEvents.NO_TRAINING,
        isEnoughAnomalousMedia: false,
        isEnoughNormalMedia: false,
        wasUploadEvent: false,
    });

    useEffect(() => {
        const { isEnoughAnomalousMedia, isEnoughNormalMedia, type, wasUploadEvent } = state;

        if (
            isEnoughNormalMedia &&
            isEnoughAnomalousMedia &&
            wasUploadEvent &&
            type === StartTrainingEvents.ENOUGH_MEDIA
        ) {
            dispatch(startTrainingNotification());
        }
    }, [state]);

    switch (state.type) {
        case StartTrainingEvents.NO_TRAINING:
            return [state, dispatch, null];
        case StartTrainingEvents.ENOUGH_MEDIA:
            const { isEnoughNormalMedia, isEnoughAnomalousMedia } = state;
            if (isEnoughAnomalousMedia && isEnoughNormalMedia) {
                // on page mount can be enough media items
                return [state, dispatch, null];
            }
            return [state, dispatch, MoreImagesNotification];
        case StartTrainingEvents.START_TRAINING:
            return [state, dispatch, TrainingNotification];
        case StartTrainingEvents.TRAINING_DIALOG:
            return [state, dispatch, TrainingDialogWrapper];
        case StartTrainingEvents.TRAINING_PROGRESS:
            return [state, dispatch, TrainingProgressNotification];
        case StartTrainingEvents.CLEAR_NOTIFICATION:
            return [state, dispatch, null];
    }

    return [state, dispatch, null];
};
