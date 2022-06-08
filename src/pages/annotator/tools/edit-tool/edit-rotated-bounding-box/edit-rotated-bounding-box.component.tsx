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

import { Annotation, clampBetween, radiansToDegrees, roiFromImage } from '../../../../../core/annotations';
import {
    calculateSizeAndPositionBasedOfCornerAnchor,
    calculateSizeAndPositionOfSideAnchor,
    cursorForDirection,
    rotatedRectCorners,
    transformPointInRotatedRectToScreenSpace,
} from '../../../../../core/annotations/rotated-rect-math';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import * as Vec2 from '../../../../../core/annotations/vec2';
import { Line } from '../../../annotation/shapes/line.component';
import { AnnotationToolContext } from '../../../core';
import { ANCHOR_SIZE, ResizeAnchor } from '../resize-anchor.component';
import { ResizeAnchorType } from '../resize-anchor.enum';
import { RotationAnchor } from '../rotation-anchor.component';
import { TranslateShape } from '../translate-shape.component';
import classes from './../../../annotator-canvas.module.scss';

interface EditRotatedBoundingBoxProps {
    annotationToolContext: AnnotationToolContext;
    annotation: Annotation & { shape: { shapeType: ShapeType.RotatedRect } };
    disableTranslation?: boolean;
    disablePoints?: boolean;
}

export const EditRotatedBoundingBox = ({
    annotationToolContext,
    annotation,
    disablePoints = false,
    disableTranslation = false,
}: EditRotatedBoundingBoxProps): JSX.Element => {
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
            x: clampBetween(shape.x - roi.width, -point.x, shape.x),
            y: clampBetween(shape.y - roi.height, -point.y, shape.y),
        };

        setShape({ ...shape, x: shape.x - clampedTranslate.x, y: shape.y - clampedTranslate.y });
    };

    const shapePosition = { x: shape.x, y: shape.y };
    const gap = (2 * ANCHOR_SIZE) / zoom;

    const cornerAnchorLocations = rotatedRectCorners(shape);
    const cornerLabels = ['North west', 'North east', 'South east', 'South west'];
    const cornerAnchors = cornerAnchorLocations.map((corner: Vec2.Vec2, index: number) => {
        const opposite = cornerAnchorLocations[(index + 2) % 4];
        return {
            ...corner,
            moveAnchorTo: (x: number, y: number) => {
                setShape({
                    ...shape,
                    ...calculateSizeAndPositionBasedOfCornerAnchor({ x, y }, corner, opposite, shape, gap),
                });
            },
            cursor: cursorForDirection(corner, opposite),
            label: `${cornerLabels[index]} resize anchor`,
        };
    });

    const sideAnchorLocations = {
        W: transformPointInRotatedRectToScreenSpace({ x: shape.x - shape.width / 2, y: shape.y }, shape),
        N: transformPointInRotatedRectToScreenSpace({ x: shape.x, y: shape.y - shape.height / 2 }, shape),
        E: transformPointInRotatedRectToScreenSpace({ x: shape.x + shape.width / 2, y: shape.y }, shape),
        S: transformPointInRotatedRectToScreenSpace({ x: shape.x, y: shape.y + shape.height / 2 }, shape),
    };

    cursorForDirection(sideAnchorLocations.E, sideAnchorLocations.W);

    const rotationAnchorLocation = transformPointInRotatedRectToScreenSpace(
        {
            x: shape.x,
            y: shape.y - shape.height / 2 - gap * 2,
        },
        shape
    );

    const rotationAnchorLineEnd = transformPointInRotatedRectToScreenSpace(
        {
            x: shape.x,
            y: shape.y - shape.height / 2 - gap * 2 + 7 / zoom,
        },
        shape
    );

    const anchorPoints = [
        {
            ...sideAnchorLocations.N,
            moveAnchorTo: (x: number, y: number) => {
                const result = calculateSizeAndPositionOfSideAnchor(
                    { x, y },
                    sideAnchorLocations.N,
                    sideAnchorLocations.S,
                    gap
                );
                setShape({
                    ...shape,
                    x: result.x,
                    y: result.y,
                    height: result.size,
                });
            },
            cursor: cursorForDirection(sideAnchorLocations.N, sideAnchorLocations.S),
            label: `North resize anchor`,
        },
        {
            ...sideAnchorLocations.S,
            moveAnchorTo: (x: number, y: number) => {
                const result = calculateSizeAndPositionOfSideAnchor(
                    { x, y },
                    sideAnchorLocations.S,
                    sideAnchorLocations.N,
                    gap
                );
                setShape({
                    ...shape,
                    x: result.x,
                    y: result.y,
                    height: result.size,
                });
            },
            cursor: cursorForDirection(sideAnchorLocations.S, sideAnchorLocations.N),
            label: `South resize anchor`,
        },
        {
            ...sideAnchorLocations.E,
            moveAnchorTo: (x: number, y: number) => {
                const result = calculateSizeAndPositionOfSideAnchor(
                    { x, y },
                    sideAnchorLocations.E,
                    sideAnchorLocations.W,
                    gap
                );
                setShape({
                    ...shape,
                    x: result.x,
                    y: result.y,
                    width: result.size,
                });
            },
            cursor: cursorForDirection(sideAnchorLocations.E, sideAnchorLocations.W),
            label: `East resize anchor`,
        },
        {
            ...sideAnchorLocations.W,
            moveAnchorTo: (x: number, y: number) => {
                const result = calculateSizeAndPositionOfSideAnchor(
                    { x, y },
                    sideAnchorLocations.W,
                    sideAnchorLocations.E,
                    gap
                );
                setShape({
                    ...shape,
                    x: result.x,
                    y: result.y,
                    width: result.size,
                });
            },
            cursor: cursorForDirection(sideAnchorLocations.W, sideAnchorLocations.E),
            label: `West resize anchor`,
        },
        ...cornerAnchors,
    ];

    const rotationAnchor = {
        ...rotationAnchorLocation,
        moveAnchorTo: (x: number, y: number) => {
            const position = { x, y };
            const anchorToCenter = Vec2.sub(position, shapePosition);
            const radians = Math.atan2(anchorToCenter.y, anchorToCenter.x) - Math.atan2(-1, 0);
            const angle = radiansToDegrees(radians);
            setShape({
                ...shape,
                angle: angle > 0 ? angle : angle + 360,
            });
        },
        cursor: 'url(/icons/cursor/rotate.svg) 7 8, auto',
        label: 'Rotate anchor',
    };

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

            {disablePoints === false ? (
                <svg
                    id={`edit-bounding-box-points-${annotation.id}`}
                    className={classes.disabledLayer}
                    width={image.width}
                    height={image.height}
                >
                    <Line
                        brushSize={2 / zoom}
                        color={'var(--energy-blue)'}
                        points={[sideAnchorLocations.N, rotationAnchorLineEnd]}
                    />
                    <g style={{ pointerEvents: 'auto' }}>
                        {anchorPoints.map((anchor) => {
                            return (
                                <ResizeAnchor
                                    key={anchor.label}
                                    zoom={zoom}
                                    type={ResizeAnchorType.SQUARE}
                                    onComplete={onComplete}
                                    angle={shape.angle}
                                    {...anchor}
                                />
                            );
                        })}

                        <RotationAnchor
                            angle={shape.angle}
                            key={rotationAnchor.label}
                            zoom={zoom}
                            onComplete={onComplete}
                            {...rotationAnchor}
                        />
                    </g>
                </svg>
            ) : (
                <></>
            )}
        </>
    );
};
