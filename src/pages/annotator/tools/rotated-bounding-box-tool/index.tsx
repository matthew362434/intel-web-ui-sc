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

import { RotatedBox } from '../../../../assets/icons';
import RotatedDetectionImg from '../../../../assets/primary-tools/rotated_detection.gif';
import { DOMAIN } from '../../../../core/projects';
import { ToolLabel, ToolType } from '../../core';
import { ToolProps } from '../tools.interface';
import { RotatedBoundingBoxTool as Tool } from './rotated-bounding-box-tool.component';
import SecondaryToolbar from './secondary-toolbar.component';

export const RotatedBoundingBoxTool: ToolProps = {
    type: ToolType.RotatedBoxTool,
    label: ToolLabel.RotatedBoxTool,
    Icon: () => <RotatedBox filter={'white'} />,
    Tool,
    SecondaryToolbar,
    tooltip: {
        img: RotatedDetectionImg,
        url: '/docs/guide/annotations/annotation-tools.html#bounding-box-tool',
        title: 'Rotated bounding box tool',
        description: `The tool intended for object detection task.
         A rotated bounding box acts as a normal bounding box, but it can be rotated to fit the object better.`,
    },
    supportedDomains: [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX],
};
