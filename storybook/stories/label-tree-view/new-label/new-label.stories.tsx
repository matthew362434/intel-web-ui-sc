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

import { LABEL_TREE_TYPE } from '../../../../src/pages/create-project';
import { NewLabelTreeLabel } from '../../../../src/pages/create-project/components/project-labels-management/task-labels-management/new-label-tree-item/new-label-tree-label.component';

export default {
    title: 'New Label',
    component: NewLabelTreeLabel,
    argTypes: {
        type: { description: 'Value of LABEL_TREE_TYPE: FLAT,SINGLE or HIERARCHY' },
        withLabel: { description: 'if label above the field should be displayed' },
        labels: { description: 'already existing labels' },
        color: { description: 'color of the label which should be set' },
        name: { description: 'Name of the label' },
        addLabel: { description: 'Function to add Label to the labels list' },
        relation: { description: 'Multiple selection or single selection' },
    },
} as ComponentMeta<typeof NewLabelTreeLabel>;

const Template: ComponentStory<typeof NewLabelTreeLabel> = (args) => <NewLabelTreeLabel {...args} />;

export const Default = Template.bind({});
export const WithLabel = Template.bind({});

Default.args = { type: LABEL_TREE_TYPE.FLAT, labels: [] };

WithLabel.args = { type: LABEL_TREE_TYPE.FLAT, labels: [], withLabel: true };
