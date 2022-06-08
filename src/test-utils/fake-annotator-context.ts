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

import { MutableRefObject } from 'react';

import { Annotation, RegionOfInterest } from '../core/annotations';
import { Label } from '../core/labels';
import { DOMAIN, Task } from '../core/projects';
import { AnnotationToolContext, ANNOTATOR_MODE, ToolType } from '../pages/annotator/core';

const defaultRoi = { x: 0, y: 0, width: 100, height: 100 };

interface Props {
    labels?: Label[];
    annotations?: Annotation[];
    defaultLabel?: Label | null;
    zoom?: number;
    roi?: RegionOfInterest;
    tool?: ToolType;
    toggleTool?: (toolType: ToolType) => void;
    defaultRadius?: number;
    setDefaultRadius?: (radius: number) => void;
    activeDomains?: DOMAIN[];
    mode?: ANNOTATOR_MODE;
    tasks?: Task[];
    selectedTask?: Task | null;
    image?: HTMLImageElement;
    hasShapePointSelected?: MutableRefObject<boolean>;
}

export function fakeAnnotationToolContext({
    labels: customLabels = [],
    annotations = [],
    defaultLabel = null,
    zoom = 1.0,
    roi = defaultRoi,
    toggleTool,
    tool = ToolType.BoxTool,
    activeDomains = [DOMAIN.SEGMENTATION],
    mode = ANNOTATOR_MODE.ANNOTATION,
    tasks = [],
    selectedTask = null,
    hasShapePointSelected = { current: false },
    image,
}: Props = {}): AnnotationToolContext {
    const labels = tasks.length > 0 ? tasks?.flatMap((task) => task.labels) : customLabels;

    return {
        scene: {
            labels,
            annotations,
            hasShapePointSelected,
            addShapes: jest.fn(),
            allAnnotationsHidden: false,
            addLabel: jest.fn(),
            removeLabels: jest.fn(),
            addAnnotations: jest.fn(),
            updateAnnotation: jest.fn(),
            removeAnnotations: jest.fn(),
            replaceAnnotations: jest.fn(),
            hoverAnnotation: jest.fn(),
            setSelectedAnnotations: jest.fn(),
            setLockedAnnotations: jest.fn(),
            setHiddenAnnotations: jest.fn(),
            selectAnnotation: jest.fn(),
            unselectAnnotation: jest.fn(),
            hideAnnotation: jest.fn(),
            toggleLock: jest.fn(),
            showAnnotation: jest.fn(),
        },
        image: image || ({ ...roi, src: 'test-src' } as HTMLImageElement),
        tool,
        mode,
        getToolSettings: jest.fn(),
        updateToolSettings: jest.fn(),
        toggleTool: toggleTool ?? jest.fn(),
        zoomState: {
            zoom,
            translation: { x: 0.0, y: 0.0 },
        },
        tasks,
        selectedTask,
        activeDomains,
        defaultLabel,
    };
}
