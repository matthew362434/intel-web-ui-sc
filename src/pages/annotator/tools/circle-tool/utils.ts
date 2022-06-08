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

import { calculateDistance, Circle, Point } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';

export enum Mode {
    NORMAL,
    EDIT_RADIUS,
}

export const pointsToCircle = (startPoint: Point, endPoint: Point, minRadius: number): Circle => {
    const radius = calculateDistance(startPoint, endPoint);

    return {
        x: startPoint.x,
        y: startPoint.y,
        r: radius <= minRadius ? minRadius : radius,
        shapeType: ShapeType.Circle,
    };
};
