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

import { Label } from '../../../core/labels';
import { DOMAIN, Task } from '../../../core/projects';
import { GrabcutToolType } from '../tools/grabcut-tool/grabcut-tool.enums';
import { PolygonMode } from '../tools/polygon-tool/polygon-tool.enum';
import { SelectingToolType } from '../tools/selecting-tool/selecting-tool.enums';
import { WatershedLabel } from '../tools/watershed-tool/watershed-tool.interface';
import { AnnotationScene } from './annotation-scene.interface';

export enum ToolType {
    SelectTool = 'select-tool',
    EditTool = 'edit-tool',
    BoxTool = 'bounding-box-tool',
    RotatedBoxTool = 'rotated-bounding-box-tool',
    CircleTool = 'circle-tool',
    PolygonTool = 'polygon-tool',
    GrabcutTool = 'grabcut-tool',
    WatershedTool = 'watershed-tool',
}

export enum ToolLabel {
    SelectTool = 'Selection tool',
    BoxTool = 'Bounding Box tool',
    RotatedBoxTool = 'Rotated Bounding Box tool',
    CircleTool = 'Circle tool',
    PolygonTool = 'Polygon tool',
    GrabcutTool = 'Object Selection tool',
    EditTool = 'Edit tool',
    WatershedTool = 'Object coloring',
}

export enum ANNOTATOR_MODE {
    ANNOTATION = 'annotation',
    PREDICTION = 'prediction',
}

type Image = HTMLImageElement;

export interface ZoomState {
    zoom: number;
    translation: { x: number; y: number };
}

export interface ToolSettings {
    [ToolType.CircleTool]: {
        size: number;
    };
    [ToolType.WatershedTool]: {
        brushSize: number;
        label?: WatershedLabel;
        sensitivity: number;
    };
    [ToolType.SelectTool]: {
        isBrushSubTool: boolean;
    };
}

export interface AnnotationToolContext {
    readonly scene: AnnotationScene;
    readonly defaultLabel: Label | null;
    readonly tool: ToolType;
    readonly image: Image;
    readonly zoomState: ZoomState;
    readonly activeDomains: DOMAIN[];
    readonly tasks: Task[];
    readonly selectedTask: Task | null;

    mode: ANNOTATOR_MODE;
    toggleTool: (tool: ToolType) => void;
    getToolSettings: (type: ToolType) => ToolSettings[keyof ToolSettings] | undefined;
    updateToolSettings: (type: ToolType, settings: ToolSettings[keyof ToolSettings]) => void;
}

export type DefaultToolTypes = ToolType | GrabcutToolType | SelectingToolType | PolygonMode.MagneticLasso;
