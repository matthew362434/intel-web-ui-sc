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

import { Annotation as AnnotationProps } from '../../../core/annotations';
import { DEFAULT_ANNOTATION_STYLES as defaultStyles, EDIT_ANNOTATION_STYLES as editStyles } from '../tools/utils';
import { ShapeFactory } from './shapes';

export const Annotation = ({ annotation }: { annotation: AnnotationProps }): JSX.Element => {
    const { isHovered, isSelected, id, labels } = annotation;
    const shapeStyles = isSelected || isHovered ? editStyles : {};
    const labelColors = labels.map(({ color }) => color);
    const color = labelColors.length > 0 ? labelColors[labelColors.length - 1] : undefined;

    return (
        <g
            id={`canvas-annotation-${id}`}
            {...defaultStyles}
            {...(color !== undefined ? { fill: color, stroke: color } : {})}
            {...shapeStyles}
        >
            <ShapeFactory annotation={annotation} />
        </g>
    );
};
