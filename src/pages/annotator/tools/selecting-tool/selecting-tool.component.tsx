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

import { RefObject, useCallback, useRef, useState } from 'react';

import { Annotation, clampPointBetweenImage, Point } from '../../../../core/annotations';
import { useEventListener } from '../../../../hooks';
import { runWhen } from '../../../../shared/utils';
import { ToolSettings, ToolType } from '../../core';
import { getOutputFromTask } from '../../providers/task-chain-provider/utils';
import { PointerEvents, ToolAnnotationContextProps } from '../tools.interface';
import { getRelativePoint } from '../utils';
import { BrushTool } from './components/brush-tool.component';
import { SelectingBoxTool } from './components/selecting-box-tool.component';
import { useSelectingState } from './selecting-state-provider.component';
import { SelectingToolType } from './selecting-tool.enums';
import { areAnnotationsIdentical, pointInShape } from './utils';

const useClickWithoutDragging = (ref: RefObject<SVGSVGElement>, onClick: (event: PointerEvent) => void) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleClick = useCallback(
        (event: PointerEvent): void => {
            event.preventDefault();

            if (isDragging) {
                return;
            }

            onClick(event);
        },
        [onClick, isDragging]
    );

    useEventListener(PointerEvents.PointerUp, handleClick, ref);
    useEventListener(PointerEvents.PointerDown, () => setIsDragging(false), ref);
    useEventListener(PointerEvents.PointerMove, () => setIsDragging(true), ref);
};

export const SelectingTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { setSelectedAnnotations },
        image,
        zoomState: { zoom },
        getToolSettings,
    } = annotationToolContext;
    const { activeTool, brushSize, showCirclePreview } = useSelectingState();
    const selectingContainerRef = useRef<SVGSVGElement>(null);
    const selectableAnnotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask);
    const toolSettings = getToolSettings(ToolType.SelectTool) as ToolSettings[ToolType.SelectTool];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleClick = useCallback(
        runWhen<PointerEvent>(() => !toolSettings?.isBrushSubTool)((event: PointerEvent): void => {
            event.preventDefault();

            if (selectingContainerRef.current) {
                const clampPoint = clampPointBetweenImage(image);
                const { clientX, clientY } = event;
                const clickPoint: Point = { x: clientX, y: clientY };
                const calculatePoint = getRelativePoint(selectingContainerRef.current, clickPoint, zoom);
                const points = clampPoint(calculatePoint);

                const highlightedAnnotations = pointInShape(
                    selectableAnnotations as Annotation[],
                    points,
                    event.shiftKey
                );
                const identicalAnnotations = areAnnotationsIdentical(
                    selectableAnnotations as Annotation[],
                    highlightedAnnotations
                );

                if (!identicalAnnotations) {
                    setSelectedAnnotations((annotation) => {
                        const isSelected = highlightedAnnotations.find(({ id }) => id === annotation.id);

                        if (isSelected) {
                            return isSelected.isSelected;
                        }

                        return annotation.isSelected;
                    });
                }
            }
        }),
        [zoom, selectableAnnotations, image, setSelectedAnnotations]
    );

    useClickWithoutDragging(selectingContainerRef, handleClick);

    return (
        <svg ref={selectingContainerRef}>
            {activeTool === SelectingToolType.SelectionTool && (
                <SelectingBoxTool annotationToolContext={annotationToolContext} />
            )}
            {activeTool === SelectingToolType.BrushTool && (
                <BrushTool
                    brushSize={brushSize}
                    showCirclePreview={showCirclePreview}
                    annotationToolContext={annotationToolContext}
                />
            )}
        </svg>
    );
};
