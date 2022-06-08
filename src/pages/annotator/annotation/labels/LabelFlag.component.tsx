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
import classes from './labels.module.scss';

interface LabelFlagProps {
    annotation: Annotation;
    top: number;
    left: number;
    y: number;
}

export const LabelFlag = ({ annotation, top, left, y }: LabelFlagProps): JSX.Element => {
    const shape = annotation.shape;

    if (shape.shapeType === ShapeType.Rect) {
        return <></>;
    }

    // In case of a circle we want the flag to start on top of the circle, instead of in its center
    const height = shape.shapeType === ShapeType.Circle ? y - shape.r - top : y - top;

    const labelColors = annotation.labels.map(({ color }) => color);
    const color = labelColors.length > 0 ? labelColors[labelColors.length - 1] : 'var(--spectrum-global-color-gray-50)';

    return <div className={classes.labelFlag} style={{ left, top, height, backgroundColor: color }} />;
};
