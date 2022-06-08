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

import { ReactElement, SVGProps, useMemo } from 'react';

import { Point } from '../../../../core/annotations';

export type StrokeLinecap = 'butt' | 'round' | 'square';
export type StrokeLinejoin = 'miter' | 'round' | 'bevel';

export interface LineProps {
    color: string;
    points: Point[];
    brushSize?: number;
    strokeLinecap?: StrokeLinecap;
    strokeLinejoin?: StrokeLinejoin;
}

export const Line = ({
    color,
    brushSize = 4, // Default value: 4px
    points,
    strokeLinecap = 'round',
    strokeLinejoin = 'round',
}: LineProps): ReactElement<SVGProps<SVGPolylineElement>> => {
    const formattedPoints = useMemo((): string => points.map(({ x, y }) => `${x},${y}`).join(' '), [points]);

    const props = {
        points: formattedPoints,
        stroke: color,
        strokeWidth: brushSize,
        fill: 'none',
        strokeLinecap: strokeLinecap,
        strokeLinejoin: strokeLinejoin,
    };

    return <polyline {...props} />;
};
