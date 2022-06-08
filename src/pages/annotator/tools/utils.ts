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

import { PointerEvent, SVGProps } from 'react';

import { default as ClipperShape } from '@doodle3d/clipper-js';
import defer from 'lodash/defer';
import isEmpty from 'lodash/isEmpty';

import {
    Rect,
    Shape,
    Point,
    isRect,
    Circle,
    Polygon,
    isCircle,
    RegionOfInterest,
    isRotatedRect,
    RotatedRect,
} from '../../../core/annotations';
import { rotatedRectCorners } from '../../../core/annotations/rotated-rect-math';
import { ShapeType } from '../../../core/annotations/shapetype.enum';
import * as Vec2 from '../../../core/annotations/vec2';
import { Label } from '../../../core/labels';
import { isLeftButton, isWheelButton } from './buttons-utils';

type ElementType = SVGElement | HTMLDivElement;

export interface ClipperPoint {
    X: number;
    Y: number;
}

export const POLYGON_VALID_AREA = 4;

export const getRelativePoint = (element: ElementType, point: Point, zoom: number): Point => {
    const rect = element.getBoundingClientRect();

    return {
        x: (point.x - rect.left) / zoom,
        y: (point.y - rect.top) / zoom,
    };
};

export const DEFAULT_ANNOTATION_STYLES = {
    fillOpacity: 0.4,
    fill: 'var(--energy-blue)',
    stroke: 'var(--energy-blue)',
};

export const EDIT_ANNOTATION_STYLES = {
    stroke: 'var(--energy-blue-light)',
};

export const EDIT_SIZE_ANNOTATION_STYLES = {
    fillOpacity: 0.4,
    fill: 'var(--energy-blue-light)',
    stroke: 'var(--energy-blue-light)',
};

export const SELECT_ANNOTATION_STYLES = {
    fillOpacity: 0,
    stroke: 'var(--energy-blue-dark)',
    strokeWidth: 'calc(2px / var(--zoom-level))',
    strokeDasharray: 'calc(3px / var(--zoom-level)),calc(3px / var(--zoom-level))',
};

export const drawingStyles = (defaultLabel: Label | null): typeof DEFAULT_ANNOTATION_STYLES => {
    if (defaultLabel === null) {
        return DEFAULT_ANNOTATION_STYLES;
    }

    return {
        ...DEFAULT_ANNOTATION_STYLES,
        fill: defaultLabel.color,
        stroke: defaultLabel.color,
    };
};

type OnPointerDown = SVGProps<SVGSVGElement>['onPointerDown'];
export const allowPanning = (onPointerDown?: OnPointerDown): OnPointerDown | undefined => {
    if (onPointerDown === undefined) {
        return;
    }

    return (event: PointerEvent<SVGSVGElement>) => {
        const isPressingPanningHotKeys = (isLeftButton(event) && event.ctrlKey) || isWheelButton(event);

        if (isPressingPanningHotKeys) {
            return;
        }

        return onPointerDown(event);
    };
};

export const blurActiveInput = (isFocused: boolean): void => {
    const element = document.activeElement;

    if (isFocused && element?.nodeName === 'INPUT') {
        defer(() => (element as HTMLInputElement).blur());
    }
};

const calculateRectanglePoints = (shape: Rect): ClipperPoint[] => {
    const { x: X, y: Y, width, height } = shape;
    const topLeftPoint = { X, Y };
    const topRightPoint = { X: X + width, Y };
    const bottomLeftPoint = { X, Y: Y + height };
    const bottomRightPoint = { X: X + width, Y: Y + height };
    return [topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint];
};

const calculateRotatedRectanglePoints = (shape: RotatedRect): ClipperPoint[] => {
    return rotatedRectCorners(shape).map(Vec2.toClipperPoint);
};

export const calculateCirclePoints = (shape: Circle): ClipperPoint[] => {
    const stepAngle = 20;
    const endAngle = 360;
    const { x: centerX, y: centerY, r } = shape;
    let points: ClipperPoint[] = [];

    for (let i = 0; i <= endAngle; i += stepAngle) {
        const X = centerX + r * Math.cos((i * Math.PI) / 180);
        const Y = centerY + r * Math.sin((i * Math.PI) / 180);

        points = [...points, { X, Y }];
    }

    return points;
};

export const convertPolygonPoints = (shape: Polygon): ClipperPoint[] => {
    return shape.points.map(({ x, y }: Point) => ({ X: x, Y: y }));
};

export const transformToClipperShape = (shape: Shape): ClipperShape => {
    switch (true) {
        case isRect(shape):
            return new ClipperShape([calculateRectanglePoints(shape as Rect)], true);
        case isRotatedRect(shape):
            return new ClipperShape([calculateRotatedRectanglePoints(shape as RotatedRect)], true);
        case isCircle(shape):
            return new ClipperShape([calculateCirclePoints(shape as Circle)], true);
        default:
            return new ClipperShape([convertPolygonPoints(shape as Polygon)], true);
    }
};

export const isPolygonValid = (polygon: Polygon | null): boolean => {
    if (!polygon) return false;
    const sPolygon = transformToClipperShape(polygon);

    return Math.abs(sPolygon.totalArea()) > POLYGON_VALID_AREA;
};

const clipperShapeToPolygon = (path: ClipperPoint[]): Polygon => ({
    shapeType: ShapeType.Polygon,
    points: path.map(({ X, Y }) => ({ x: X, y: Y })),
});

const filterIntersectedPathsWithRoi = (roi: RegionOfInterest, shape: ClipperShape): ClipperShape => {
    const newPath = shape.clone();
    const roiRect = transformToClipperShape({ ...roi, shapeType: ShapeType.Rect });

    newPath.paths = newPath.paths.filter((subPath) => hasIntersection(roiRect, new ClipperShape([subPath])));

    return newPath;
};

const findBiggerSubPath = (shape: ClipperShape): ClipperPoint[] => {
    const areas = shape.areas();
    const { index: shapeIndex } = areas.reduce(
        (accum: { value: number; index: number }, value, index) => {
            return value > accum.value ? { value, index } : accum;
        },
        { value: 0, index: 0 }
    );

    return shape.paths.length ? shape.paths[shapeIndex] : [];
};

const runUnionOrDifference =
    <T>(algorithm: 'union' | 'difference', formatTo: (path: ClipperPoint[]) => T) =>
    (roi: RegionOfInterest, subj: Shape, clip: Shape): T => {
        const subjShape = transformToClipperShape(subj);
        const clipShape = transformToClipperShape(clip);
        const solutionPath = subjShape[algorithm](clipShape);
        const filteredPath = filterIntersectedPathsWithRoi(roi, solutionPath);
        const biggestPath = findBiggerSubPath(filteredPath);

        return formatTo(biggestPath);
    };

export const getShapesUnion = runUnionOrDifference<Polygon>('union', clipperShapeToPolygon);

export const getShapesDifference = runUnionOrDifference<Polygon>('difference', clipperShapeToPolygon);

export const removeOffLimitPoints = (shape: Shape, roi: RegionOfInterest): Polygon => {
    const { width, height, x, y } = roi;
    const getRect = (rx: number, ry: number, rWidth: number, rHeight: number): Rect => ({
        x: rx,
        y: ry,
        width: rWidth,
        height: rHeight,
        shapeType: ShapeType.Rect,
    });
    // `eraserSize` Builds and positions react shapes around ROI limits (top, left, right, bottom),
    // finaly `getShapesDifference` will use those reacts to calc and remove offline polygons
    const eraserSize = 10;
    const topRect = getRect(x - eraserSize, y - eraserSize, width + eraserSize * 3, eraserSize);
    const leftRect = getRect(x - eraserSize, y - eraserSize, eraserSize, height * 2);
    const rightRect = getRect(x + width, y - eraserSize, eraserSize, height * 2);
    const bottomRect = getRect(x - eraserSize, y + height, width + eraserSize * 3, eraserSize);

    return [leftRect, bottomRect, rightRect, topRect].reduce(
        (accum, current) => getShapesDifference(roi, accum, current),
        shape
    ) as Polygon;
};

const hasIntersection = (clip: ClipperShape, subj: ClipperShape) => {
    const { paths } = clip.intersect(subj);
    return !isEmpty(paths);
};

export const isWithinRoi = (roi: RegionOfInterest, shape: Shape): boolean => {
    const clipperShape = transformToClipperShape(shape);
    const roiShape = transformToClipperShape({ ...roi, shapeType: ShapeType.Rect });

    return hasIntersection(roiShape, clipperShape);
};
