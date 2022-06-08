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

import { Circle, Rect, RegionOfInterest } from '../../../core/annotations';
import { ShapeType } from '../../../core/annotations/shapetype.enum';
import { isWithinRoi, removeOffLimitPoints, transformToClipperShape } from './utils';

describe('annotator utils', () => {
    describe('removeOffLimitPoints', () => {
        const roi: RegionOfInterest = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        };
        const getRect = (x: number, y: number): Rect => ({
            x,
            y,
            width: roi.width,
            height: roi.height,
            shapeType: ShapeType.Rect,
        });

        test.each([
            [
                'top',
                getRect(roi.x, -roi.height / 2),
                [
                    { x: 100, y: 50 },
                    { x: 0, y: 50 },
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                ],
            ],
            [
                'left/top corner',
                getRect(-roi.width / 2, -roi.height / 2),
                [
                    { x: 50, y: 50 },
                    { x: 0, y: 50 },
                    { x: 0, y: 0 },
                    { x: 50, y: 0 },
                ],
            ],
            [
                'left',
                getRect(-roi.width / 2, roi.y),
                [
                    { x: 50, y: 100 },
                    { x: 0, y: 100 },
                    { x: 0, y: 0 },
                    { x: 50, y: 0 },
                ],
            ],
            [
                'left/bottom corner',
                getRect(-roi.width / 2, roi.height / 2),
                [
                    { x: 50, y: 100 },
                    { x: 0, y: 100 },
                    { x: 0, y: 50 },
                    { x: 50, y: 50 },
                ],
            ],
            [
                'bottom',
                getRect(roi.x, roi.height / 2),
                [
                    { x: 100, y: 100 },
                    { x: 0, y: 100 },
                    { x: 0, y: 50 },
                    { x: 100, y: 50 },
                ],
            ],
            [
                'right/bottom corner',
                getRect(roi.width / 2, roi.height / 2),
                [
                    { x: 100, y: 100 },
                    { x: 50, y: 100 },
                    { x: 50, y: 50 },
                    { x: 100, y: 50 },
                ],
            ],
            [
                'right',
                getRect(roi.width / 2, roi.y),
                [
                    { x: 100, y: 100 },
                    { x: 50, y: 100 },
                    { x: 50, y: 0 },
                    { x: 100, y: 0 },
                ],
            ],
            [
                'right/top corner',
                getRect(roi.width / 2, -roi.height / 2),
                [
                    { x: 100, y: 50 },
                    { x: 50, y: 50 },
                    { x: 50, y: 0 },
                    { x: 100, y: 0 },
                ],
            ],
        ])('remove offlimit %o', (_, outlineShape: Rect, result): void => {
            const newShape = removeOffLimitPoints(outlineShape, roi);
            //
            expect(newShape.points).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(result[0]),
                    expect.objectContaining(result[1]),
                    expect.objectContaining(result[2]),
                    expect.objectContaining(result[3]),
                ])
            );

            const rioRect: Rect = { ...roi, shapeType: ShapeType.Rect };
            expect(transformToClipperShape(rioRect).totalArea()).toBeGreaterThan(
                transformToClipperShape(newShape).totalArea()
            );
            expect(newShape.shapeType).toBe(ShapeType.Polygon);
        });
    });

    describe('isWithinRoi', () => {
        const roi = { x: 0, y: 0, width: 500, height: 500 };

        it('inside', () => {
            const circle: Circle = { x: 10, y: 10, r: 20, shapeType: ShapeType.Circle };
            expect(isWithinRoi(roi, circle)).toBe(true);
        });

        it('partially inside', () => {
            const circle: Circle = { x: -19, y: 0, r: 20, shapeType: ShapeType.Circle };
            expect(isWithinRoi(roi, circle)).toBe(true);
        });

        it('outside', () => {
            const circle: Circle = { x: -20, y: 0, r: 20, shapeType: ShapeType.Circle };
            expect(isWithinRoi(roi, circle)).toBe(false);
        });
    });
});
