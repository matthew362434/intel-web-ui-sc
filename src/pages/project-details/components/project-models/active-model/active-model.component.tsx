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

import classes from './active-model.module.scss';

export const ActiveModel = (): JSX.Element => {
    return (
        <View backgroundColor={'gray-700'} borderRadius={'large'} paddingY={'size-25'} paddingX={'size-125'}>
            <Flex>
                <Text UNSAFE_className={classes.activeModel} id={'active-model-id'}>
                    Active model
                </Text>
            </Flex>
        </View>
    );
};
