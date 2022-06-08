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

import { Annotation } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { Circle } from './circle.component';
import { Polygon } from './polygon.component';
import { Rectangle } from './rectangle.component';
import { RotatedRectangle } from './rotated-rectangle.component';

export const ShapeFactory = ({ annotation }: { annotation: Annotation }): JSX.Element => {
    const { shape } = annotation;

    switch (shape.shapeType) {
        case ShapeType.Rect:
            return <Rectangle shape={shape} styles={{}} />;
        case ShapeType.RotatedRect:
            return <RotatedRectangle shape={shape} styles={{}} />;
        case ShapeType.Circle:
            return <Circle shape={shape} styles={{}} />;
        case ShapeType.Polygon:
            return <Polygon shape={shape} styles={{}} />;
    }
};