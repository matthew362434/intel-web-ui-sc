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

import { Flex, Text } from '@adobe/react-spectrum';

import { Info } from '../../../../../assets/icons';
import { CustomNotificationWrapper, CustomNotificationWrapperProps } from '../custom-notification-wrapper';

type MoreImagesNotificationProps = Pick<CustomNotificationWrapperProps, 'offset' | 'dispatch'>;

export const MoreImagesNotification = ({ offset = 'size-100', dispatch }: MoreImagesNotificationProps): JSX.Element => {
    return (
        <CustomNotificationWrapper offset={offset} dispatch={dispatch}>
            <Flex alignItems={'center'}>
                <Info style={{ marginRight: 'var(--spectrum-global-dimension-size-100)' }} />
                <Text>You have to upload at least twelve normal and three anomalous images to start training.</Text>
            </Flex>
        </CustomNotificationWrapper>
    );
};
