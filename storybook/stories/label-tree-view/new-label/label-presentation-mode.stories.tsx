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

import { LABEL_BEHAVIOUR } from '../../../../src/core/labels';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelPresentationMode,
    LabelTreeLabel,
} from '../../../../src/pages/annotator/components/labels/label-tree-view/';
import { LabelsRelationType } from '../../../../src/pages/create-project/components/select-project-template/utils';

export default {
    title: 'LabelPresentationMode',
    component: LabelPresentationMode,
    argTypes: {
        type: {
            description: 'Value of LABEL_TREE_TYPE: FLAT,SINGLE or HIERARCHY',
        },
        domain: {
            description: 'Domain of the task',
        },
        label: {
            description: 'Label with all the values',
        },
        isHovered: {
            description: 'If label is hovered',
        },
        setEditMode: {
            description: 'Function to set edit mode',
        },
        saveChild: {
            description: 'Function to edit child',
        },
        addChild: {
            description: 'Function to add child',
        },
    },
} as ComponentMeta<typeof LabelPresentationMode>;

const Template: ComponentStory<typeof LabelPresentationMode> = (args) => <LabelPresentationMode {...args} />;

export const Default = Template.bind({});
export const HoveredLabel = Template.bind({});

const defaultLabel: LabelTreeLabel = {
    type: LabelItemType.LABEL,
    open: false,
    inEditMode: false,
    relation: LabelsRelationType.SINGLE_SELECTION,
    children: [],
    state: LabelItemEditionState.IDLE,
    parentLabelId: null,
    id: 'test',
    group: 'root',
    name: 'Test label',
    color: '#f0406f',
    hotkey: undefined,
    behaviour: LABEL_BEHAVIOUR.GLOBAL,
};

Default.args = {
    label: defaultLabel,
    isHovered: false,
    setEditMode: () => {
        /**/
    },
    addChild: () => {
        /**/
    },
    isEditable: true,
};

HoveredLabel.args = {
    ...Default.args,
    isHovered: true,
};
