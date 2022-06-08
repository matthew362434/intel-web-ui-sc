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

import { Rect, Shape } from '.';
import { getBoundingBox, getShapesBoundingBox, isInsideOfBoundingBox } from './math';
import { ShapeType } from './shapetype.enum';

describe('bounding boxes of shapes', () => {
    const testInputs: [Shape, Omit<Rect, 'shapeType'>][] = [
        [
            { x: 0, y: 0, width: 100, height: 100, shapeType: ShapeType.Rect },
            { x: 0, y: 0, width: 100, height: 100 },
        ],
        [
            { x: 150, y: 150, r: 50, shapeType: ShapeType.Circle },
            { x: 100, y: 100, width: 100, height: 100 },
        ],
        [
            {
                points: [
                    { x: 0, y: 200 },
                    { x: 100, y: 200 },
                    { x: 100, y: 300 },
                ],
                shapeType: ShapeType.Polygon,
            },
            { x: 0, y: 200, width: 100, height: 100 },
        ],
    ];

    test.each(testInputs)(
        'finds the bounding box of a shape',
        (shape: Shape, boundingBox: Omit<Rect, 'shapeType'>): void => {
            expect(getBoundingBox(shape)).toEqual(boundingBox);
        }
    );

    it('finds the bounding box of a collection of shapes', () => {
        expect(getShapesBoundingBox(testInputs.map(([shape]) => shape))).toEqual({
            x: 0,
            y: 0,
            width: 200,
            height: 300,
        });
    });

    describe('isInsideOfBoundingBox', () => {
        it.each([
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 0, y: 0, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 90, y: 90, width: 10, height: 10 },
            ],
        ])('%s contains %s', (first, second) => {
            expect(isInsideOfBoundingBox(first, second)).toEqual(true);
        });

        it.each([
            // Outside of corners,
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -20, y: -20, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 0, y: -20, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 120, y: -20, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 120, y: 0, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 120, y: 120, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 0, y: 120, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -20, y: 120, width: 10, height: 10 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -20, y: 0, width: 10, height: 10 },
            ],
            // Partially outside, partially inside
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -10, y: -10, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 0, y: -10, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 110, y: -10, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 110, y: 0, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 110, y: 110, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: 0, y: 110, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -10, y: 110, width: 20, height: 20 },
            ],
            [
                { x: 0, y: 0, width: 100, height: 100 },
                { x: -10, y: 0, width: 20, height: 20 },
            ],
        ])('%s does not contain %s', (first, second) => {
            expect(isInsideOfBoundingBox(first, second)).toEqual(false);
        });
    });
});
