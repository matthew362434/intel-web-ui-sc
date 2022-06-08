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
import { Flex, View } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MemoryRouter } from 'react-router';

import { ProjectPerformance } from '../../../src/pages/annotator/components/navigation-toolbar/project-performance.component';

export default {
    title: 'Performance/ProjectPerformance',
    component: ProjectPerformance,
    args: {
        performance: { type: 'default_performance', score: 0.4 },
        isTaskChainProject: false,
        projectId: 'project-id',
    },
} as ComponentMeta<typeof ProjectPerformance>;

const Template: ComponentStory<typeof ProjectPerformance> = (args) => (
    <MemoryRouter>
        <View height='size-200' padding='size-200'>
            <Flex justifyContent='space-between' alignItems='center' height='100%' gap='size-100'>
                <ProjectPerformance {...args} />
            </Flex>
        </View>
    </MemoryRouter>
);

export const Default = Template.bind({});

export const AnomalyProject = Template.bind({});
export const AnomalyProjectHighPerformance = Template.bind({});
export const AnomalyProjectNotAvailable = Template.bind({});

AnomalyProject.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 0.7,
        localScore: 0.3,
    },
};

AnomalyProjectHighPerformance.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 0.9,
        localScore: 0.7,
    },
};

AnomalyProjectNotAvailable.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 0.9,
        localScore: null,
    },
};
