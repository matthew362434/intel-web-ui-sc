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

import { PointerEvent, useCallback, useRef, useState } from 'react';

import { Circle as CircleInterface, Point } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { useEventListener } from '../../../../hooks/event-listener/event-listener.hook';
import { KeyboardEvents, KeyMap } from '../../../../shared/keyboard-events';
import { Circle } from '../../annotation';
import { ToolSettings, ToolType } from '../../core';
import { isLeftButton, isRightButton, isEraserButton } from '../buttons-utils';
import { SvgToolCanvas } from '../svg-tool-canvas.component';
import { PointerType, ToolAnnotationContextProps } from '../tools.interface';
import { drawingStyles, EDIT_SIZE_ANNOTATION_STYLES, getRelativePoint } from '../utils';
import { Mode, pointsToCircle } from './utils';

const MIN_RADIUS = 2;

export const CircleTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { scene, zoomState, getToolSettings, updateToolSettings, image, defaultLabel } = annotationToolContext;
    const onComplete = scene.addShapes;

    const { size: defaultRadius } = getToolSettings(ToolType.CircleTool) as ToolSettings[ToolType.CircleTool];

    const ref = useRef<SVGRectElement>(null);
    const { zoom } = zoomState;

    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [circle, setCircle] = useState<CircleInterface | null>(null);
    const [mode, setMode] = useState<Mode>(Mode.NORMAL);

    const onPointerMove = useCallback(
        (event: PointerEvent<SVGSVGElement>): void => {
            if (ref.current === null) {
                return;
            }

            const button = {
                button: event.button,
                buttons: event.buttons,
            };

            if (event.pointerType === PointerType.Pen && isEraserButton(button)) {
                setCleanState();

                return;
            }

            const mousePoint = getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom);

            if (startPoint === null) {
                setCircle({ x: mousePoint.x, y: mousePoint.y, r: defaultRadius, shapeType: ShapeType.Circle });
            } else {
                const newCircle = pointsToCircle(startPoint, mousePoint, MIN_RADIUS);

                setCircle(newCircle);
            }
        },
        [startPoint, zoom, defaultRadius]
    );

    const onPointerDown = useCallback(
        (event: PointerEvent<SVGSVGElement>): void => {
            if (startPoint !== null || ref.current === null) {
                return;
            }

            const button = {
                button: event.button,
                buttons: event.buttons,
            };

            if (event.pointerType === PointerType.Touch || (!isLeftButton(button) && !isRightButton(button))) {
                return;
            }

            if (isRightButton(button)) {
                setMode(Mode.EDIT_RADIUS);
            }

            event.currentTarget.setPointerCapture(event.pointerId);

            const mouse = getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom);

            setStartPoint(mouse);
            setCircle({ x: mouse.x, y: mouse.y, r: defaultRadius, shapeType: ShapeType.Circle });
        },
        [startPoint, zoom, defaultRadius]
    );

    const onPointerUp = useCallback(
        (event: PointerEvent<SVGSVGElement>): void => {
            if (event.pointerType === PointerType.Touch) {
                return;
            }

            if (circle === null) {
                return;
            }

            // Don't make empty annotations
            if (circle.r > 1 && startPoint !== null) {
                onComplete([{ ...circle }]);

                if (mode === Mode.EDIT_RADIUS) {
                    updateToolSettings(ToolType.CircleTool, { size: circle.r });
                    setMode(Mode.NORMAL);
                }
            }

            setCleanState();

            event.currentTarget.releasePointerCapture(event.pointerId);
        },
        [circle, mode, onComplete, updateToolSettings, startPoint]
    );

    const setCleanState = () => {
        setStartPoint(null);
        setCircle(null);
        setMode(Mode.NORMAL);
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
            onPointerLeave={onPointerMove}
        >
            {circle ? (
                <Circle
                    shape={circle}
                    styles={mode === Mode.EDIT_RADIUS ? EDIT_SIZE_ANNOTATION_STYLES : drawingStyles(defaultLabel)}
                />
            ) : null}
        </SvgToolCanvas>
    );
};
