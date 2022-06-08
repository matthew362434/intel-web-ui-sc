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

import { FC } from 'react';

import { Flex } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import * as Images from '../../../src/assets/images';

type ImageType = keyof typeof Images;

const ImageGrid: FC = () => {
    return (
        <Flex
            width='100%'
            height='100%'
            wrap='wrap'
            gap={'size-200'}
            UNSAFE_style={{ padding: 'var(--spectrum-global-dimension-size-250)' }}
        >
            {Object.keys(Images).map((image, index) => {
                // eslint-disable-next-line import/namespace
                const ImageComponent = Images[image as ImageType];

                return (
                    <Flex
                        key={`image-wrapper-${index}`}
                        direction={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        height={'100%'}
                    >
                        <ImageComponent key={`image-${index}`} height={'150px'} width={'150px'} />
                        <span style={{ fontSize: '12px', marginTop: '4px' }}>{image.replace('Image', '')}</span>
                    </Flex>
                );
            })}
        </Flex>
    );
};

export default {
    title: 'Images',
    component: ImageGrid,
} as ComponentMeta<typeof ImageGrid>;

const Template: ComponentStory<typeof ImageGrid> = () => <ImageGrid />;

export const Default = Template.bind({});
