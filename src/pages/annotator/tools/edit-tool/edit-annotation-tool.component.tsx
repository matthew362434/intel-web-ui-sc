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

import { RefObject, useRef } from 'react';

import { Annotation } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { useOutsideClick } from '../../../../hooks';
import { Labels } from '../../annotation/labels/labels.component';
import { ToolSettings, ToolType } from '../../core';
import { useContainerBoundingBox } from '../../hooks/use-container-bondingbox.hook';
import { getGlobalAnnotations } from '../../providers/task-chain-provider/utils';
import { isWheelButton } from '../buttons-utils';
import { ToolAnnotationContextProps } from '../tools.interface';
import { EditBoundingBox as EditBoundingBoxTool } from './edit-bounding-box';
import { EditCircle as EditCircleTool } from './edit-circle';
import { EditPolygon as EditPolygonTool } from './edit-polygon';
import { EditRotatedBoundingBox as EditRotatedBoundingBoxTool } from './edit-rotated-bounding-box';

interface EditAnnotationToolFactoryProps extends ToolAnnotationContextProps {
    annotation: Annotation;
    disableTranslation?: boolean;
    disablePoints?: boolean;
}
const EditAnnotationToolFactory = ({
    annotation,
    annotationToolContext,
    disableTranslation = false,
    disablePoints = false,
}: EditAnnotationToolFactoryProps) => {
    const task = annotationToolContext?.selectedTask ?? annotationToolContext.tasks[0];

    const roi = useContainerBoundingBox(annotationToolContext.image);

    const globalAnnotations = getGlobalAnnotations(annotationToolContext.scene.annotations, roi, task);

    if (globalAnnotations.some(({ id }) => annotation.id === id)) {
        return <Labels annotation={annotation} annotationToolContext={annotationToolContext} />;
    }

    switch (annotation.shape.shapeType) {
        case ShapeType.Rect: {
            return (
                <EditBoundingBoxTool
                    annotationToolContext={annotationToolContext}
                    annotation={annotation as Annotation & { shape: { shapeType: ShapeType.Rect } }}
                    disableTranslation={disableTranslation}
                    disablePoints={disablePoints}
                />
            );
        }
        case ShapeType.RotatedRect: {
            return (
                <EditRotatedBoundingBoxTool
                    annotationToolContext={annotationToolContext}
                    annotation={annotation as Annotation & { shape: { shapeType: ShapeType.RotatedRect } }}
                    disableTranslation={disableTranslation}
                    disablePoints={disablePoints}
                />
            );
        }
        case ShapeType.Polygon: {
            return (
                <EditPolygonTool
                    annotationToolContext={annotationToolContext}
                    annotation={annotation as Annotation & { shape: { shapeType: ShapeType.Polygon } }}
                    disableTranslation={disableTranslation}
                    disablePoints={disablePoints}
                />
            );
        }
        case ShapeType.Circle: {
            return (
                <EditCircleTool
                    annotationToolContext={annotationToolContext}
                    annotation={annotation as Annotation & { shape: { shapeType: ShapeType.Circle } }}
                    disableTranslation={disableTranslation}
                    disablePoints={disablePoints}
                />
            );
        }
    }
};

interface EditAnnotationToolProps extends EditAnnotationToolFactoryProps {
    canvasRef?: RefObject<SVGSVGElement>;
}

export const EditAnnotationTool = ({
    annotation,
    annotationToolContext,
    disableTranslation = false,
    disablePoints = false,
    canvasRef,
}: EditAnnotationToolProps): JSX.Element => {
    const ref = useRef<HTMLDivElement>(null);
    const { getToolSettings } = annotationToolContext;
    useOutsideClick({
        ref,
        callback: (event) => {
            // The ctrl key and wheelbuttons are used to pan the image, in which
            // case we do not want to stop editing this annotation as the user
            // likely moved the screen to better focus on the annotation
            if (event.ctrlKey || isWheelButton(event)) {
                return;
            }

            // In the selection tool we want to allow users to select more annotations
            // by shift clicking
            if (annotationToolContext.tool === ToolType.SelectTool && event.shiftKey) {
                return;
            }
            //We don't want to deselect Annotation when the user is brushing
            const toolSetting = getToolSettings(ToolType.SelectTool) as ToolSettings[ToolType.SelectTool];
            if (!toolSetting?.isBrushSubTool) {
                annotationToolContext.scene.unselectAnnotation(annotation.id);
            }
        },
        element: canvasRef,
    });

    return (
        <div ref={ref}>
            <EditAnnotationToolFactory
                annotationToolContext={annotationToolContext}
                annotation={annotation as Annotation & { shape: { shapeType: ShapeType.Rect } }}
                disableTranslation={disableTranslation}
                disablePoints={disablePoints}
            />
        </div>
    );
};
