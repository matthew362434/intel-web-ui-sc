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

import { DOMAIN } from '../../../core/projects';
import { BoundingBoxTool } from './bounding-box';
import { CircleTool } from './circle-tool';
import { GrabcutTool } from './grabcut-tool';
import { PolygonTool } from './polygon-tool';
import { RotatedBoundingBoxTool } from './rotated-bounding-box-tool';
import { SelectingTool } from './selecting-tool';
import { ToolProps } from './tools.interface';
import { WatershedTool } from './watershed-tool';

const useAvailableTools = (activeDomains: DOMAIN[]): ToolProps[] => {
    return [
        SelectingTool,
        BoundingBoxTool,
        RotatedBoundingBoxTool,
        CircleTool,
        PolygonTool,
        GrabcutTool,
        WatershedTool,
    ].filter(({ supportedDomains }) => {
        return activeDomains.some((domain: DOMAIN) => {
            return supportedDomains.includes(domain);
        });
    });
};

export default useAvailableTools;
