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

import { PointerEvent, useEffect, useRef } from 'react';

import throttle from 'lodash/throttle';
import { useMutation } from 'react-query';

import { Point, Polygon } from '../../../core/annotations';
import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { getImageData, runWhen } from '../../../shared/utils';
import { usePolygonState } from '../tools/polygon-tool/polygon-state-provider.component';
import { PolygonMode } from '../tools/polygon-tool/polygon-tool.enum';
import {
    IntelligentScissorsMethods,
    IntelligentScissorsWorker,
    MouseEventHandlers,
} from '../tools/polygon-tool/polygon-tool.interface';
import { isEqualPoint, leftRightMouseButtonHandler } from '../tools/polygon-tool/util';
import { SetStateWrapper } from '../tools/undo-redo/use-undo-redo-state';

export interface IntelligentScissorsProps {
    zoom: number;
    polygon: Polygon | null;
    image: HTMLImageElement;
    lassoSegment: Point[];
    worker: IntelligentScissorsWorker;
    canPathBeClosed: (point: Point) => boolean;
    setPointerLine: SetStateWrapper<Point[]>;
    setLassoSegment: SetStateWrapper<Point[]>;
    complete: (resetMode: PolygonMode | null) => void;
    setPointFromEvent: (callback: (point: Point) => void) => (event: PointerEvent<SVGSVGElement>) => void;
}

export const useIntelligentScissors = ({
    image,
    complete,
    lassoSegment,
    setPointerLine,
    setLassoSegment,
    canPathBeClosed,
    setPointFromEvent,
    worker,
}: IntelligentScissorsProps): MouseEventHandlers => {
    const isMounted = useRef(true);
    const isLoading = useRef<boolean>(false);
    const isPointerDown = useRef<boolean>(false);
    const isFreeDrawing = useRef<boolean>(false);
    const buildMapPoint = useRef<Point | null>(null);
    const intelligentScissors = useRef<IntelligentScissorsMethods | null>(null);

    const { addNotification } = useNotification();

    const { segments, setSegments, mode, setMode, setIsIntelligentScissorsLoaded } = usePolygonState();

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            intelligentScissors.current?.cleanImg();
        };
    }, [worker]);

    useEffect(() => {
        if (isMounted.current && image.src && worker) {
            setIsIntelligentScissorsLoaded(false);
            loadIntelligentScissors().then(() => setIsIntelligentScissorsLoaded(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image.src, worker]);

    useEffect(() => {
        updateBuildMapAfterUndoRedo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, segments]);

    const loadIntelligentScissors = async (): Promise<void> => {
        await worker.isModuleLoaded('segmentation_IntelligentScissorsMB');
        intelligentScissors.current = await new worker.IntelligentScissors(getImageData(image));
    };

    const updateBuildMapAfterUndoRedo = (): void => {
        if (mode !== PolygonMode.MagneticLasso || isPointerDown.current) return;

        if (segments.length < 1) {
            isLoading.current = false;
            intelligentScissors.current?.cleanPoints();
            return;
        }

        const lastSegment = segments[segments.length - 1];
        const lastPoint = lastSegment && lastSegment[lastSegment.length - 1];
        const currentBuildMapPoint = buildMapPoint.current ?? { x: NaN, y: NaN };
        if (lastPoint && !isEqualPoint(currentBuildMapPoint, lastPoint)) {
            intelligentScissors.current?.buildMap(lastPoint);
        }
    };

    const onPointerDown = leftRightMouseButtonHandler(
        setPointFromEvent((point: Point): void => {
            if (isLoading.current) {
                return;
            }
            isPointerDown.current = true;
            const hasNotBuildMapOrIsDifferent = () =>
                !buildMapPoint.current || !isEqualPoint(buildMapPoint.current, point);
            setBuildMapAndSegment(hasNotBuildMapOrIsDifferent)(point);
        }),
        () => {
            setMode(PolygonMode.Eraser);
            isLoading.current = false;
            buildMapPoint.current = null;
            intelligentScissors.current?.cleanPoints();
        }
    );

    const onPointerMove = throttle(
        setPointFromEvent((point: Point): void => {
            if (!segments.length) return;

            if (!isPointerDown.current) {
                return mutation.mutate(point);
            }
            isFreeDrawing.current = true;
            buildMapPoint.current = null;
            isLoading.current = false;
            intelligentScissors.current?.cleanPoints();

            setLassoSegment((newLassoSegment: Point[]) => [...newLassoSegment, point]);
            setPointerLine(() => [...segments.flat(), ...lassoSegment]);
        }),
        250
    );

    const onPointerUp = setPointFromEvent((point: Point): void => {
        const canBeClosed = canPathBeClosed(point);
        const isFreeDrawingAndPathCannotBeClosed = () => isFreeDrawing.current && !canBeClosed;

        setBuildMapAndSegment(isFreeDrawingAndPathCannotBeClosed)(point);

        if (canBeClosed) {
            complete(PolygonMode.MagneticLasso);
            isLoading.current = false;
            intelligentScissors.current?.cleanPoints();
        }

        isPointerDown.current = false;
        isFreeDrawing.current = false;
    });

    const mutation = useMutation(async (point: Point) => intelligentScissors.current?.calcPoints(point), {
        onError: (): void => {
            addNotification(
                'Failed to select the shape boundaries, could you please try again?',
                NOTIFICATION_TYPE.ERROR
            );
        },
        onSuccess: (newPoints): void => {
            if (isMounted.current && newPoints?.length) {
                setLassoSegment(newPoints);
                setPointerLine(() => [...segments.flat(), ...lassoSegment]);
            }
        },
        onSettled: () => {
            isLoading.current = false;
        },
    });

    const setBuildMapAndSegment = (predicate: (point: Point) => boolean) =>
        runWhen(predicate)(async (point: Point) => {
            setLassoSegment([]);
            setSegments(addFirstPointOrNewOne(point));
            isLoading.current = true;
            buildMapPoint.current = point;
            intelligentScissors.current?.buildMap(point);
        });

    const addFirstPointOrNewOne = (point: Point): ((prevSegments: Point[][]) => Point[][]) | Point[][] => {
        const hasFirstPoint = segments.length && segments[segments.length - 1].length;
        return hasFirstPoint ? (prevSegments: Point[][]) => [...prevSegments, lassoSegment] : [[point]];
    };

    return { onPointerDown, onPointerUp, onPointerMove };
};
