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

import { Label, LABEL_SOURCE } from '../labels';
import { AnnotationStatePerTask, MEDIA_ANNOTATION_STATUS } from '../media';
import { AnnotationLabel, Annotation } from './annotation.interface';
import { pointInRectangle, pointInCircle, pointInPolygon, pointInRotatedRectangle } from './math';
import { Circle, Polygon, Rect, Shape, Point, RotatedRect } from './shapes.interface';
import { ShapeType } from './shapetype.enum';

export const isRect = (shape: Shape): shape is Rect => {
    return (shape as Rect).shapeType === ShapeType.Rect;
};

export const isCircle = (shape: Shape): shape is Circle => {
    return (shape as Circle).shapeType === ShapeType.Circle;
};

export const isPolygon = (shape: Shape): shape is Polygon => {
    return (shape as Polygon).shapeType === ShapeType.Polygon;
};

export const isRotatedRect = (shape: Shape): shape is RotatedRect => {
    return (shape as RotatedRect).shapeType === ShapeType.RotatedRect;
};

export const labelFromUser = (label: Label, id?: string): AnnotationLabel => {
    return { ...label, source: { type: LABEL_SOURCE.USER, id } };
};

export const labelFromModel = (label: Label, score: number): AnnotationLabel => {
    return { ...label, source: { type: LABEL_SOURCE.MODEL }, score };
};

const sortAnnotationsByIndex = (a: Annotation, b: Annotation): number => {
    return a.zIndex < b.zIndex ? 1 : -1;
};

export const getTheTopShapeAt = (annotations: Annotation[], point: Point): Annotation | null => {
    const intersectedAnnotations = annotations.filter((annotation: Annotation) => {
        if (annotation.isHidden) {
            return false;
        }

        const { shape } = annotation;

        if (isRect(shape)) {
            return pointInRectangle(shape, point);
        } else if (isRotatedRect(shape)) {
            return pointInRotatedRectangle(shape, point);
        } else if (isCircle(shape)) {
            return pointInCircle(shape, point);
        } else if (isPolygon(shape)) {
            return pointInPolygon(shape, point);
        }
        return false;
    });

    if (intersectedAnnotations.length) {
        const sortedAnnotationsByIndex = [...intersectedAnnotations].sort(sortAnnotationsByIndex);

        return sortedAnnotationsByIndex[0];
    }

    return null;
};

export const getAnnotationStateForTask = (annotationStates: AnnotationStatePerTask[] = []): MEDIA_ANNOTATION_STATUS => {
    if (!annotationStates.length) {
        return MEDIA_ANNOTATION_STATUS.NONE;
    }

    if (annotationStates.some(({ state }) => state === MEDIA_ANNOTATION_STATUS.TO_REVISIT)) {
        return MEDIA_ANNOTATION_STATUS.TO_REVISIT;
    }

    if (annotationStates.every(({ state }) => state === MEDIA_ANNOTATION_STATUS.ANNOTATED)) {
        return MEDIA_ANNOTATION_STATUS.ANNOTATED;
    } else if (annotationStates.every(({ state }) => state === MEDIA_ANNOTATION_STATUS.NONE)) {
        return MEDIA_ANNOTATION_STATUS.NONE;
    }

    return MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED;
};
