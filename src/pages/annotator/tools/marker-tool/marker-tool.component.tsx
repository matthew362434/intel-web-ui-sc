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
import { SVGProps, ReactElement, useState, useRef, useCallback, PointerEvent } from 'react';

import { calculateDistance, Point } from '../../../../core/annotations';
import { Line } from '../../annotation/shapes/line.component';
import { isLeftButton } from '../buttons-utils';
import { SvgToolCanvas } from '../svg-tool-canvas.component';
import { PointerType } from '../tools.interface';
import { getRelativePoint } from '../utils';
import { MarkerToolProps } from './marker-tool.interface';

export const MarkerTool = ({
    image,
    zoom,
    markerId,
    onComplete,
    brushSize,
    strokeLinecap,
    strokeLinejoin,
    label,
    styles,
}: MarkerToolProps): ReactElement<SVGProps<SVGGElement>> | null => {
    const [points, setPoints] = useState<Point[]>([] as Point[]);

    const ref = useRef<SVGRectElement>(null);

    const onPointerDown = useCallback(
        (event: PointerEvent<SVGSVGElement>): void => {
            if (ref.current === null) {
                return;
            }

            const button = {
                button: event.button,
                buttons: event.buttons,
            };

            if (event.pointerType === PointerType.Touch || !isLeftButton(button)) {
                return;
            }

            event.currentTarget.setPointerCapture(event.pointerId);

            const mousePoint = getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom);

            setPoints([{ x: Math.round(mousePoint.x), y: Math.round(mousePoint.y) }]);
        },
        [zoom]
    );

    const onPointerMove = useCallback(
        (event: PointerEvent<SVGSVGElement>) => {
            if (ref.current === null || !points.length) {
                return;
            }

            const mousePoint = getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom);

            const previousPoint = points[points.length - 1];

            const distance = calculateDistance(previousPoint, mousePoint);

            if (distance >= 1) {
                setPoints((previousPoints) => [
                    ...previousPoints,
                    { x: Math.round(mousePoint.x), y: Math.round(mousePoint.y) },
                ]);
            }
        },
        [points, zoom]
    );

    const onPointerUp = useCallback(
        (event: PointerEvent<SVGSVGElement>): void => {
            // Mousewheel
            if (event.button === 1) {
                return;
            }

            onComplete({ id: markerId, points, label, brushSize });
            setPoints([]);

            event.currentTarget.releasePointerCapture(event.pointerId);
        },
        [points, onComplete, label, brushSize, markerId]
    );

    return (
        <SvgToolCanvas
            image={image}
            canvasRef={ref}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={styles}
        >
            <Line
                points={points}
                brushSize={brushSize}
                color={label.color}
                strokeLinecap={strokeLinecap}
                strokeLinejoin={strokeLinejoin}
            />
        </SvgToolCanvas>
    );
};
