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

import { PointerEvent, SVGProps, useRef, useState } from 'react';

import { clampPointBetweenImage, Point, pointsToRect, Rect as RectInterface } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { useEventListener } from '../../../../hooks';
import { KeyboardEvents, KeyMap } from '../../../../shared/keyboard-events';
import { Rectangle } from '../../annotation';
import { isLeftButton, isEraserButton } from '../buttons-utils';
import { Crosshair } from '../crosshair';
import { useCrosshair } from '../crosshair/utils';
import { SvgToolCanvas } from '../svg-tool-canvas.component';
import { PointerType } from '../tools.interface';
import { getRelativePoint } from '../utils';

const CURSOR_OFFSET = '7 8';
interface DrawingBoxInterface {
    onComplete: (shapes: RectInterface[]) => void;
    image: HTMLImageElement;
    zoom: number;
    styles: SVGProps<SVGRectElement>;
    withCrosshair?: boolean;
}

export const DrawingBox = ({
    onComplete,
    image,
    styles = {},
    zoom,
    withCrosshair = true,
}: DrawingBoxInterface): JSX.Element => {
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [boundingBox, setBoundingBox] = useState<RectInterface | null>(null);
    const [hasCrossHair, setHasCrossHair] = useState<boolean>(withCrosshair);
    const ref = useRef<SVGRectElement>(null);
    const clampPoint = clampPointBetweenImage(image);
    const crosshair = useCrosshair(ref, zoom);

    const onPointerMove = (event: PointerEvent<SVGSVGElement>): void => {
        crosshair.onPointerMove(event);

        if (ref.current === null) {
            return;
        }

        const button = {
            button: event.button,
            buttons: event.buttons,
        };

        if (event.pointerType === PointerType.Pen && isEraserButton(button)) {
            setHasCrossHair(false);

            return;
        } else {
            setHasCrossHair(withCrosshair);
        }

        if (startPoint === null || !event.currentTarget.hasPointerCapture(event.pointerId)) {
            return;
        }

        const endPoint = clampPoint(getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom));

        setBoundingBox({ shapeType: ShapeType.Rect, ...pointsToRect(startPoint, endPoint) });
    };

    const onPointerDown = (event: PointerEvent<SVGSVGElement>): void => {
        if (startPoint !== null || ref.current === null) {
            return;
        }

        const button = {
            button: event.button,
            buttons: event.buttons,
        };

        if (event.pointerType === PointerType.Touch || !isLeftButton(button)) {
            return;
        }

        const mouse = clampPoint(getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom));

        event.currentTarget.setPointerCapture(event.pointerId);

        setStartPoint(mouse);
        setBoundingBox({ shapeType: ShapeType.Rect, x: mouse.x, y: mouse.y, width: 0, height: 0 });
    };

    const onPointerUp = (event: PointerEvent<SVGSVGElement>): void => {
        if (event.pointerType === PointerType.Touch) {
            return;
        }

        if (boundingBox === null) {
            return;
        }

        // Don't make empty annotations
        if (boundingBox.width > 1 && boundingBox.height > 1) {
            onComplete([boundingBox]);
        }

        setCleanState();

        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const setCleanState = () => {
        setStartPoint(null);
        setBoundingBox(null);
    };

    useEventListener(KeyboardEvents.KeyDown, (event: KeyboardEvent) => {
        const { key } = event;

        if (key === KeyMap.Esc) setCleanState();
    });

    return (
        <SvgToolCanvas
            image={image}
            canvasRef={ref}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={crosshair.onPointerLeave}
            style={{
                cursor: withCrosshair ? `url(/icons/cursor/selection.svg) ${CURSOR_OFFSET}, auto` : 'default',
            }}
        >
            {boundingBox ? <Rectangle shape={boundingBox} styles={{ ...styles, role: 'application' }} /> : null}
            {hasCrossHair && <Crosshair location={crosshair.location} zoom={zoom} />}
        </SvgToolCanvas>
    );
};
