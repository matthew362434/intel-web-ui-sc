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
import { View } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { TutorialDialog } from '../../../src/shared/components/tutorial-dialog/tutorial-dialog.component';

export default {
    title: 'TutorialDialog',
    component: TutorialDialog,
    args: {
        description: `Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Deleniti saepe unde perferendis quam illo veniam quas architecto modi cumque quos et,
            ipsam expedita incidunt tempore quo nemo, ullam commodi vel!`,
        onPressDismiss: () => console.log('Dismiss pressed!!!'),
        onPressLearnMore: () => console.log('Learn more pressed!!'),
    },
} as ComponentMeta<typeof TutorialDialog>;

const Template: ComponentStory<typeof TutorialDialog> = (args) => (
    <View height={'280px'} width={'400px'}>
        <TutorialDialog {...args} />
    </View>
);

export const Default = Template.bind({});
