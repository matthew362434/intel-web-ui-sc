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

import { Polygon } from '../../../../assets/icons';
import PolygonImg from '../../../../assets/primary-tools/polygon.gif';
import { DOMAIN } from '../../../../core/projects';
import { ToolLabel, ToolType } from '../../core';
import { ToolProps } from '../tools.interface';
import { PolygonStateProvider } from './polygon-state-provider.component';
import { PolygonTool as Tool } from './polygon-tool.component';
import SecondaryToolbar from './secondary-toolbar.component';

export const PolygonTool: ToolProps = {
    type: ToolType.PolygonTool,
    label: ToolLabel.PolygonTool,
    Icon: () => <Polygon />,
    Tool,
    SecondaryToolbar,
    tooltip: {
        img: PolygonImg,
        url: '/docs/guide/annotations/annotation-tools.html#polygon-tool',
        title: 'Polygon tool',
        description: `The polygon tool allows for free form drawing around shapes.`,
    },
    supportedDomains: [DOMAIN.SEGMENTATION, DOMAIN.SEGMENTATION_INSTANCE, DOMAIN.ANOMALY_SEGMENTATION],
    StateProvider: PolygonStateProvider,
};
