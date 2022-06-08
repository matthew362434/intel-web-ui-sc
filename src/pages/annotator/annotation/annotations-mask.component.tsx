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

import { useId } from '@react-aria/utils';

import { Annotation as AnnotationInterface } from '../../../core/annotations';
import { ShapeFactory } from './../annotation';
import classes from './../annotator-canvas.module.scss';

const MASK_OPACITY = 0.4;

interface AnnotationMaskProps {
    annotations: AnnotationInterface[];
    width: number;
    height: number;
}

export const AnnotationsMask = ({ annotations, width, height }: AnnotationMaskProps): JSX.Element => {
    const maskId = useId();

    return (
        <svg
            id={`annotations-mask`}
            aria-label='Annotation mask'
            width={width}
            height={height}
            className={classes.layer}
        >
            <mask id={maskId}>
                <rect x='0' y='0' width={width} height={height} fill='white' fillOpacity={MASK_OPACITY} />
                {annotations.map((annotation) => (
                    <g key={annotation.id} fill='black'>
                        <ShapeFactory annotation={annotation} />
                    </g>
                ))}
            </mask>
            <rect x={0} y={0} width={width} height={height} mask={`url(#${maskId})`} color='black' />
        </svg>
    );
};
