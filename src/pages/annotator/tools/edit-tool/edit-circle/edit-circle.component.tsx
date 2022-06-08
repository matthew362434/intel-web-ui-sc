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

import { Annotation, BoundingBox, getBoundingBox, Point, RegionOfInterest } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { Labels } from '../../../annotation/labels/labels.component';
import { AnnotationToolContext } from '../../../core';
import { useContainerBoundingBox } from '../../../hooks/use-container-bondingbox.hook';
import { isWithinRoi } from '../../utils';
import { ANCHOR_SIZE, ResizeAnchor } from '../resize-anchor.component';
import { ResizeAnchorType } from '../resize-anchor.enum';
import { TranslateShape } from '../translate-shape.component';
import classes from './../../../annotator-canvas.module.scss';

const STROKE_WIDTH = 2;
type Circle = { x: number; y: number; r: number };

interface EditCircleProps {
    annotationToolContext: AnnotationToolContext;
    annotation: Annotation & { shape: { shapeType: ShapeType.Circle } };
    disableTranslation?: boolean;
    disablePoints?: boolean;
}
const getPreferredAnchorPosition = (boundingBox: BoundingBox, roi: RegionOfInterest, oldAngle?: number): number => {
    const { x, y, width, height } = boundingBox;

    const isOutTop = y < 0;
    const isOutLeft = x < 0;
    const isOutRight = x + width > roi.width;
    const isOutBottom = y + height > roi.height;
    // By default we'll have the anchor point on the right side of the circle
    let newAngle = oldAngle ?? Math.PI;

    if (isOutRight || isOutBottom || isOutTop || isOutLeft) {
        if (isOutRight) {
            newAngle = Math.PI * 2;
        }
        if (isOutBottom) {
            newAngle = Math.PI / 2;
        }
        if (isOutTop) {
            newAngle = Math.PI / -2;
        }
        if (isOutLeft && isOutTop) {
            newAngle = Math.PI / -1.5;
        }
        if (isOutRight && isOutBottom) {
            newAngle = Math.PI / 3;
        }
        if (isOutLeft && isOutBottom) {
            newAngle = Math.PI / 1.5;
        }
        if (isOutRight && isOutTop) {
            newAngle = Math.PI / -3;
        }
    }

    return newAngle;
};

export const EditCircle = ({
    annotationToolContext,
    annotation,
    disablePoints = false,
    disableTranslation = false,
}: EditCircleProps): JSX.Element => {
    const [shape, setShape] = useState(annotation.shape);
    useEffect(() => setShape(annotation.shape), [annotation.shape]);
    const { zoomState, scene, image } = annotationToolContext;
    const roi = useContainerBoundingBox(image);
    const zoom = zoomState.zoom;

    const onComplete = () => {
        const boundingBox = getBoundingBox(shape);
        setAngle(getPreferredAnchorPosition(boundingBox, roi, angle));
        updateOrRemoveAnnotation();
    };

    const setConstrainedCircle = ({ x, y, r }: Circle) => {
        const constrainedRadius = Math.max((2 * ANCHOR_SIZE) / zoom, r);
        setShape({ ...shape, x, y, r: constrainedRadius });
    };

    const translate = (inTranslate: Point) => {
        const boundingBox = getBoundingBox(shape);
        setAngle(getPreferredAnchorPosition(boundingBox, roi));
        setShape({ ...shape, x: shape.x + inTranslate.x, y: shape.y + inTranslate.y });
    };

    const updateOrRemoveAnnotation = () => {
        if (isWithinRoi(roi, shape)) {
            scene.updateAnnotation({ ...annotation, shape });
        } else {
            scene.removeAnnotations([annotation]);
        }
    };

    const [angle, setAngle] = useState(getPreferredAnchorPosition(getBoundingBox(shape), roi));
    const anchorPoint = {
        x: shape.x - Math.cos(angle) * shape.r,
        y: shape.y - Math.sin(angle) * shape.r,
    };

    return (
        <>
            <svg
                id={`translate-circle-${annotation.id}`}
                className={classes.disabledLayer}
                width={image.width}
                height={image.height}
            >
                <TranslateShape
                    disabled={disableTranslation}
                    zoom={zoom}
                    annotation={{ ...annotation, shape }}
                    translateShape={translate}
                    onComplete={onComplete}
                />

                <line
                    x1={shape.x}
                    y1={shape.y}
                    x2={anchorPoint.x}
                    y2={anchorPoint.y}
                    stroke='var(--intel-blue)'
                    strokeWidth={STROKE_WIDTH / zoom}
                    strokeDasharray={ANCHOR_SIZE / zoom}
                />
            </svg>

            <Labels annotation={{ ...annotation, shape }} annotationToolContext={annotationToolContext} />

            {disablePoints === false ? (
                <svg
                    id={`edit-circle-points-${annotation.id}`}
                    className={classes.disabledLayer}
                    width={image.width}
                    height={image.height}
                >
                    <g style={{ pointerEvents: 'auto' }}>
                        <ResizeAnchor
                            zoom={zoom}
                            x={anchorPoint.x}
                            y={anchorPoint.y}
                            label='Resize circle anchor'
                            onComplete={onComplete}
                            moveAnchorTo={(x: number, y: number) => {
                                setConstrainedCircle({
                                    x: shape.x,
                                    y: shape.y,
                                    r: Math.sqrt(Math.pow(shape.x - x, 2) + Math.pow(shape.y - y, 2)),
                                });
                                setAngle(Math.atan2(shape.y - y, shape.x - x));
                            }}
                            type={ResizeAnchorType.CIRCLE}
                        />
                    </g>
                </svg>
            ) : (
                <></>
            )}
        </>
    );
};
