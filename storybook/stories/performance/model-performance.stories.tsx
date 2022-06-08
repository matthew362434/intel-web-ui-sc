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
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ModelPerformance } from '../../../src/pages/project-details/components/project-models/model-container/model-card/model-performance.component';

export default {
    title: 'Performance/ModelPerformance',
    component: ModelPerformance,
    args: {
        performance: { type: 'default_performance', score: 0.4 },
        upToDate: true,
        genericId: 'model-performance',
    },
} as ComponentMeta<typeof ModelPerformance>;

const Template: ComponentStory<typeof ModelPerformance> = (args) => <ModelPerformance {...args} />;

export const Default = Template.bind({});

export const AnomalyModel = Template.bind({});
export const AnomalyModelHighPerformance = Template.bind({});
export const AnomalyModelNotAvailable = Template.bind({});

AnomalyModel.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 70,
        localScore: 30,
    },
};

AnomalyModelHighPerformance.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 90,
        localScore: 70,
    },
};

AnomalyModelNotAvailable.args = {
    performance: {
        type: 'anomaly_performance',
        globalScore: 90,
        localScore: null,
    },
};
