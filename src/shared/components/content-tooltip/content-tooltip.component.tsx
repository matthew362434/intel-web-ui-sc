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

import { Flex, Text, View } from '@adobe/react-spectrum';

import { Alert } from '../../../assets/icons';
import classes from './content-tooltip.module.scss';

interface ContentTooltipProps {
    text: string;
}

export const ContentTooltip = ({ text }: ContentTooltipProps): JSX.Element => {
    return (
        <View backgroundColor={'gray-400'} padding={'size-125'} borderRadius={'small'} width={'size-2000'}>
            <Flex alignItems={'center'} gap={'size-175'}>
                <Alert aria-label={'Notification Alert'} color={'notice'} />
                <Text UNSAFE_className={classes.contentTooltipText}>{text}</Text>
            </Flex>
        </View>
    );
};
