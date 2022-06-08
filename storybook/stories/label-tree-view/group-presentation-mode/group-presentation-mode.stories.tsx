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

import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeGroup,
    GroupPresentationMode,
} from '../../../../src/pages/annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../../src/pages/create-project/components/select-project-template/utils';

export default {
    title: 'Group presentation mode',
    component: GroupPresentationMode,
    argTypes: {
        close: {
            description: 'Function which is used to close edition mode',
        },
        save: {
            description: 'Function which saves changes',
        },
        group: {
            description: 'Group object with values to change',
        },
        labels: {
            description: 'Labels already created',
        },
    },
} as ComponentMeta<typeof GroupPresentationMode>;

const currentGroupValue = {
    type: LabelItemType.GROUP,
    state: LabelItemEditionState.IDLE,
    name: 'Test group',
    relation: LabelsRelationType.SINGLE_SELECTION,
    inEditMode: true,
    children: [],
    open: false,
    parentLabelId: null,
    parentName: null,
    id: 'test-group',
} as LabelTreeGroup;

const Template: ComponentStory<typeof GroupPresentationMode> = (args) => <GroupPresentationMode {...args} />;

export const SingleSelection = Template.bind({});
export const MultipleSelection = Template.bind({});

SingleSelection.args = {
    group: currentGroupValue,
    isHovered: false,
    setEditMode: () => {
        /**/
    },
    isEditable: true,
    addChild: () => {
        /**/
    },
    deleteGroup: () => {
        /**/
    },
};

MultipleSelection.args = {
    ...SingleSelection.args,
    group: { ...currentGroupValue, relation: LabelsRelationType.MULTI_SELECTION },
};
