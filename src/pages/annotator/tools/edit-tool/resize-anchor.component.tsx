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

import { CursorProperty } from 'csstype';

import { Anchor } from './anchor.component';
import { ResizeAnchorType } from './resize-anchor.enum';

export const ANCHOR_SIZE = 8;

interface ResizeAnchorProps {
    zoom: number;
    x: number;
    y: number;
    moveAnchorTo: (x: number, y: number) => void;
    cursor?: CursorProperty;
    label: string;
    onComplete: () => void;
    type?: ResizeAnchorType;
    fill?: string;
    angle?: number;
}

export const ResizeAnchor = ({
    onComplete,
    zoom,
    x,
    y,
    moveAnchorTo,
    label,
    cursor = 'all-scroll',
    fill = 'white',
    type = ResizeAnchorType.SQUARE,
    angle = 0,
}: ResizeAnchorProps): JSX.Element => {
    // We render both a visual anchor and an invisible anchor that has a larger
    // clicking area than the visible one
    const visualAnchorProps = {
        stroke: 'var(--energy-blue)',
        strokeWidth: 1 / zoom,
    };

    const size = ANCHOR_SIZE / zoom;
    return (
        <Anchor
            angle={angle}
            size={size}
            label={label}
            moveAnchorTo={moveAnchorTo}
            onComplete={onComplete}
            x={x}
            y={y}
            zoom={zoom}
            fill={fill}
            cursor={cursor ? cursor : 'default'}
        >
            {type === ResizeAnchorType.CIRCLE ? (
                <circle cx={x} cy={y} r={size / 2} {...visualAnchorProps} />
            ) : (
                <g fillOpacity={1.0} transform={`rotate(${angle})`} transform-origin={`${x}px ${y}px`}>
                    <rect x={x - size / 2} y={y - size / 2} width={size} height={size} {...visualAnchorProps} />
                </g>
            )}
        </Anchor>
    );
};
