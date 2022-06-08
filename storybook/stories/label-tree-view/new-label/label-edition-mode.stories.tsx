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
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { LABEL_BEHAVIOUR } from '../../../../src/core/labels';
import {
    LabelEditionMode,
    LabelItemEditionState,
    LabelItemType,
    LabelTreeLabel,
} from '../../../../src/pages/annotator/components/labels/label-tree-view/';
import { LabelsRelationType } from '../../../../src/pages/create-project/components/select-project-template/utils';

export default {
    title: 'LabelEditionMode',
    component: LabelEditionMode,
    argTypes: {
        label: {
            description: '',
        },
        finishEdition: {
            description: '',
        },
        withLabel: {
            description: '',
        },
    },
} as ComponentMeta<typeof LabelEditionMode>;

const Template: ComponentStory<typeof LabelEditionMode> = (args) => (
    <View padding={'size-200'}>
        <LabelEditionMode {...args} />
    </View>
);

export const Default = Template.bind({});

export const AddLabel = Template.bind({});

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
    behaviour: LABEL_BEHAVIOUR.LOCAL & LABEL_BEHAVIOUR.GLOBAL,
};

Default.args = {
    label: defaultLabel,
    finishEdition: () => {
        console.log('Finished edition');
    },
    projectLabels: [{ ...defaultLabel, id: 'test2' }],
    relation: LabelsRelationType.SINGLE_SELECTION,
    save: (editedLabel?: LabelTreeLabel) => {
        console.log(editedLabel?.group);
    },
};

AddLabel.args = {
    finishEdition: () => {
        console.log('Finished edition');
    },
    projectLabels: [{ ...defaultLabel, id: 'test2' }],
    relation: LabelsRelationType.MULTI_SELECTION,
    save: (editedLabel?: LabelTreeLabel) => {
        console.log(editedLabel?.group);
    },
};
