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

import polylabel from 'polylabel';

import * as Vec2 from '../../core/annotations/vec2';
import { RegionOfInterest } from './annotation.interface';
import { Point, Rect, Circle, Polygon, Shape, RotatedRect } from './shapes.interface';
import { ShapeType } from './shapetype.enum';

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

export function clampBetween(min: number, value: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function pointsToRect(startPoint: Point, endPoint: Point): RegionOfInterest {
    const topLeft = {
        x: Math.min(startPoint.x, endPoint.x),

        y: Math.min(startPoint.y, endPoint.y),
    };
    const bottomRight = {
        x: Math.max(startPoint.x, endPoint.x),
        y: Math.max(startPoint.y, endPoint.y),
    };

    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
    };
}

export const calculateDistance = (startPoint: Point, endPoint: Point): number => {
    return Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
};

export function roiFromImage(image: HTMLImageElement): RegionOfInterest {
    const { x, y, width, height } = image;
    return { x, y, width, height };
}

export function clampPointBetweenImage(image: HTMLImageElement): (point: Point) => Point {
    const roi = roiFromImage(image);

    return ({ x, y }: Point): Point => {
        return {
            x: clampBetween(roi.x, x, roi.width),
            y: clampBetween(roi.y, y, roi.height),
        };
    };
}

export function isPointOverPoint(point1: Point, point2: Point, radius: number): boolean {
    const distance = calculateDistance(point1, point2);
    return distance < radius;
}

function isValueBetween(value: number, v1: number, v2: number): boolean {
    return (value >= v1 && value <= v2) || (value >= v2 && value <= v1);
}

function sgn(x: number): number {
    return x < 0 ? -1 : 1;
}

export function getIntersectionPoint(radius: number, center: Point, pointList: Array<Point>): Point | null {
    for (let i = 0; i < pointList.length - 1; i++) {
        const p1 = pointList[i];
        const p2 = pointList[i + 1];
        const x1 = p1.x - center.x;
        const y1 = p1.y - center.y;
        const x2 = p2.x - center.x;
        const y2 = p2.y - center.y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        const D = x1 * y2 - x2 * y1;
        const delta = Math.pow(radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2);
        if (delta >= 0) {
            const inX1 =
                (D * dy + sgn(dy) * dx * Math.sqrt(Math.pow(radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2))) /
                Math.pow(dr, 2);
            const inX2 =
                (D * dy - sgn(dy) * dx * Math.sqrt(Math.pow(radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2))) /
                Math.pow(dr, 2);
            const inY1 =
                (-1 * D * dx + Math.abs(dy) * Math.sqrt(Math.pow(radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2))) /
                Math.pow(dr, 2);
            const inY2 =
                (-1 * D * dx - Math.abs(dy) * Math.sqrt(Math.pow(radius, 2) * Math.pow(dr, 2) - Math.pow(D, 2))) /
                Math.pow(dr, 2);
            if (
                (isValueBetween(inX1, x1, x2) && isValueBetween(inY1, y1, y2)) ||
                (isValueBetween(inX2, x1, x2) && isValueBetween(inY2, y1, y2))
            )
                return p2;
        }
    }
    return null;
}

export const pointInRectangle = (rect: Rect, point: Point): boolean => {
    const { width, height, x, y } = rect;
    const startPoint: Point = { x, y };
    const endPoint: Point = { x: x + width, y: y + height };
    return point.x >= startPoint.x && point.x <= endPoint.x && point.y >= startPoint.y && point.y <= endPoint.y;
};

export const pointInRotatedRectangle = (rect: RotatedRect, point: Point): boolean => {
    const { x, y, width, height, angle } = rect;
    const rotationCorrected = Vec2.abs(Vec2.rotateDeg(Vec2.sub(point, { x, y }), -angle));
    const distanceCenterToBoxEdge = Vec2.divScalar({ x: width, y: height }, 2);
    return rotationCorrected.x < distanceCenterToBoxEdge.x && rotationCorrected.y < distanceCenterToBoxEdge.y;
};

export const pointInCircle = (circle: Circle, point: Point): boolean => {
    const { x, y, r } = circle;
    const centerPoint: Point = { x, y };
    const distance = calculateDistance(centerPoint, point);
    return distance < r;
};

// Point in polygon (ray-casting algorithm)
export const pointInPolygon = (polygon: Polygon, point: Point): boolean => {
    const polygonPoints = polygon.points;
    const pointsLength: number = polygonPoints.length;
    const x = point.x;
    const y = point.y;
    let inside = false;
    for (let i = 0, j = pointsLength - 1; i < pointsLength; j = i++) {
        const xi = polygonPoints[i].x;
        const yi = polygonPoints[i].y;
        const xj = polygonPoints[j].x;
        const yj = polygonPoints[j].y;

        const yDiffEquility = yi > y !== yj > y;
        const xDiff = xj - xi;
        const yiDiff = y - yi;
        const yijDiff = yj - yi;
        const intersect = yDiffEquility && x < (xDiff * yiDiff) / yijDiff + xi;

        if (intersect) inside = !inside;
    }
    return inside;
};

export type BoundingBox = Omit<Rect, 'shapeType'>;
export const getBoundingBox = (shape: Shape): BoundingBox => {
    switch (shape.shapeType) {
        case ShapeType.Rect: {
            const { x, y, width, height } = shape;
            return { x, y, width, height };
        }
        case ShapeType.RotatedRect: {
            const { x, y, width, height } = shape;
            return { x: x - width / 2, y: y - height / 2, width, height };
        }
        case ShapeType.Circle: {
            const { r, x, y } = shape;
            return {
                x: x - r,
                y: y - r,
                width: r * 2,
                height: r * 2,
            };
        }
        case ShapeType.Polygon: {
            const extremePoints = shape.points.reduce(
                (prev, point) => {
                    return {
                        minX: Math.min(point.x, prev.minX),
                        maxX: Math.max(point.x, prev.maxX),
                        minY: Math.min(point.y, prev.minY),
                        maxY: Math.max(point.y, prev.maxY),
                    };
                },
                { minX: Infinity, maxX: 0, minY: Infinity, maxY: 0 }
            );

            const x = extremePoints.minX;
            const y = extremePoints.minY;
            const width = extremePoints.maxX - extremePoints.minX;
            const height = extremePoints.maxY - extremePoints.minY;

            return { x, y, width, height };
        }
    }
};

export const getShapesBoundingBox = (shapes: Shape[]): BoundingBox => {
    const rects = shapes.map(getBoundingBox);
    const extremePoints = rects.reduce(
        (prev, rect) => {
            return {
                minX: Math.min(rect.x, prev.minX),
                maxX: Math.max(rect.x + rect.width, prev.maxX),
                minY: Math.min(rect.y, prev.minY),
                maxY: Math.max(rect.y + rect.height, prev.maxY),
            };
        },
        { minX: Infinity, maxX: 0, minY: Infinity, maxY: 0 }
    );

    const x = extremePoints.minX;
    const y = extremePoints.minY;
    const width = extremePoints.maxX - extremePoints.minX;
    const height = extremePoints.maxY - extremePoints.minY;

    return { x, y, width, height };
};

export const isInsideOfBoundingBox = (parentBoundingBox: BoundingBox, shape: BoundingBox): boolean => {
    const { x, y, width, height } = parentBoundingBox;

    const boundingBox = shape;

    return (
        boundingBox.x >= x &&
        boundingBox.x <= x + width &&
        boundingBox.x + boundingBox.width <= x + width &&
        boundingBox.y >= y &&
        boundingBox.y <= y + height &&
        boundingBox.y + boundingBox.height <= y + height
    );
};

export const getCenterOfShape = (shape: Shape): Point => {
    switch (shape.shapeType) {
        case ShapeType.Polygon: {
            const [x, y] = polylabel([shape.points.map((point) => [point.x, point.y])]);

            return { x, y };
        }
        case ShapeType.Circle: {
            return { x: shape.x, y: shape.y };
        }
        case ShapeType.Rect: {
            return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
        }
        case ShapeType.RotatedRect: {
            return { x: shape.x, y: shape.y };
        }
    }
};

export const containsCenterOfShape = (parentBoundingBox: BoundingBox, { x, y }: Point): boolean => {
    return (
        x >= parentBoundingBox.x &&
        x <= parentBoundingBox.x + parentBoundingBox.width &&
        y >= parentBoundingBox.y &&
        y <= parentBoundingBox.y + parentBoundingBox.height
    );
};

export const hasEqualBoundingBox = (first: BoundingBox, second: BoundingBox): boolean => {
    return (
        first.x === second.x && first.y === second.y && first.width === second.width && first.height === second.height
    );
};
