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

import { Polygon } from '../../../../core/annotations';
import { AnnotationToolContext } from '../../core';
import { HotKeys } from '../../providers/annotator-provider/utils';
import { SelectingToolType } from './selecting-tool.enums';

//We yet don't have hotkey definitions for this tools
export const SelectingHotKeys: Pick<HotKeys, SelectingToolType> = {
    [SelectingToolType.BrushTool]: '',
    [SelectingToolType.SelectionTool]: '',
};

export interface BrushToolProps {
    brushSize: number;
    showCirclePreview: boolean;
    annotationToolContext: AnnotationToolContext;
}

export interface SelectedAnnotation {
    isInsidePolygon: boolean;
    annotationId?: string;
}

export interface GhostPolygon {
    shape: Polygon;
    annotationId?: string;
}
