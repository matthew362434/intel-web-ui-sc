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
import { ReactNode } from 'react';

import { Flex, IllustratedMessage, Image, Text, View } from '@adobe/react-spectrum';

import Logo from '../../../assets/brain.png';
import classes from './error-layout.module.scss';

interface ErrorLayoutProps {
    children: ReactNode;
}

export const ErrorLayout = ({ children }: ErrorLayoutProps): JSX.Element => {
    return (
        <View UNSAFE_className={classes.errorContainer} height={'100vh'}>
            <View backgroundColor={'gray-50'} width={'90%'} height={'60%'}>
                <View paddingY={'size-350'} position={'relative'} backgroundColor={'gray-300'}>
                    <View
                        position={'absolute'}
                        left={0}
                        top={0}
                        width={'size-200'}
                        height={'100%'}
                        backgroundColor={'gray-400'}
                    />
                    <Flex justifyContent={'center'} alignItems={'center'} columnGap={'size-100'}>
                        <Image src={Logo} alt={'logo-sonoma-creek'} />
                        <Text id={'title-id'} UNSAFE_className={classes.errorAppTitle}>
                            Sonoma Creek
                        </Text>
                    </Flex>
                </View>
                <View position={'relative'}>
                    <View width={'size-200'} height={'size-200'} backgroundColor={'gray-300'} />
                    <View
                        position={'absolute'}
                        top={'size-200'}
                        left={'size-200'}
                        width={'size-100'}
                        height={'size-100'}
                        backgroundColor={'gray-300'}
                    />
                </View>
                <IllustratedMessage height={'80%'}>{children}</IllustratedMessage>
            </View>
        </View>
    );
};
