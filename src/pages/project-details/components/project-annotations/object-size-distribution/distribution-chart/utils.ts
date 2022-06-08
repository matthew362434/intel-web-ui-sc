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
import { SVGProps } from 'react';

import { Point } from '../../../../../../core/annotations';

interface ScatterPoints {
    pointsWithinVerticalTriangle: Point[];
    pointsWithinHorizontalTriangle: Point[];
    restPoints: Point[];
}

export const calculateVerticalTrianglePoints = (
    props: SVGProps<SVGPolygonElement>,
    maxX: number,
    maxY: number,
    tallThs: number
): string => {
    const height = Number(props.height);
    const width = Number(props.width);
    const x = Number(props.x);
    const y = Number(props.y);
    const ratio = width / maxX;

    return [`${x}, ${y}`, `${x + (maxY / tallThs) * ratio}, ${y}`, `${x}, ${y + height}`].join(' ');
};

export const calculateHorizontalTrianglePoints = (
    props: SVGProps<SVGPolygonElement>,
    maxX: number,
    maxY: number,
    wideThs: number
): string => {
    const height = Number(props.height);
    const width = Number(props.width);
    const x = Number(props.x);
    const y = Number(props.y) + height;
    const ratio = height / maxY;

    return [`${x}, ${y}`, `${x + width}, ${y}`, `${x + width}, ${y - wideThs * maxX * ratio}`].join(' ');
};

export const getScatterPoints = (points: [number, number][], tallThs: number, wideThs: number): ScatterPoints => {
    const pointsWithinVerticalTriangle: Point[] = [];
    const pointsWithinHorizontalTriangle: Point[] = [];
    const restPoints: Point[] = [];

    points.forEach(([x, y]) => {
        if (y / x > tallThs) {
            pointsWithinHorizontalTriangle.push({ x, y });
        } else if (y / x <= wideThs) {
            pointsWithinVerticalTriangle.push({ x, y });
        } else {
            restPoints.push({ x, y });
        }
    });

    return { pointsWithinHorizontalTriangle, pointsWithinVerticalTriangle, restPoints };
};
