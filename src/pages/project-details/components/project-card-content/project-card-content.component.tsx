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

import { Divider, Flex, Heading, View } from '@adobe/react-spectrum';
import { ViewProps } from '@react-types/view';

import { idMatchingFormat } from '../../../../test-utils';

interface ProjectCardContentProps extends ViewProps {
    children: ReactNode;
    title: string;
    gridArea?: string;
    component?: JSX.Element;
}

export const ProjectCardContent = ({
    children,
    gridArea,
    component,
    title = 'Number of media',
    ...rest
}: ProjectCardContentProps): JSX.Element => {
    const id = idMatchingFormat(title);
    return (
        <View borderRadius={'small'} backgroundColor={'gray-100'} gridArea={gridArea} padding={'size-150'} {...rest}>
            <Flex direction='column' height='100%'>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Heading level={6} marginTop={'size-125'} marginBottom={'size-200'} id={`${gridArea || id}-id`}>
                        {title}
                    </Heading>
                    {component ? component : <></>}
                </Flex>
                <Divider size='S' />
                <Flex
                    id={`${id}-content-id`}
                    flexBasis={'100%'}
                    height={'100%'}
                    direction={'column'}
                    justifyContent={'center'}
                    minHeight={0}
                >
                    <View height={'100%'} marginY={'size-125'}>
                        {children}
                    </View>
                </Flex>
            </Flex>
        </View>
    );
};
