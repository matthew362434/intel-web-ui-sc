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

import { Divider, Flex, View } from '@adobe/react-spectrum';

import { Breadcrumbs, BreadcrumbsProps } from '../index';

interface PageLayoutProps extends BreadcrumbsProps {
    children: JSX.Element;
    header?: ReactNode;
}

export const PageLayout = ({ children, breadcrumbs, header }: PageLayoutProps): JSX.Element => {
    return (
        <Flex marginX={'size-800'} marginBottom={'size-800'} id={`page-layout-id`} direction='column' height='100%'>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
                <View marginY={'size-400'}>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </View>
                <View>{header}</View>
            </Flex>
            <Divider size='S' />
            <Flex position='relative' flex={1} direction='column' marginBottom='size-150' minHeight={0}>
                {children}
            </Flex>
        </Flex>
    );
};
