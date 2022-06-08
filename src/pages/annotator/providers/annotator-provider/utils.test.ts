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
import { DOMAIN } from '../../../../core/projects';
import { ToolType } from '../../core';
import { defaultToolForProject } from './utils';

describe('default annotator tool', () => {
    it('selects the polygon tool when annotating a segmentation project', () => {
        expect(defaultToolForProject([DOMAIN.SEGMENTATION, DOMAIN.CLASSIFICATION])).toBe(ToolType.PolygonTool);
    });

    it('selects the detection tool when annotating a segmentation project', () => {
        expect(defaultToolForProject([DOMAIN.DETECTION])).toBe(ToolType.BoxTool);
    });

    it('selects the selection tool when annotating a segmentation project', () => {
        expect(defaultToolForProject([DOMAIN.CLASSIFICATION])).toBe(ToolType.SelectTool);
    });
});
