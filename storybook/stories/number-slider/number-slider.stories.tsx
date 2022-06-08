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

import { View } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { NumberSlider } from '../../../src/shared/components';

export default {
    title: 'NumberSlider',
    component: NumberSlider,
    argTypes: {
        label: {
            description: 'Label description',
        },
        id: {
            description: 'Id of the picker',
        },
        displayText: {
            description: 'Text that will be displayed after the slider value',
        },
        defaultValue: {
            description: 'The default value for the picker',
        },
        min: {
            description: 'The minimum value for the picker',
        },
        max: {
            description: 'The maximum value for the picker',
        },
        step: {
            description: 'The step value for the picker',
        },
        isDisabled: {
            description: 'Toggle disabled state',
        },
    },
} as ComponentMeta<typeof NumberSlider>;

const Template: ComponentStory<typeof NumberSlider> = (args) => (
    <View padding={'size-100'}>
        <NumberSlider {...args} />
    </View>
);

export const Default = Template.bind({});
Default.args = {
    id: 'some-id',
    displayText: (value: number): string | number => `${value}`,
    label: 'Picker label',
    ariaLabel: 'some aria label',
    defaultValue: 0,
    min: 0,
    max: 100,
    step: 1,
    isDisabled: false,
};
