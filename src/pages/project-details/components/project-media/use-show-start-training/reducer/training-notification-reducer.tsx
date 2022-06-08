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

import { StartTrainingActions, StartTrainingEvents, StartTrainingState } from '../training-notification.interface';

export const trainingNotificationReducer = (
    state: StartTrainingState,
    action: StartTrainingActions
): StartTrainingState => {
    switch (action.type) {
        case StartTrainingEvents.NO_TRAINING: {
            return {
                ...state,
                type: action.type,
            };
        }
        case StartTrainingEvents.ENOUGH_MEDIA: {
            const { isEnoughAnomalousMedia, isEnoughNormalMedia } = action.payload;

            // check on rerender media page if the last event wasn't as below
            if (
                [
                    StartTrainingEvents.TRAINING_DIALOG,
                    StartTrainingEvents.TRAINING_PROGRESS,
                    StartTrainingEvents.START_TRAINING,
                ].some((event) => event === state.type)
            ) {
                return state;
            }

            // these two ifs prevents races and locks
            if (isEnoughNormalMedia !== undefined && !state.isEnoughNormalMedia) {
                return {
                    ...state,
                    isEnoughNormalMedia,
                    type: action.type,
                };
            }

            if (isEnoughAnomalousMedia !== undefined && !state.isEnoughAnomalousMedia) {
                return {
                    ...state,
                    isEnoughAnomalousMedia,
                    type: action.type,
                };
            }

            if (
                state.type === StartTrainingEvents.UPLOADED_NORMAL_MEDIA ||
                state.type === StartTrainingEvents.UPLOADED_ANOMALOUS_MEDIA
            ) {
                return {
                    ...state,
                    type: action.type,
                };
            }

            return state;
        }
        case StartTrainingEvents.START_TRAINING: {
            if (state.type === StartTrainingEvents.TRAINING_DIALOG) {
                return state;
            }
            return {
                ...state,
                type: action.type,
            };
        }
        case StartTrainingEvents.TRAINING_DIALOG: {
            /* manual training */
            return {
                ...state,
                type: action.type,
            };
        }
        case StartTrainingEvents.TRAINING_PROGRESS: {
            /* training progress -> models */
            return {
                ...state,
                type: action.type,
            };
        }
        case StartTrainingEvents.CLEAR_NOTIFICATION: {
            return {
                ...state,
                type: action.type,
            };
        }
        case StartTrainingEvents.UPLOADED_NORMAL_MEDIA: {
            return {
                ...state,
                wasUploadEvent: true,
                type: action.type,
            };
        }
        case StartTrainingEvents.UPLOADED_ANOMALOUS_MEDIA: {
            return {
                ...state,
                wasUploadEvent: true,
                type: action.type,
            };
        }
        default:
            return {
                ...state,
                type: StartTrainingEvents.NO_TRAINING,
            };
    }
};
