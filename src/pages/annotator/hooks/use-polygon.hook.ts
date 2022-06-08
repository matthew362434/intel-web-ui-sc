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

import { PointerEvent, useCallback, useEffect, useRef } from 'react';

import { getIntersectionPoint, Point, Polygon } from '../../../core/annotations';
import { usePolygonState } from '../tools/polygon-tool/polygon-state-provider.component';
import { PolygonMode } from '../tools/polygon-tool/polygon-tool.enum';
import { MouseEventHandlers } from '../tools/polygon-tool/polygon-tool.interface';
import {
    deleteSegments,
    ERASER_FIELD_DEFAULT_RADIUS,
    leftRightMouseButtonHandler,
    removeEmptySegments,
} from '../tools/polygon-tool/util';
import { SetStateWrapper } from '../tools/undo-redo/use-undo-redo-state';

interface UsePolygonProps {
    zoom: number;
    polygon: Polygon | null;
    lassoSegment: Point[];
    canPathBeClosed: (point: Point) => boolean;
    setPointerLine: SetStateWrapper<Point[]>;
    setLassoSegment: SetStateWrapper<Point[]>;
    complete: (resetMode: PolygonMode | null) => void;
    setPointFromEvent: (callback: (point: Point) => void) => (event: PointerEvent<SVGSVGElement>) => void;
}

export const usePolygon = ({
    zoom,
    polygon,
    complete,
    lassoSegment,
    setPointerLine,
    canPathBeClosed,
    setLassoSegment,
    setPointFromEvent,
}: UsePolygonProps): MouseEventHandlers => {
    const { segments, setSegments, mode, setMode } = usePolygonState();
    const prevMode = useRef<PolygonMode | null>(null);
    const isPointerDown = useRef<boolean>(false);

    useEffect(() => {
        if (mode !== PolygonMode.Eraser && mode !== PolygonMode.Lasso) {
            prevMode.current = mode;
        }
    }, [mode]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onPointerDown = useCallback(
        leftRightMouseButtonHandler(
            setPointFromEvent((point: Point) => {
                setMode(PolygonMode.Polygon);
                isPointerDown.current = true;

                if (canPathBeClosed(point)) {
                    complete(null);
                    isPointerDown.current = false;
                    return;
                }

                setSegments(removeEmptySegments(lassoSegment, [point]));
                setLassoSegment([]);
            }),
            () => setMode(PolygonMode.Eraser)
        ),
        [complete, setSegments, setMode, setLassoSegment]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onPointerUp = useCallback(
        setPointFromEvent((point: Point): void => {
            if (mode === PolygonMode.Lasso && polygon) {
                setSegments(removeEmptySegments(lassoSegment));
                setLassoSegment([]);

                if (canPathBeClosed(point)) {
                    complete(null);
                }
            }

            setMode(prevMode.current);
            isPointerDown.current = false;
        }),
        [lassoSegment, mode, polygon]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onPointerMove = useCallback(
        setPointFromEvent((newPoint: Point) => {
            if (!segments?.length) return;

            if (mode === PolygonMode.Polygon && isPointerDown.current) setMode(PolygonMode.Lasso);

            if (mode === PolygonMode.Lasso) {
                setLassoSegment((newLassoSegment: Point[]) => [...newLassoSegment, newPoint]);
            }

            if (mode === PolygonMode.Eraser) {
                const intersectionPoint = getIntersectionPoint(
                    Math.ceil(ERASER_FIELD_DEFAULT_RADIUS / zoom),
                    newPoint,
                    segments.flat()
                );

                if (!intersectionPoint) return;
                setLassoSegment([]);
                setSegments(deleteSegments(intersectionPoint));
            }

            if (mode !== PolygonMode.Eraser) {
                setPointerLine(() => [...segments.flat(), ...lassoSegment, newPoint]);
            }
        }),
        [lassoSegment, mode, segments, zoom, setSegments, setMode]
    );

    return { onPointerDown, onPointerUp, onPointerMove };
};
