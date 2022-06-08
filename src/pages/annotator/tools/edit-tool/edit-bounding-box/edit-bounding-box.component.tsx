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

import { Annotation, clampBetween, roiFromImage, Shape } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { Labels } from '../../../annotation/labels/labels.component';
import { AnnotationToolContext } from '../../../core';
import { ANCHOR_SIZE, ResizeAnchor } from '../resize-anchor.component';
import { TranslateShape } from '../translate-shape.component';
import classes from './../../../annotator-canvas.module.scss';

interface EditBoundingBoxProps {
    annotationToolContext: AnnotationToolContext;
    annotation: Annotation & { shape: { shapeType: ShapeType.Rect } };
    disableTranslation?: boolean;
    disablePoints?: boolean;
}

export const EditBoundingBox = ({
    annotationToolContext,
    annotation,
    disablePoints = false,
    disableTranslation = false,
}: EditBoundingBoxProps): JSX.Element => {
    const [shape, setShape] = useState(annotation.shape);

    useEffect(() => setShape(annotation.shape), [annotation.shape]);

    const { zoomState, scene } = annotationToolContext;
    const zoom = zoomState.zoom;
    const roi = roiFromImage(annotationToolContext.image);

    const onComplete = () => {
        scene.updateAnnotation({ ...annotation, shape });
    };

    const translate = (point: { x: number; y: number }) => {
        const clampedTranslate = {
            x: clampBetween(shape.width + shape.x - roi.width, -point.x, shape.x),
            y: clampBetween(shape.height + shape.y - roi.height, -point.y, shape.y),
        };

        setShape({ ...shape, x: shape.x - clampedTranslate.x, y: shape.y - clampedTranslate.y });
    };

    const setShapeInCanvas = (newShape: Shape & { shapeType: ShapeType.Rect }) => {
        const x = Math.max(0, newShape.x);
        const y = Math.max(0, newShape.y);

        setShape({
            ...shape,
            x,
            y,
            width: Math.min(roi.width - x, newShape.width),
            height: Math.min(roi.height - y, newShape.height),
        });
    };

    // Keep a gap between anchor points so that they don't overlap
    const gap = (2 * ANCHOR_SIZE) / zoom;
    const anchorPoints = [
        {
            x: shape.x,
            y: shape.y,
            moveAnchorTo: (x: number, y: number) => {
                const x1 = Math.max(0, Math.min(x, shape.x + shape.width - gap));
                const y1 = Math.max(0, Math.min(y, shape.y + shape.height - gap));
                setShapeInCanvas({
                    ...shape,
                    x: x1,
                    width: Math.max(gap, shape.width + shape.x - x1),

                    y: y1,
                    height: Math.max(gap, shape.height + shape.y - y1),
                });
            },
            cursor: 'nw-resize',
            label: 'North west resize anchor',
        },
        {
            x: shape.x + shape.width / 2,
            y: shape.y,
            moveAnchorTo: (x: number, y: number) => {
                const y1 = Math.max(0, Math.min(y, shape.y + shape.height - gap));
                setShapeInCanvas({
                    ...shape,
                    x: shape.x,
                    width: shape.width,

                    y: y1,
                    height: Math.max(gap, shape.height + shape.y - y1),
                });
            },
            cursor: 'n-resize',
            label: 'North resize anchor',
        },
        {
            x: shape.x + shape.width,
            y: shape.y,
            moveAnchorTo: (x: number, y: number) => {
                const y1 = Math.max(0, Math.min(y, shape.y + shape.height - gap));
                setShapeInCanvas({
                    ...shape,
                    x: shape.x,
                    width: Math.max(gap, x - shape.x),

                    y: y1,
                    height: Math.max(gap, shape.height + shape.y - y1),
                });
            },
            cursor: 'ne-resize',
            label: 'North east resize anchor',
        },
        {
            x: shape.x + shape.width,
            y: shape.y + shape.height / 2,
            moveAnchorTo: (x: number, _y: number) => {
                setShapeInCanvas({
                    ...shape,
                    x: shape.x,
                    width: Math.max(gap, x - shape.x),

                    y: shape.y,
                    height: shape.height,
                });
            },
            cursor: 'e-resize',
            label: 'East resize anchor',
        },
        {
            x: shape.x + shape.width,
            y: shape.y + shape.height,
            moveAnchorTo: (x: number, y: number) => {
                setShapeInCanvas({
                    ...shape,
                    x: shape.x,
                    width: Math.max(gap, x - shape.x),

                    y: shape.y,
                    height: Math.max(gap, y - shape.y),
                });
            },
            cursor: 'se-resize',
            label: 'South east resize anchor',
        },
        {
            x: shape.x + shape.width / 2,
            y: shape.y + shape.height,
            moveAnchorTo: (x: number, y: number) => {
                setShapeInCanvas({
                    ...shape,
                    x: shape.x,
                    width: shape.width,

                    y: shape.y,
                    height: Math.max(gap, y - shape.y),
                });
            },
            cursor: 's-resize',
            label: 'South resize anchor',
        },
        {
            x: shape.x,
            y: shape.y + shape.height,
            moveAnchorTo: (x: number, y: number) => {
                //                const x1 = Math.min(x, shape.x + shape.width - gap);
                const x1 = Math.max(0, Math.min(x, shape.x + shape.width - gap));
                setShapeInCanvas({
                    ...shape,
                    x: x1,
                    width: Math.max(gap, shape.width + shape.x - x1),

                    y: shape.y,
                    height: Math.max(gap, y - shape.y),
                });
            },
            cursor: 'sw-resize',
            label: 'South west resize anchor',
        },
        {
            x: shape.x,
            y: shape.y + shape.height / 2,
            moveAnchorTo: (x: number, _y: number) => {
                const x1 = Math.max(0, Math.min(x, shape.x + shape.width - gap));
                setShapeInCanvas({
                    ...shape,
                    x: x1,
                    width: Math.max(gap, shape.width + shape.x - x1),

                    y: shape.y,
                    height: shape.height,
                });
            },
            cursor: 'w-resize',
            label: 'West resize anchor',
        },
    ];

    const image = annotationToolContext.image;

    return (
        <>
            <svg
                id={`translate-bounding-box-${annotation.id}`}
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
            </svg>

            <Labels annotation={{ ...annotation, shape }} annotationToolContext={annotationToolContext} />

            {disablePoints === false ? (
                <svg
                    id={`edit-bounding-box-points-${annotation.id}`}
                    className={classes.disabledLayer}
                    width={image.width}
                    height={image.height}
                >
                    <g style={{ pointerEvents: 'auto' }}>
                        {anchorPoints.map((anchor) => {
                            return <ResizeAnchor key={anchor.label} zoom={zoom} onComplete={onComplete} {...anchor} />;
                        })}
                    </g>
                </svg>
            ) : (
                <></>
            )}
        </>
    );
};
