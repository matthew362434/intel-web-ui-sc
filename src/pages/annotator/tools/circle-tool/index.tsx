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

import { BoundingCircle } from '../../../../assets/icons';
import CircleImg from '../../../../assets/primary-tools/circle.gif';
import { DOMAIN } from '../../../../core/projects';
import { ToolLabel, ToolType } from '../../core';
import { ToolProps } from '../tools.interface';
import { CircleTool as Tool } from './circle-tool.component';
import { SecondaryToolbar } from './secondary-toolbar.component';

export const CircleTool: ToolProps = {
    type: ToolType.CircleTool,
    label: ToolLabel.CircleTool,
    Icon: () => <BoundingCircle />,
    Tool,
    SecondaryToolbar,
    tooltip: {
        img: CircleImg,
        url: '/docs/guide/annotations/annotation-tools.html#circle-tool',
        title: 'Circle tool',
        description: `Its purpose is to simplify annotation of circular objects.`,
    },
    supportedDomains: [DOMAIN.SEGMENTATION, DOMAIN.SEGMENTATION_INSTANCE, DOMAIN.ANOMALY_SEGMENTATION],
};
