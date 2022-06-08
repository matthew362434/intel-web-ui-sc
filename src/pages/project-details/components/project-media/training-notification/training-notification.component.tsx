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

import { ActionButton, Flex, Text } from '@adobe/react-spectrum';

import { Info } from '../../../../../assets/icons';
import { CustomNotificationWrapper, CustomNotificationWrapperProps } from '../custom-notification-wrapper';
import { trainingDialogAction } from '../use-show-start-training/actions';
import classes from './training-notification.module.scss';

type TrainingNotificationProps = Pick<CustomNotificationWrapperProps, 'offset' | 'dispatch'>;

export const TrainingNotification = ({ offset = 'size-100', dispatch }: TrainingNotificationProps): JSX.Element => {
    return (
        <CustomNotificationWrapper offset={offset} backgroundColor={'blue-500'} width={'30%'} dispatch={dispatch}>
            <Flex alignItems={'center'} flex={1} justifyContent={'space-between'}>
                <Flex gap='size-100' alignItems={'center'}>
                    <Info />
                    <Text>You can start training the model now</Text>
                </Flex>
                <Flex gap='size-100' alignItems='center'>
                    <ActionButton isQuiet onPress={() => dispatch(trainingDialogAction())}>
                        <Text UNSAFE_className={classes.trainingNotificationButton}>Train</Text>
                    </ActionButton>
                </Flex>
            </Flex>
        </CustomNotificationWrapper>
    );
};
