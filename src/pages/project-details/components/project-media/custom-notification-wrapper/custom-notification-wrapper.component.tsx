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
import { Dispatch, ReactNode } from 'react';

import { ActionButton, Divider, Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';
import { ViewProps } from '@react-types/view';

import { CloseSmall } from '../../../../../assets/icons';
import { clearNotificationAction } from '../use-show-start-training/actions';
import { StartTrainingActions } from '../use-show-start-training/training-notification.interface';
import classes from './custom-notification-wrapper.module.scss';

export interface CustomNotificationWrapperProps {
    offset?: Responsive<DimensionValue>;
    dispatch: Dispatch<StartTrainingActions>;
    backgroundColor?: ViewProps['backgroundColor'];
    width?: ViewProps['width'];
    children: ReactNode;
}

export type CustomNotificationProps = Pick<CustomNotificationWrapperProps, 'offset' | 'dispatch'>;

export const CustomNotificationWrapper = (props: CustomNotificationWrapperProps): JSX.Element => {
    const { children, dispatch, backgroundColor, width = '50%', offset = 'size-100' } = props;

    return (
        <View
            position='absolute'
            height='size-600'
            width={width}
            minWidth={450}
            zIndex={2}
            left='50%'
            bottom={offset}
            backgroundColor={backgroundColor || 'gray-400'}
            borderRadius='regular'
            UNSAFE_style={{ transform: 'translateX(-50%)', cursor: 'default' }}
        >
            <Flex
                gap='size-100'
                alignItems='center'
                height={'100%'}
                justifyContent={'space-between'}
                marginStart={'size-250'}
                marginEnd={'size-100'}
            >
                {children}
                <Flex alignItems={'center'} height={'60%'}>
                    <Divider
                        size='S'
                        orientation='vertical'
                        UNSAFE_className={
                            backgroundColor ? classes.customNotificationDividerBlue : classes.customNotificationDivider
                        }
                    />
                    <ActionButton isQuiet onPress={() => dispatch(clearNotificationAction())}>
                        <CloseSmall />
                    </ActionButton>
                </Flex>
            </Flex>
        </View>
    );
};
