// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { ReactNode, useState, PointerEvent } from 'react';

import { CursorProperty } from 'csstype';

import { Point } from '../../../../core/annotations/shapes.interface';
import { isLeftButton } from '../buttons-utils';
import { PointerType } from '../tools.interface';

interface AnchorProps {
    children: ReactNode;
    x: number;
    y: number;
    angle: number;
    size: number;
    zoom: number;
    label: string;
    fill?: string;
    cursor: CursorProperty;
    onComplete: () => void;
    moveAnchorTo: (x: number, y: number) => void;
}

export const Anchor = ({
    x,
    y,
    fill = 'white',
    size,
    zoom,
    label,
    cursor,
    children,
    moveAnchorTo,
    onComplete,
}: AnchorProps): JSX.Element => {
    const [dragFrom, setDragFrom] = useState<Point | null>(null);

    const onPointerDown = (event: PointerEvent) => {
        event.preventDefault();

        if (event.pointerType === PointerType.Touch || !isLeftButton(event)) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);

        const mouse = { x: event.clientX / zoom, y: event.clientY / zoom };
        setDragFrom({ x: mouse.x - x, y: mouse.y - y });
    };

    const onPointerMove = (event: PointerEvent) => {
        event.preventDefault();

        if (dragFrom === null) {
            return;
        }

        const mouse = { x: event.clientX / zoom, y: event.clientY / zoom };
        moveAnchorTo(mouse.x - dragFrom.x, mouse.y - dragFrom.y);
    };

    const onPointerUp = (event: PointerEvent) => {
        event.preventDefault();
        event.currentTarget.releasePointerCapture(event.pointerId);
        setDragFrom(null);
        onComplete();
    };

    // We render both a visual anchor and an invisible anchor that has a larger
    // clicking area than the visible one
    const interactiveAnchorProps = {
        style: { cursor },
        fill: dragFrom === null ? fill : 'var(--energy-blue)',
        'aria-label': label,
        onPointerUp: onPointerUp,
        onPointerMove: onPointerMove,
        onPointerDown: onPointerDown,
    };

    return (
        <g>
            {children}
            <rect
                x={x - size}
                y={y - size}
                cx={x}
                cy={y}
                width={size * 2}
                height={size * 2}
                fillOpacity={0}
                {...interactiveAnchorProps}
            />
        </g>
    );
};
