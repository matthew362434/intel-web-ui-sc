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

import { PointerEvent, RefObject } from 'react';

import { default as ClipperShape } from '@doodle3d/clipper-js';

import {
    Rect,
    Shape,
    Point,
    Circle,
    Annotation,
    getTheTopShapeAt,
    RegionOfInterest,
} from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { getRelativePoint, transformToClipperShape } from '../utils';

export const getBrushMaxSize = (size: RegionOfInterest): number => Math.max(size.width, size.height) * 0.15;

export const pointInShape = (annotations: Annotation[], point: Point, shiftKey: boolean): Annotation[] => {
    const topAnnotation = getTheTopShapeAt(annotations, point);
    if (topAnnotation) {
        return annotations.map((annotation: Annotation) => {
            if (annotation.id === topAnnotation.id) {
                return {
                    ...annotation,
                    isSelected: !annotation.isSelected,
                };
            }
            return shiftKey ? annotation : { ...annotation, isSelected: false };
        });
    } else {
        return annotations.map((annotation: Annotation) => ({ ...annotation, isSelected: false }));
    }
};

export const shapesIntersection = (
    annotations: Annotation[],
    shape: Rect | Circle,
    shiftKey: boolean
): Annotation[] => {
    const subject: ClipperShape = transformToClipperShape(shape);
    let clip: ClipperShape | null = null;
    return annotations.map((annotation: Annotation) => {
        const { shape: annotationShape, isHidden } = annotation;

        if (isHidden) {
            return annotation;
        }

        clip = transformToClipperShape(annotationShape);

        if (clip) {
            const result: ClipperShape = subject.intersect(clip);
            if (result.paths.length) {
                return {
                    ...annotation,
                    isSelected: true,
                };
            }
        }
        return shiftKey ? annotation : { ...annotation, isSelected: false };
    });
};

export const getIntersectedAnnotation = (annotations: Annotation[], shape: Shape): Annotation | null => {
    const subject: ClipperShape = transformToClipperShape(shape);

    return (
        annotations.find(({ shape: annotationShape }: Annotation) => {
            const result = subject.intersect(transformToClipperShape(annotationShape));
            return result.paths.length > 0;
        }) ?? null
    );
};

export const areAnnotationsIdentical = (prevAnnotations: Annotation[], currAnnotations: Annotation[]): boolean => {
    const filteredAnnotations = prevAnnotations.filter(
        (annotation: Annotation, index: number) => annotation.isSelected === currAnnotations[index].isSelected
    );
    return filteredAnnotations.length === prevAnnotations.length;
};

export const calcRelativePoint =
    (zoom: number, element?: RefObject<SVGRectElement>) =>
    <T>(callback: (point: Point) => T) =>
    (event: PointerEvent<SVGSVGElement>): void | T => {
        if (element?.current) {
            return callback(getRelativePoint(element.current, { x: event.clientX, y: event.clientY }, zoom));
        }
    };

export const getSelectedPolygonAnnotations = (annotations: Annotation[]): Annotation[] =>
    annotations.filter(({ isSelected, shape }) => isSelected && shape.shapeType === ShapeType.Polygon);
