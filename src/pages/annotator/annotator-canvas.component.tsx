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

import { PointerEvent, MouseEvent, useRef } from 'react';

import { Annotation as AnnotationInterface, getTheTopShapeAt } from '../../core/annotations';
import { isExclusive } from '../../core/labels';
import { MediaItem } from '../../core/media';
import { DOMAIN } from '../../core/projects';
import { isClassificationDomain } from '../../core/projects/domains';
import { Annotation } from './annotation';
import { AnnotationsMask } from './annotation/annotations-mask.component';
import { Labels } from './annotation/labels/labels.component';
import classes from './annotator-canvas.module.scss';
import { InferenceMap } from './components/inference-map/inference-map.component';
import { AnnotationToolContext, ANNOTATOR_MODE, ToolType } from './core';
import { useContainerBoundingBox } from './hooks/use-container-bondingbox.hook';
import { MediaImage } from './media-image.component';
import { usePrediction } from './providers';
import { useTaskChain } from './providers/task-chain-provider/task-chain-provider.component';
import { useTaskChainOutput } from './providers/task-chain-provider/use-task-chain-output.hook';
import { getGlobalAnnotations, getPreviousTask } from './providers/task-chain-provider/utils';
import { isEraserButton } from './tools/buttons-utils';
import { CanvasTools } from './tools/canvas-tools.component';
import { EditTool } from './tools/edit-tool/edit-tool.component';
import { PointerType } from './tools/tools.interface';
import { DEFAULT_ANNOTATION_STYLES, getRelativePoint } from './tools/utils';

const Annotations = ({
    annotations,
    width,
    height,
    annotationToolContext,
}: {
    annotationToolContext: AnnotationToolContext;
    annotations: AnnotationInterface[];
    width: number;
    height: number;
}) => {
    const task = annotationToolContext?.selectedTask ?? annotationToolContext.tasks[0];

    const roi = useContainerBoundingBox(annotationToolContext.image);

    const globalAnnotations = getGlobalAnnotations(annotations, roi, task);

    // We render each annotation as two layers: one where we draw its shape and another
    // where we draw its labels.
    // This is done so that we can use HTML inside of the canvas (which gets tricky if you
    // try to do this inside of a svg element instead)
    return (
        <div aria-label='annotations'>
            {annotations.map((annotation) => {
                const hideAnnotationShape = globalAnnotations.some(({ id }) => annotation.id === id);

                return (
                    <div key={annotation.id} className={classes.disabledLayer}>
                        {hideAnnotationShape ? (
                            <></>
                        ) : (
                            <svg
                                id={`annotations-canvas-${annotation.id}-shape`}
                                width={width}
                                height={height}
                                style={DEFAULT_ANNOTATION_STYLES}
                            >
                                <Annotation key={annotation.id} annotation={annotation} />
                            </svg>
                        )}
                        <div style={{ pointerEvents: 'none' }}>
                            <Labels annotation={annotation} annotationToolContext={annotationToolContext} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export function AnnotatorCanvas({
    annotationToolContext,
    selectedMediaItem,
}: {
    annotationToolContext: AnnotationToolContext;
    selectedMediaItem: MediaItem | undefined;
}): JSX.Element {
    const { image, scene, tool, mode, zoomState } = annotationToolContext;

    const { isInferenceMapVisible, selectedInferenceMap, inferenceMapOpacity } = usePrediction();

    const canvasRef = useRef<SVGSVGElement>(null);

    const { inputs } = useTaskChain();

    const selectedInputs = inputs.filter(({ isSelected }) => isSelected);
    const maskedAnnotations = selectedInputs;

    const outputAnnotations = useTaskChainOutput(annotationToolContext);

    const visibleAnnotations = outputAnnotations.filter((annotation: AnnotationInterface) => {
        const { isHidden, isSelected } = annotation;

        if (isHidden) {
            return false;
        }

        if (annotationToolContext.selectedTask?.domain === DOMAIN.CLASSIFICATION) {
            return isSelected;
        }

        return true;
    });

    const isInEditMode = visibleAnnotations.filter(({ isSelected, isLocked }) => isSelected && !isLocked).length === 1;
    const annotations = isInEditMode
        ? visibleAnnotations.filter(({ isSelected, isLocked }) => !isSelected || (isSelected && isLocked))
        : visibleAnnotations;

    const onPointerMove = (event: PointerEvent<SVGSVGElement>): void => {
        if (canvasRef.current === null) {
            return;
        }

        const button = {
            button: event.button,
            buttons: event.buttons,
        };

        if (event.pointerType === PointerType.Pen && isEraserButton(button)) {
            const currentPoint = getRelativePoint(
                canvasRef.current,
                { x: event.clientX, y: event.clientY },
                zoomState.zoom
            );
            const topAnnotation = getTheTopShapeAt(annotations, currentPoint);

            if (topAnnotation) {
                scene.removeAnnotations([topAnnotation]);
            }
        }
    };

    const previousTask = getPreviousTask(annotationToolContext, annotationToolContext.selectedTask);
    const showMask: boolean = annotationToolContext.tasks.length > 1 && previousTask !== undefined;

    const isAnomalyOrClassificationProject = (): boolean => {
        if (!annotationToolContext.selectedTask) return false;

        const { domain } = annotationToolContext.selectedTask;

        return isClassificationDomain(domain);
    };

    const handleContextMenu = (event: MouseEvent): void => {
        return event.preventDefault();
    };

    return (
        <div className={classes.canvas} onContextMenu={handleContextMenu}>
            {mode === ANNOTATOR_MODE.PREDICTION && isInferenceMapVisible && (
                <InferenceMap
                    width={image.width}
                    height={image.height}
                    map={selectedInferenceMap}
                    opacity={inferenceMapOpacity}
                />
            )}

            <svg width={image.width} height={image.height} id={'annotations-canvas-image'}>
                <MediaImage image={image} selectedMediaItem={selectedMediaItem} />
            </svg>

            {isAnomalyOrClassificationProject() ? (
                <>
                    {showMask && (
                        <AnnotationsMask
                            width={annotationToolContext.image.width}
                            height={annotationToolContext.image.height}
                            annotations={visibleAnnotations}
                        />
                    )}

                    {visibleAnnotations.map((annotation) => {
                        return (
                            <Labels
                                key={annotation.id}
                                annotation={annotation}
                                annotationToolContext={annotationToolContext}
                            />
                        );
                    })}
                </>
            ) : (
                <>
                    <Annotations
                        annotations={annotations}
                        width={image.width}
                        height={image.height}
                        annotationToolContext={annotationToolContext}
                    />

                    {showMask && (
                        <AnnotationsMask
                            width={annotationToolContext.image.width}
                            height={annotationToolContext.image.height}
                            annotations={maskedAnnotations}
                        />
                    )}

                    {maskedAnnotations
                        .filter(({ labels }) => labels.some(isExclusive))
                        .map((annotation) => {
                            return (
                                <Labels
                                    key={annotation.id}
                                    annotation={annotation}
                                    annotationToolContext={annotationToolContext}
                                />
                            );
                        })}

                    <svg
                        ref={canvasRef}
                        onPointerMove={onPointerMove}
                        id={'annotations-canvas-tools'}
                        className={classes.layer}
                        width={image.width}
                        height={image.height}
                    >
                        <CanvasTools annotationToolContext={annotationToolContext} />
                    </svg>

                    {isInEditMode ? (
                        <EditTool
                            annotationToolContext={annotationToolContext}
                            disableTranslation={tool !== ToolType.SelectTool}
                            canvasRef={canvasRef}
                        />
                    ) : (
                        <></>
                    )}
                </>
            )}
        </div>
    );
}
