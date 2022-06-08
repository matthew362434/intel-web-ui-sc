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

import { useEffect, useState } from 'react';

import { Annotation, Polygon } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { Labels } from '../../../annotation/labels/labels.component';
import { AnnotationScene, AnnotationToolContext, ToolSettings, ToolType } from '../../../core';
import { useContainerBoundingBox } from '../../../hooks/use-container-bondingbox.hook';
import { isPolygonValid, removeOffLimitPoints } from '../../utils';
import { TranslateShape } from '../translate-shape.component';
import classes from './../../../annotator-canvas.module.scss';
import { EditPoints } from './edit-points.component';

interface EditPolygonProps {
    annotationToolContext: AnnotationToolContext;
    annotation: Annotation & { shape: { shapeType: ShapeType.Polygon } };
    disableTranslation?: boolean;
    disablePoints?: boolean;
}

const updateOrRemovePolygonAnnotation = (annotation: Annotation, scene: AnnotationScene): void => {
    if (isPolygonValid(annotation.shape as Polygon)) {
        scene.updateAnnotation({ ...annotation });
    } else {
        scene.removeAnnotations([annotation]);
    }
};

export const EditPolygon = ({
    annotationToolContext,
    annotation,
    disablePoints = false,
    disableTranslation = false,
}: EditPolygonProps): JSX.Element => {
    const [shape, setShape] = useState(annotation.shape);
    useEffect(() => setShape(annotation.shape), [annotation.shape]);

    const { zoomState, image, scene, tool, getToolSettings } = annotationToolContext;
    const roi = useContainerBoundingBox(image);
    const onComplete = (newShape: Polygon) => {
        updateOrRemovePolygonAnnotation({ ...annotation, shape: removeOffLimitPoints(newShape, roi) }, scene);
    };
    const zoom = zoomState.zoom;
    const toolSettings = getToolSettings(ToolType.SelectTool) as ToolSettings[ToolType.SelectTool];
    const isBrushSubTool = tool === ToolType.SelectTool && toolSettings?.isBrushSubTool;

    const translate = (inTranslate: { x: number; y: number }) => {
        setShape({
            ...shape,
            points: shape.points.map(({ x, y }) => ({
                x: x + inTranslate.x,
                y: y + inTranslate.y,
            })),
        });
    };

    const moveAnchorTo = (idx: number, x: number, y: number) => {
        setShape((polygon) => ({
            ...shape,
            points: polygon.points.map((oldPoint, oldIdx) => {
                return idx === oldIdx ? { x, y } : oldPoint;
            }),
        }));
    };

    const addPoint = (idx: number, x: number, y: number) => {
        setShape((polygon) => {
            const pointsBefore = [...polygon.points].splice(0, idx);
            const pointsAfter = [...polygon.points].splice(idx, polygon.points.length);

            return {
                ...polygon,
                points: [...pointsBefore, { x, y }, ...pointsAfter],
            };
        });
    };

    const removePoints = (indexes: number[]): void => {
        const points = shape.points.filter((_, pointIdx) => !indexes.includes(pointIdx));
        setShape({ ...shape, points });

        if (points.length <= 2) {
            scene.removeAnnotations([annotation]);
        } else {
            onComplete({ ...shape, points });
        }
    };

    return (
        <>
            <svg
                id={`translate-polygon-${annotation.id}`}
                className={classes.disabledLayer}
                width={image.width}
                height={image.height}
            >
                <TranslateShape
                    zoom={zoom}
                    translateShape={translate}
                    annotation={{ ...annotation, shape }}
                    onComplete={() => onComplete(shape)}
                    disabled={disableTranslation || isBrushSubTool}
                />
            </svg>

            {shape.points.length > 0 && !isBrushSubTool && (
                <Labels annotation={{ ...annotation, shape }} annotationToolContext={annotationToolContext} />
            )}

            {disablePoints === false && !isBrushSubTool ? (
                <svg
                    id={`edit-polygon-points-${annotation.id}`}
                    className={classes.disabledLayer}
                    width={image.width}
                    height={image.height}
                >
                    <g style={{ pointerEvents: 'auto' }}>
                        <EditPoints
                            shape={shape}
                            addPoint={addPoint}
                            removePoints={removePoints}
                            onComplete={() => onComplete(shape)}
                            moveAnchorTo={moveAnchorTo}
                            roi={roi}
                            zoom={zoom}
                        />
                    </g>
                </svg>
            ) : (
                <></>
            )}
        </>
    );
};
