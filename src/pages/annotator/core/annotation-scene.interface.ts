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

import { Annotation, Shape } from '../../../core/annotations';
import { Label } from '../../../core/labels';

export interface AnnotationScene {
    readonly labels: ReadonlyArray<Label>;
    readonly annotations: ReadonlyArray<Annotation>;
    hasShapePointSelected: MutableRefObject<boolean>;

    addShapes: (
        shapes: Shape[],
        label?: Label | null,
        isSelected?: boolean,
        conflictResolver?: (label: Label, otherLabel: Label) => boolean
    ) => Annotation[];

    allAnnotationsHidden: boolean;

    addLabel: (
        label: Label,
        annotationIds: string[],
        conflictResolver?: (label: Label, otherLabel: Label) => boolean
    ) => void;
    removeLabels: (labels: Label[], annotationIds: string[], skipHistory?: boolean) => void;

    updateAnnotation: (annotation: Annotation) => void;
    removeAnnotations: (annotations: Annotation[], skipHistory?: boolean) => void;

    addAnnotations: (annotations: Annotation[]) => void;
    replaceAnnotations: (annotations: Annotation[], skipHistory?: boolean) => void;

    hoverAnnotation: (annotationId: string | null) => void;

    setSelectedAnnotations: (predicate: (annotation: Annotation) => boolean) => void;
    setLockedAnnotations: (predicate: (annotation: Annotation) => boolean) => void;
    setHiddenAnnotations: (predicate: (annotation: Annotation) => boolean) => void;

    selectAnnotation: (annotationId: string) => void;
    unselectAnnotation: (annotationId: string) => void;

    toggleLock: (isLock: boolean, annotationId: string) => void;

    hideAnnotation: (annotationId: string) => void;
    showAnnotation: (annotationId: string) => void;
}
