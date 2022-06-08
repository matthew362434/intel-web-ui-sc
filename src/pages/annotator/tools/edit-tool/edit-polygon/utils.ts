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

import { Point } from '../../../../../core/annotations';

type Line = [startPoint: Point, endPoint: Point];

export const projectPointOnLine = ([startPoint, endPoint]: Line, point: Point): Point | undefined => {
    // Move startPoint to origin
    const b = {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y,
    };
    const a = {
        x: point.x - startPoint.x,
        y: point.y - startPoint.y,
    };

    // Project a onto b
    const aDotB = a.x * b.x + a.y * b.y;
    const bDotB = b.x * b.x + b.y * b.y;
    const scale = aDotB / bDotB;

    // Return undefined if the projected point would lie outside of the given line
    if (scale < 0 || scale > 1) {
        return undefined;
    }

    // Move origin back to startPoint
    return {
        x: b.x * scale + startPoint.x,
        y: b.y * scale + startPoint.y,
    };
};

export const selectAnchorPointLabel = (idx: number, isSelected: boolean, selectedAnchorIndexes: number[]): string => {
    if (isSelected) {
        return `Click to unselect, or press delete to remove point ${idx}`;
    }
    return selectedAnchorIndexes.length > 0 ? `Shift click to select point ${idx}` : `Click to select point ${idx}`;
};
