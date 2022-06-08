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

export enum StartTrainingEvents {
    'CLEAR_NOTIFICATION' = 'clear_notification',
    'NO_TRAINING' = 'no_training',
    'ENOUGH_MEDIA' = 'enough_media',
    'UPLOADED_NORMAL_MEDIA' = 'uploaded_normal_media',
    'UPLOADED_ANOMALOUS_MEDIA' = 'uploaded_anomalous_media',
    'START_TRAINING' = 'start_training',
    'TRAINING_DIALOG' = 'training_dialog',
    'TRAINING_PROGRESS' = 'training_progress',
}

interface EnoughMediaNotificationPayload {
    isEnoughNormalMedia: boolean;
    isEnoughAnomalousMedia: boolean;
}

export interface EnoughMediaAction {
    type: StartTrainingEvents.ENOUGH_MEDIA;
    payload: Partial<EnoughMediaNotificationPayload>;
}

export interface StartTrainingState extends EnoughMediaNotificationPayload {
    type: StartTrainingEvents;
    wasUploadEvent: boolean;
}

export type StartTrainingActions =
    | {
          type:
              | StartTrainingEvents.NO_TRAINING
              | StartTrainingEvents.TRAINING_DIALOG
              | StartTrainingEvents.TRAINING_PROGRESS
              | StartTrainingEvents.CLEAR_NOTIFICATION
              | StartTrainingEvents.UPLOADED_NORMAL_MEDIA
              | StartTrainingEvents.UPLOADED_ANOMALOUS_MEDIA
              | StartTrainingEvents.START_TRAINING;
      }
    | EnoughMediaAction;
