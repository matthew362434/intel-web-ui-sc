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

import * as Icons from '../../../src/assets/icons';

type IconType = keyof typeof Icons;

const iconProps = {
    style: {
        width: '24px',
        height: '24px',
        fill: '#fff',
    },
};

const IconWrapper: FC = ({ children }) => {
    return (
        <Flex
            direction='column'
            alignItems='center'
            justifyContent='center'
            marginX='size-75'
            marginY='size-150'
            width='size-1600'
        >
            {children}
        </Flex>
    );
};

const IconGrid: FC = () => {
    return (
        <Flex
            width='100%'
            height='100%'
            wrap='wrap'
            UNSAFE_style={{ padding: 'var(--spectrum-global-dimension-size-250)' }}
        >
            {Object.keys(Icons).map((icon, index) => {
                // eslint-disable-next-line import/namespace
                const IconComponent = Icons[icon as IconType];

                return (
                    <IconWrapper key={`icon-wrapper-${index}`}>
                        <IconComponent key={`icon-${index}`} {...iconProps} />
                        <span style={{ fontSize: '12px', marginTop: '4px' }}>{icon.replace('Icon', '')}</span>
                    </IconWrapper>
                );
            })}
        </Flex>
    );
};

export default {
    title: 'Icons',
    component: IconGrid,
} as ComponentMeta<typeof IconGrid>;

const Template: ComponentStory<typeof IconGrid> = () => <IconGrid />;

export const Default = Template.bind({});
