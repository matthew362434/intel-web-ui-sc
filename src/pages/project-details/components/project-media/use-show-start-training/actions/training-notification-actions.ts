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

import { StartTrainingActions, StartTrainingEvents } from '../training-notification.interface';

export const noTrainingAction = (): StartTrainingActions => ({
    type: StartTrainingEvents.NO_TRAINING,
});

export const enoughNormalMediaAction = (): StartTrainingActions => ({
    type: StartTrainingEvents.ENOUGH_MEDIA,
    payload: {
        isEnoughNormalMedia: true,
        isEnoughAnomalousMedia: undefined,
    },
});

export const enoughAnomalousMediaAction = (): StartTrainingActions => ({
    type: StartTrainingEvents.ENOUGH_MEDIA,
    payload: {
        isEnoughAnomalousMedia: true,
        isEnoughNormalMedia: undefined,
    },
});

export const startTrainingNotification = (): StartTrainingActions => ({ type: StartTrainingEvents.START_TRAINING });

export const trainingDialogAction = (): StartTrainingActions => ({ type: StartTrainingEvents.TRAINING_DIALOG });

export const clearNotificationAction = (): StartTrainingActions => ({ type: StartTrainingEvents.CLEAR_NOTIFICATION });

export const trainingProgressAction = (): StartTrainingActions => ({ type: StartTrainingEvents.TRAINING_PROGRESS });

export const uploadedNormalMediaAction = (): StartTrainingActions => ({
    type: StartTrainingEvents.UPLOADED_NORMAL_MEDIA,
});

export const uploadedAnomalousMediaAction = (): StartTrainingActions => ({
    type: StartTrainingEvents.UPLOADED_ANOMALOUS_MEDIA,
});
