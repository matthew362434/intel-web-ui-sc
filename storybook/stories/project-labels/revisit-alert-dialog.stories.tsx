// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { RevisitAlertDialog } from '../../../src/pages/project-details/components/project-labels/revisit-alert-dialog/revisit-alert-dialog.component';
import { getMockedTreeLabel } from '../../../src/test-utils/mocked-items-factory';

export default {
    title: 'RevisitAlertDialog',
    component: RevisitAlertDialog,
    args: {
        flattenNewLabels: [getMockedTreeLabel({ name: 'Cat' }), getMockedTreeLabel({ name: 'Hamster' })],
        onPrimaryAction: () => alert('Saved and marked as revisit'),
    },
} as ComponentMeta<typeof RevisitAlertDialog>;

const Template: ComponentStory<typeof RevisitAlertDialog> = (args) => <RevisitAlertDialog {...args} />;

export const Default = Template.bind({});
