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

import { PointerEvent, useState } from 'react';

import { Annotation as AnnotationInterface, Point } from '../../../../core/annotations';
import { Annotation } from '../../annotation';
import { isLeftButton } from '../buttons-utils';
import { PointerType } from '../tools.interface';
import { allowPanning } from '../utils';

const STROKE_WIDTH = 2;

interface TranslateShapeProps {
    zoom: number;
    annotation: AnnotationInterface;
    translateShape: ({ x, y }: { x: number; y: number }) => void;
    onComplete: () => void;
    disabled: boolean;
}

export const TranslateShape = ({
    onComplete,
    zoom,
    annotation,
    translateShape,
    disabled,
}: TranslateShapeProps): JSX.Element => {
    const [dragFromPoint, setDragFromPoint] = useState<null | Point>(null);

    const onPointerDown = (event: PointerEvent<SVGSVGElement>): void => {
        if (dragFromPoint !== null) {
            return;
        }

        if (event.pointerType === PointerType.Touch || !isLeftButton(event)) {
            return;
        }

        const mouse = { x: event.clientX / zoom, y: event.clientY / zoom };

        event.currentTarget.setPointerCapture(event.pointerId);

        setDragFromPoint(mouse);
    };

    const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
        event.preventDefault();

        if (dragFromPoint === null) {
            return;
        }

        const mouse = { x: event.clientX / zoom, y: event.clientY / zoom };

        translateShape({
            x: mouse.x - dragFromPoint.x,
            y: mouse.y - dragFromPoint.y,
        });
        setDragFromPoint(mouse);
    };

    const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
        if (dragFromPoint === null) {
            return;
        }
        event.preventDefault();
        setDragFromPoint(null);
        event.currentTarget.releasePointerCapture(event.pointerId);
        onComplete();
    };

    return (
        <g
            id={`translate-annotation-${annotation.id}`}
            stroke='var(--energy-blue)'
            strokeWidth={STROKE_WIDTH / zoom}
            aria-label='Drag to move shape'
            onPointerDown={allowPanning(onPointerDown)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={disabled ? {} : { pointerEvents: 'auto' }}
        >
            <Annotation annotation={annotation} />
        </g>
    );
};
