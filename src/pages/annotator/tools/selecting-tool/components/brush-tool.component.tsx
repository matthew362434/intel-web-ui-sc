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

import { useRef, useState } from 'react';

import flow from 'lodash/flow';

import { Point, Polygon, Annotation, getTheTopShapeAt } from '../../../../../core/annotations';
import { runWhen } from '../../../../../shared/utils';
import { useContainerBoundingBox } from '../../../hooks/use-container-bondingbox.hook';
import { getOutputFromTask } from '../../../providers/task-chain-provider/utils';
import { pointsToCircle } from '../../circle-tool/utils';
import { PolygonDraw } from '../../polygon-draw.component';
import { SvgToolCanvas } from '../../svg-tool-canvas.component';
import { drawingStyles, getShapesDifference, getShapesUnion, isPolygonValid, removeOffLimitPoints } from '../../utils';
import classes from '../selecting-tool.module.scss';
import { BrushToolProps, GhostPolygon } from '../selecting.interface';
import { calcRelativePoint, getSelectedPolygonAnnotations } from '../utils';
import { BrushCircleTool } from './brush-circle-tool.component';

const getGhostPolygon = (polygon: GhostPolygon | null, annotation: Annotation): GhostPolygon => {
    if (!polygon?.shape) {
        return { shape: annotation?.shape as Polygon, annotationId: annotation?.id };
    }
    if (polygon && polygon.annotationId === annotation?.id) {
        return { ...polygon };
    }
    return { shape: annotation?.shape as Polygon, annotationId: annotation?.id };
};

export const BrushTool = ({ annotationToolContext, brushSize, showCirclePreview }: BrushToolProps): JSX.Element => {
    const {
        image,
        scene,
        zoomState: { zoom },
    } = annotationToolContext;

    const ref = useRef<SVGRectElement>(null);
    const roi = useContainerBoundingBox(image);
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [isInsidePolygon, setIsInsidePolygon] = useState(false);
    const [ghostPolygon, setGhostPolygon] = useState<GhostPolygon | null>(null);

    const [selectedPolygonAnnotation] = getSelectedPolygonAnnotations(
        getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask) as Annotation[]
    );

    const relativePoint = calcRelativePoint(zoom, ref);

    const onPointerDown = runWhen(() => Boolean(selectedPolygonAnnotation?.id))(
        relativePoint((point: Point) => {
            const annotation = getTheTopShapeAt([selectedPolygonAnnotation], point);
            setIsInsidePolygon(selectedPolygonAnnotation?.id === annotation?.id);
            setIsPointerDown(true);
        })
    );

    const updateGhostPolygon = relativePoint((point: Point): Annotation => {
        const circleShape = pointsToCircle(point, point, brushSize);
        const shapeHandler = isInsidePolygon ? getShapesUnion : getShapesDifference;
        const newGhostPolygon = getGhostPolygon(ghostPolygon, selectedPolygonAnnotation);
        const solutionShape = shapeHandler(roi, newGhostPolygon.shape, circleShape);
        setGhostPolygon({ shape: solutionShape, annotationId: newGhostPolygon.annotationId });
        return selectedPolygonAnnotation;
    });

    const hideAnnotation = runWhen((annotation: Annotation) => !annotation?.isHidden)((annotation): void => {
        // include the annotations outside the current task or them will be removed
        const visibleAnnotations = annotationToolContext.scene.annotations.filter(({ id }) => id !== annotation.id);
        //we use replaceAnnotations because it's necessary skip the visible on/off change in the redo/undo history
        scene.replaceAnnotations([...visibleAnnotations, { ...annotation, isHidden: true }], true);
    });

    const onPointerMove = runWhen(() => isPointerDown)(flow([updateGhostPolygon, hideAnnotation]));

    const updateOrRemoveAnnotation = (annotation: Annotation, newShape: Polygon) => {
        if (isPolygonValid(newShape)) {
            const shape = removeOffLimitPoints(newShape, roi);
            scene.updateAnnotation({
                ...annotation,
                shape,
                isHidden: false,
            });
        } else {
            scene.removeAnnotations([annotation]);
        }
    };

    const onPointerUp = async () => {
        if (ghostPolygon) {
            updateOrRemoveAnnotation(selectedPolygonAnnotation, ghostPolygon.shape);
            setGhostPolygon(null);
        }

        setIsPointerDown(false);
    };

    return (
        <SvgToolCanvas
            canvasRef={ref}
            image={image}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onMouseLeave={onPointerUp}
        >
            {ghostPolygon?.shape?.points?.length && (
                <PolygonDraw
                    ariaLabel='ghostPolygon'
                    className={classes.ghostPolygon}
                    shape={ghostPolygon.shape}
                    styles={drawingStyles(null)}
                />
            )}
            <BrushCircleTool
                image={image}
                zoom={zoom}
                brushSize={brushSize}
                container={roi}
                isPointerDown={isPointerDown}
                isInsidePolygon={isInsidePolygon}
                showCirclePreview={showCirclePreview}
            />
        </SvgToolCanvas>
    );
};
