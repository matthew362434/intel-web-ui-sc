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

import { degreesToRadians } from './math';
import * as Vec2 from './vec2';

describe('Vec2', () => {
    describe('add', () => {
        const testInputs: [[Vec2.Vec2, Vec2.Vec2], Vec2.Vec2][] = [
            [
                [
                    { x: 1, y: -1 },
                    { x: -4, y: 0 },
                ],
                { x: -3, y: -1 },
            ],
            [
                [
                    { x: 0, y: 2 },
                    { x: -1, y: 1 },
                ],
                { x: -1, y: 3 },
            ],
        ];

        test.each(testInputs)('adds numbers', ([a, b]: [Vec2.Vec2, Vec2.Vec2], expectedResult: Vec2.Vec2) => {
            expect(Vec2.add(a, b)).toEqual(expectedResult);
        });
    });

    describe('sub', () => {
        const testInputs: [[Vec2.Vec2, Vec2.Vec2], Vec2.Vec2][] = [
            [
                [
                    { x: 1, y: -1 },
                    { x: -4, y: 0 },
                ],
                { x: 5, y: -1 },
            ],
            [
                [
                    { x: 0, y: 2 },
                    { x: -1, y: 1 },
                ],
                { x: 1, y: 1 },
            ],
        ];

        test.each(testInputs)('subtracts numbers', ([a, b]: [Vec2.Vec2, Vec2.Vec2], expectedResult: Vec2.Vec2) => {
            expect(Vec2.sub(a, b)).toEqual(expectedResult);
        });
    });

    describe('mul', () => {
        const testInputs: [[Vec2.Vec2, Vec2.Vec2], Vec2.Vec2][] = [
            [
                [
                    { x: 1, y: -1 },
                    { x: -4, y: 0 },
                ],
                { x: -4, y: -0 },
            ],
            [
                [
                    { x: 0, y: 2 },
                    { x: -1, y: 1 },
                ],
                { x: -0, y: 2 },
            ],
        ];

        test.each(testInputs)('multiplies numbers', ([a, b]: [Vec2.Vec2, Vec2.Vec2], expectedResult: Vec2.Vec2) => {
            expect(Vec2.mul(a, b)).toEqual(expectedResult);
        });
    });

    describe('div', () => {
        const testInputs: [[Vec2.Vec2, Vec2.Vec2], Vec2.Vec2][] = [
            [
                [
                    { x: 1, y: -1 },
                    { x: -4, y: 3 },
                ],
                { x: -0.25, y: -1 / 3 },
            ],
            [
                [
                    { x: 0, y: 2 },
                    { x: -1, y: 1 },
                ],
                { x: -0, y: 2 },
            ],
        ];

        test.each(testInputs)('divides numbers', ([a, b]: [Vec2.Vec2, Vec2.Vec2], expectedResult: Vec2.Vec2) => {
            expect(Vec2.div(a, b)).toEqual(expectedResult);
        });
    });

    describe('mulScalar', () => {
        const testInputs: [[Vec2.Vec2, number], Vec2.Vec2][] = [
            [[{ x: 1, y: -1 }, 3], { x: 3, y: -3 }],
            [[{ x: 0, y: 2 }, 2], { x: 0, y: 4 }],
        ];

        test.each(testInputs)('multiplies numbers', ([a, b]: [Vec2.Vec2, number], expectedResult: Vec2.Vec2) => {
            expect(Vec2.mulScalar(a, b)).toEqual(expectedResult);
        });
    });

    describe('divScalar', () => {
        const testInputs: [[Vec2.Vec2, number], Vec2.Vec2][] = [
            [[{ x: 6, y: -2 }, 2], { x: 3, y: -1 }],
            [[{ x: 0, y: 2 }, 2], { x: 0, y: 1 }],
        ];

        test.each(testInputs)('divides numbers', ([a, b]: [Vec2.Vec2, number], expectedResult: Vec2.Vec2) => {
            expect(Vec2.divScalar(a, b)).toEqual(expectedResult);
        });
    });

    describe('rotate', () => {
        const d2r = degreesToRadians;
        const testInputs: [[Vec2.Vec2, number], Vec2.Vec2][] = [
            [[{ x: 6, y: -2 }, d2r(90)], { x: 2, y: 6 }],
            [[{ x: 0, y: 2 }, d2r(180)], { x: 0, y: -2 }],
        ];

        test.each(testInputs)('rotates vector', ([a, b]: [Vec2.Vec2, number], expectedResult: Vec2.Vec2) => {
            const result = Vec2.rotate(a, b);
            expect(result.x).toBeCloseTo(expectedResult.x, 5);
            expect(result.y).toBeCloseTo(expectedResult.y, 5);
        });
    });

    describe('rotateDeg', () => {
        const testInputs: [[Vec2.Vec2, number], Vec2.Vec2][] = [
            [[{ x: 6, y: -2 }, 90], { x: 2, y: 6 }],
            [[{ x: 0, y: 2 }, 180], { x: 0, y: -2 }],
        ];

        test.each(testInputs)('rotates vector', ([a, b]: [Vec2.Vec2, number], expectedResult: Vec2.Vec2) => {
            const result = Vec2.rotateDeg(a, b);
            expect(result.x).toBeCloseTo(expectedResult.x, 5);
            expect(result.y).toBeCloseTo(expectedResult.y, 5);
        });
    });

    describe('magnitude', () => {
        const testInputs: [Vec2.Vec2, number][] = [
            [{ x: 6, y: -2 }, Math.sqrt(40)],
            [{ x: 0, y: 2 }, Math.sqrt(4)],
        ];

        test.each(testInputs)('rotates vector', (a: Vec2.Vec2, expectedResult: number) => {
            expect(Vec2.magnitude(a)).toEqual(expectedResult);
        });
    });

    describe('normalize', () => {
        const testInputs: [Vec2.Vec2, Vec2.Vec2][] = [
            [
                { x: 4, y: 4 },
                { x: 0.71, y: 0.71 },
            ],
            [
                { x: 0, y: 2 },
                { x: 0, y: 1 },
            ],
            [
                { x: -2, y: 0 },
                { x: -1, y: 0 },
            ],
        ];

        test.each(testInputs)('normalizes vector', (a: Vec2.Vec2, expectedResult: Vec2.Vec2) => {
            const result = Vec2.normalize(a);
            expect(result.x).toBeCloseTo(expectedResult.x);
            expect(result.y).toBeCloseTo(expectedResult.y);
        });
    });

    describe('dot', () => {
        const testInputs: [[Vec2.Vec2, Vec2.Vec2], number][] = [
            [
                [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                ],
                3,
            ],
            [
                [
                    { x: 0, y: 1 },
                    { x: 8, y: 2 },
                ],
                2,
            ],
            [
                [
                    { x: -1, y: 1 },
                    { x: 4, y: 1 },
                ],
                -3,
            ],
        ];

        test.each(testInputs)('applies dot product', ([a, b]: [Vec2.Vec2, Vec2.Vec2], expectedResult: number) => {
            expect(Vec2.dot(a, b)).toEqual(expectedResult);
        });
    });

    describe('sign', () => {
        const testInputs: [Vec2.Vec2, Vec2.Vec2][] = [
            [
                { x: 4, y: 1 },
                { x: 1, y: 1 },
            ],
            [
                { x: -100, y: -Number.EPSILON },
                { x: -1, y: -1 },
            ],
            [
                { x: -Number.EPSILON, y: 0 },
                { x: -1, y: 1 },
            ],
        ];

        test.each(testInputs)('gets the sign of the vector', (a: Vec2.Vec2, expectedResult: Vec2.Vec2) => {
            expect(Vec2.sign(a)).toEqual(expectedResult);
        });
    });

    describe('roundTo', () => {
        const testInputs: [[Vec2.Vec2, number], Vec2.Vec2][] = [
            [[{ x: 0.03723, y: -4.78967 }, 3], { x: 0.037, y: -4.79 }],
        ];

        test.each(testInputs)(
            'rounds vector to n number of digits',
            ([a, b]: [Vec2.Vec2, number], expectedResult: Vec2.Vec2) => {
                expect(Vec2.roundTo(a, b)).toEqual(expectedResult);
            }
        );
    });

    describe('abs', () => {
        const testInputs: [Vec2.Vec2, Vec2.Vec2][] = [
            [
                { x: -3, y: -4 },
                { x: 3, y: 4 },
            ],
            [
                { x: 0, y: 9 },
                { x: 0, y: 9 },
            ],
        ];

        test.each(testInputs)('makes vector component positive', (a: Vec2.Vec2, expectedResult: Vec2.Vec2) => {
            expect(Vec2.abs(a)).toEqual(expectedResult);
        });
    });

    describe('getAngleDegrees', () => {
        const testInputs: [Vec2.Vec2, number][] = [
            [{ x: 1, y: 0 }, 0],
            [{ x: 0, y: 1 }, 90],
            [{ x: -1, y: 0 }, 180],
            [{ x: 0, y: -1 }, -90],
            [{ x: 0, y: -100 }, -90],
        ];

        test.each(testInputs)(
            'calculate angle of direction vector %p to equal %p degrees',
            (direction, expectedResult) => {
                expect(Vec2.getAngleDegrees(direction)).toEqual(expectedResult);
            }
        );
    });
});
