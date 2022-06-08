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

import { ComponentMeta, ComponentStory } from '@storybook/react';

import DetectionWithClassificationImg from '../../../src/assets/domains/a1-Detection-classification.png';
import { SelectDomainButton } from '../../../src/pages/create-project/components/project-labels-management/select-domain-button.component';

export default {
    title: 'SelectDomainButton',
    component: SelectDomainButton,
    argTypes: {
        imgSrc: {
            description: 'Image source',
        },
        alt: {
            description: 'Image alt',
        },
        id: {
            description: 'buttons id',
        },
        text: {
            description: 'text which is shown below the image',
        },
        select: {
            description: 'function which is called on selection',
        },
        isSelected: {
            description: 'if the button is selected',
        },
        isDisabled: {
            description: 'if the button is disabled',
        },
    },
} as ComponentMeta<typeof SelectDomainButton>;

const Template: ComponentStory<typeof SelectDomainButton> = (args) => <SelectDomainButton {...args} />;

export const Default = Template.bind({});

Default.args = {
    imgSrc: DetectionWithClassificationImg,
    alt: '',
    id: 'test-button',
    text: 'Classification',
    select: () => {
        console.log('Selected');
    },
    isSelected: true,
    isDisabled: false,
};
