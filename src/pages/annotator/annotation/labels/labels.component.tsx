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

import { useState } from 'react';

import { useHover } from '@react-aria/interactions';

import { Annotation } from '../../../../core/annotations';
import { highestCorner } from '../../../../core/annotations/rotated-rect-math';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { AnnotationToolContext, ToolType } from '../../core';
import { AnnotationActions } from './annotation-actions.component';
import { EditLabels } from './edit-labels.component';
import { Label } from './label.component';
import { LabelFlag } from './LabelFlag.component';
import classes from './labels.module.scss';
import { getLabelsFromTask, LABEL_CLASS, useLabelPosition } from './utils';

interface LabelsProps {
    annotation: Annotation;
    annotationToolContext: AnnotationToolContext;
}

const LABEL_OFFSET = 8;
const getTop = (annotation: Annotation, zoom: number, _y: number): number => {
    const offset = annotation.shape.shapeType !== ShapeType.Rect ? LABEL_OFFSET / zoom : 0;
    const shape = annotation.shape;

    switch (shape.shapeType) {
        case ShapeType.Rect:
            return shape.y;
        case ShapeType.RotatedRect:
            return highestCorner(shape).y - 10;
        case ShapeType.Circle:
            return shape.y - shape.r - offset;
        case ShapeType.Polygon:
            return Math.min(...shape.points.map((point) => point.y)) - offset;
    }
};

export const Labels = ({ annotation, annotationToolContext }: LabelsProps): JSX.Element => {
    const [editLabels, setEditLabels] = useState(false);

    const { hoverProps, isHovered } = useHover({
        isDisabled: editLabels,
    });

    const zoom = annotationToolContext.zoomState.zoom;
    const { x: left, y } = useLabelPosition(annotation);
    const top = getTop(annotation, zoom, y);

    const getZIndex = () => {
        if (!annotation.isSelected && annotationToolContext.tool === ToolType.SelectTool) {
            return isHovered ? 2 : 1;
        }
        return undefined;
    };

    const style = {
        left,
        top,
        // We allow the user to chagne labels without explicitely editing an annotation,
        // when they've selected the selection tool.
        // By increasing its zIndex the Labels are rendered on top of the selection tool
        zIndex: getZIndex(),
        cursor: 'pointer',
    } as const;

    if (editLabels) {
        return (
            <>
                <LabelFlag annotation={annotation} top={top} left={left} y={y} />
                <div
                    id={`${annotation.id}-labels`}
                    className={LABEL_CLASS[annotation.shape.shapeType]}
                    // Make sure the label search component overlaps labels from other annotations
                    style={{ ...style, zIndex: 2 }}
                >
                    <EditLabels
                        annotation={annotation}
                        setEditLabels={setEditLabels}
                        annotationToolContext={annotationToolContext}
                    />
                </div>
            </>
        );
    }

    const handleEditLabels = () => {
        setEditLabels(true);
    };

    const { selectedTask } = annotationToolContext;
    const annotationTaskLabels = getLabelsFromTask(annotation, annotationToolContext.selectedTask);
    const labels = selectedTask === null ? annotation.labels : annotationTaskLabels;
    const showSelectLabel = labels.length === 0;

    return (
        <>
            <LabelFlag annotation={annotation} top={top} left={left} y={y} />

            <ul
                id={`${annotation.id}-labels`}
                className={LABEL_CLASS[annotation.shape.shapeType]}
                style={style}
                {...hoverProps}
            >
                {labels.map((label, idx) => {
                    const hasChildren = labels.some(({ parentLabelId }) => label.id === parentLabelId);

                    return (
                        <Label
                            key={label.id}
                            id={`${annotation.id}-labels-${label.id}`}
                            handleEditLabels={handleEditLabels}
                            label={label}
                            slots={labels.length}
                            hasChildren={hasChildren}
                            // Make each label overlap its child labels
                            zIndex={labels.length - idx}
                        />
                    );
                })}

                {showSelectLabel ? (
                    <li className={[classes.label, classes.selectLabel].join(' ')} onClick={handleEditLabels}>
                        Select label
                    </li>
                ) : (
                    <></>
                )}

                {isHovered ? (
                    <AnnotationActions
                        setEditLabels={setEditLabels}
                        annotation={annotation}
                        annotationToolContext={annotationToolContext}
                    />
                ) : (
                    <></>
                )}
            </ul>
        </>
    );
};
