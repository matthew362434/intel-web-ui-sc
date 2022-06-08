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

import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

import differenceWith from 'lodash/differenceWith';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { clampPointBetweenImage, isPointOverPoint, Point, Polygon } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { useEventListener } from '../../../../hooks';
import { AlgorithmType, useWorker } from '../../../../hooks/use-worker/use-worker.hook';
import { KeyboardEvents, KeyMap } from '../../../../shared/keyboard-events';
import { useContainerBoundingBox } from '../../hooks/use-container-bondingbox.hook';
import { useIntelligentScissors } from '../../hooks/use-intelligent-scissors.hook';
import { usePolygon } from '../../hooks/use-polygon.hook';
import { PolygonDraw } from '../polygon-draw.component';
import { SvgToolCanvas } from '../svg-tool-canvas.component';
import { ToolAnnotationContextProps } from '../tools.interface';
import { drawingStyles, getRelativePoint, isPolygonValid, removeOffLimitPoints } from '../utils';
import { usePolygonState } from './polygon-state-provider.component';
import { PointerIcons, PointerIconsOffset, PolygonMode } from './polygon-tool.enum';
import { IntelligentScissorsWorker, MouseEventHandlers } from './polygon-tool.interface';
import classes from './polygon-tool.module.scss';
import { START_POINT_FIELD_DEFAULT_RADIUS } from './util';

export const PolygonTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const ref = useRef<SVGRectElement>({} as SVGRectElement);
    const { scene, image, zoomState, defaultLabel } = annotationToolContext;
    const { zoom } = zoomState;
    const isClosing = useRef(false);
    const onComplete = scene.addShapes;
    const roi = useContainerBoundingBox(image);
    const [isOptimizingPolygons, setIsOptimizingPolygons] = useState(false);
    const { segments, undoRedoActions, mode, setMode } = usePolygonState();
    const { worker } = useWorker(AlgorithmType.INTELLIGENT_SCISSORS) as { worker: IntelligentScissorsWorker };

    const [polygon, setPolygon] = useState<Polygon | null>(null);
    const [pointerLine, setPointerLine] = useState<Point[]>([]);
    const [lassoSegment, setLassoSegment] = useState<Point[]>([]);

    const [toolIcon, setToolIcon] = useState<{ icon: PointerIcons | string; offset: PointerIconsOffset | null }>({
        icon: PointerIcons.Polygon,
        offset: PointerIconsOffset.Polygon,
    });

    const reset = useCallback(
        (resetMode: PolygonMode | null): void => {
            setMode(resetMode);

            undoRedoActions.reset();

            setPointerLine([]);
            setLassoSegment([]);
            setPolygon(null);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [undoRedoActions.reset]
    );

    useEffect(() => {
        if (mode) {
            reset(null);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image, reset]);

    useEventListener(KeyboardEvents.KeyDown, (event: KeyboardEvent) => {
        const { key } = event;

        if (key === KeyMap.Esc) reset(null);
    });

    const getPointerRelativePosition = useCallback(
        (event: PointerEvent<SVGSVGElement>): Point => {
            const clampPoint = clampPointBetweenImage(image);

            return clampPoint(getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom));
        },
        [image, zoom]
    );

    const optimizePolygonOrSegments = (iPolygon: Polygon): Promise<Polygon> => {
        if (mode === PolygonMode.MagneticLasso) {
            return worker.optimizePolygon(iPolygon);
        }

        const lastSegment = differenceWith(iPolygon.points, segments.flat(), isEqual);
        const newSegments = isEmpty(lastSegment) ? [...segments] : [...segments, lastSegment];

        return worker.optimizeSegments(newSegments);
    };

    const complete = useCallback(
        async (resetMode: PolygonMode | null) => {
            if (!polygon || isClosing.current) return;
            isClosing.current = true;
            polygon.points.pop();

            if (isPolygonValid(polygon)) {
                setIsOptimizingPolygons(true);

                const optimizedPolygon = await optimizePolygonOrSegments(polygon);

                onComplete([removeOffLimitPoints(optimizedPolygon, roi)]);
                setIsOptimizingPolygons(false);
            }
            reset(resetMode);
            isClosing.current = false;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roi, onComplete, polygon, reset, mode]
    );

    useEffect((): void => setPolygon({ shapeType: ShapeType.Polygon, points: segments?.flat() }), [segments]);

    useEffect((): void => setPolygon({ shapeType: ShapeType.Polygon, points: pointerLine }), [pointerLine]);

    const setPointFromEvent = (callback: (point: Point) => void) => (event: PointerEvent<SVGSVGElement>) =>
        callback(getPointerRelativePosition(event));

    const canPathBeClosed = (point: Point): boolean => {
        const flatSegments = segments.flat();

        if (isEmpty(flatSegments)) return false;

        return (
            Boolean(polygon) &&
            isPolygonValid(polygon) &&
            isPointOverPoint(flatSegments[0], point, Math.ceil(START_POINT_FIELD_DEFAULT_RADIUS / zoom))
        );
    };

    const magneticLassoHandlers = useIntelligentScissors({
        zoom,
        image,
        worker,
        polygon,
        complete,
        lassoSegment,
        setPointerLine,
        setLassoSegment,
        canPathBeClosed,
        setPointFromEvent,
    });

    const polygonHandlers = usePolygon({
        zoom,
        polygon,
        complete,
        lassoSegment,
        setPointerLine,
        setLassoSegment,
        canPathBeClosed,
        setPointFromEvent,
    });

    useEffect(() => {
        switch (mode) {
            case PolygonMode.Lasso:
                setToolIcon({ icon: PointerIcons.Lasso, offset: PointerIconsOffset.Lasso });
                break;
            case PolygonMode.Eraser:
                setToolIcon({ icon: PointerIcons.Eraser, offset: PointerIconsOffset.Eraser });
                break;
            case PolygonMode.MagneticLasso:
                setToolIcon({ icon: PointerIcons.MagneticLasso, offset: PointerIconsOffset.MagneticLasso });
                break;
            default:
                setToolIcon({ icon: PointerIcons.Polygon, offset: PointerIconsOffset.Polygon });
        }
    }, [mode, segments]);

    const eventHandlers = (() => {
        let handlers: MouseEventHandlers = polygonHandlers;

        if (mode === PolygonMode.MagneticLasso) {
            handlers = magneticLassoHandlers;
        }

        return handlers;
    })();

    return (
        <SvgToolCanvas
            image={image}
            canvasRef={ref}
            onPointerUp={eventHandlers.onPointerUp}
            onPointerDown={eventHandlers.onPointerDown}
            onPointerMove={eventHandlers.onPointerMove}
            onPointerLeave={eventHandlers.onPointerMove}
            style={{ cursor: `url(/icons/cursor/${toolIcon.icon}.png) ${toolIcon.offset}, auto` }}
        >
            {polygon?.points?.length && (
                <PolygonDraw
                    shape={polygon}
                    styles={drawingStyles(defaultLabel)}
                    className={isOptimizingPolygons ? classes.inputTool : ''}
                    indicatorRadius={Math.ceil(10 / zoomState.zoom)}
                />
            )}
        </SvgToolCanvas>
    );
};
