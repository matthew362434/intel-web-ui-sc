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
import { TrainModelDialog } from '../../project-models/train-model-dialog';
import { CustomNotificationWrapperProps } from '../custom-notification-wrapper';
import { clearNotificationAction, trainingProgressAction } from '../use-show-start-training/actions';

type TrainingDialogWrapperProps = Pick<CustomNotificationWrapperProps, 'dispatch'>;

export const TrainingDialogWrapper = ({ dispatch }: TrainingDialogWrapperProps): JSX.Element => {
    return (
        <TrainModelDialog
            isOpen
            handleClose={() => {
                dispatch(clearNotificationAction());
            }}
            handleOnSuccess={() => dispatch(trainingProgressAction())}
        />
    );
};
