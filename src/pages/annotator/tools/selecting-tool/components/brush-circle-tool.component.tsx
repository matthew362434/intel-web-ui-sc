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

import { useMemo, useRef, useState } from 'react';

import { Point, Circle as CircleInterface, RegionOfInterest } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { runWhen } from '../../../../../shared/utils';
import { Circle } from '../../../annotation';
import { pointsToCircle } from '../../circle-tool/utils';
import { SvgToolCanvas } from '../../svg-tool-canvas.component';
import { drawingStyles, SELECT_ANNOTATION_STYLES } from '../../utils';
import { CURSOR_OFFSET, MINUS_OFFSET } from '../../watershed-tool/utils';
import { calcRelativePoint } from '../utils';

interface BrushCircleToolProps {
    zoom: number;
    brushSize: number;
    isPointerDown: boolean;
    isInsidePolygon: boolean;
    image: HTMLImageElement;
    showCirclePreview: boolean;
    container: RegionOfInterest;
}

export const BrushCircleTool = ({
    zoom,
    image,
    container,
    brushSize,
    showCirclePreview,
    isPointerDown = false,
    isInsidePolygon = false,
}: BrushCircleToolProps): JSX.Element => {
    const ref = useRef<SVGRectElement>(null);
    const [circle, setCircle] = useState<CircleInterface | null>(null);
    const [isActive, setIsActive] = useState(false);

    const circlePreview = useMemo((): CircleInterface => {
        return {
            shapeType: ShapeType.Circle,
            x: container.x + container.width / 2,
            y: container.y + container.height / 2,
            r: brushSize,
        };
    }, [container, brushSize]);

    const relativePoint = calcRelativePoint(zoom, ref);

    const onCircleMove = relativePoint((point: Point): void => setCircle(pointsToCircle(point, point, brushSize)));

    const onPointerDown = runWhen(() => Boolean(circle))(() => {
        setIsActive(true);
    });

    const onPointerUp = runWhen(() => isActive)(() => {
        setIsActive(false);
    });

    const getCursor = (): { cursor: string } => {
        if (isPointerDown) {
            return isInsidePolygon
                ? { cursor: `url(/icons/cursor/plus.svg) ${MINUS_OFFSET}, auto` }
                : { cursor: `url(/icons/cursor/minus.svg) ${MINUS_OFFSET}, auto` };
        }
        return { cursor: `url(/icons/cursor/circle.svg) ${CURSOR_OFFSET}, auto` };
    };

    return (
        <SvgToolCanvas
            canvasRef={ref}
            image={image}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onCircleMove}
            onMouseLeave={() => {
                setCircle(null);
                onPointerUp();
            }}
            style={getCursor()}
        >
            {circle && <Circle shape={circle} styles={isActive ? SELECT_ANNOTATION_STYLES : drawingStyles(null)} />}
            {showCirclePreview && <Circle shape={circlePreview} styles={drawingStyles(null)} />}
        </SvgToolCanvas>
    );
};
