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

// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { createContext, ReactNode, useContext, useMemo } from 'react';

import {
    Annotation,
    containsCenterOfShape,
    getBoundingBox,
    getCenterOfShape,
    Rect,
    Shape,
} from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { isExclusive, isGlobal, Label } from '../../../../core/labels';
import { Task, isDetectionDomain, isClassificationDomain, isAnomalyDomain } from '../../../../core/projects';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { AnnotationScene } from '../../core';
import {
    AnnotationSceneContext,
    useAnnotationScene,
} from '../annotation-scene-provider/annotation-scene-provider.component';
import { TaskChainInput } from './task-chain.interface';
import { useImageROI } from './use-image-roi.hook';
import { useSceneInputs } from './use-scene-inputs.hook';
import {
    containsGlobalAnnotationWithLabel,
    getAnnotationsWithSelectedInput,
    getGlobalAnnotations,
    getInputForTask,
    getLabelConflictPredicate,
    getPreviousTask,
    getSelectedInputAnnotations,
    possiblyAddGlobalAnomalousShape,
} from './utils';

export interface TaskChainContextProps {
    inputs: ReadonlyArray<TaskChainInput>;
    outputs: ReadonlyArray<Annotation>;
}

const TaskChainContext = createContext<TaskChainContextProps | undefined>(undefined);

const useInputAnnotations = (scene: AnnotationScene, tasks: Task[], selectedTask: Task | null) => {
    return useMemo(() => {
        return getInputForTask({ scene, tasks }, selectedTask);
    }, [scene, tasks, selectedTask]);
};

interface TaskChainProviderProps {
    children: ReactNode;
    tasks: Task[];
    selectedTask: Task | null;
    defaultLabel: Label | null;
}

export const TaskChainProvider = ({
    children,
    tasks,
    selectedTask,
    defaultLabel,
}: TaskChainProviderProps): JSX.Element => {
    const parentScene = useAnnotationScene();
    const imageRoi = useImageROI();

    const inputAnnotations = useInputAnnotations(parentScene, tasks, selectedTask);

    const scene: AnnotationScene = useMemo((): AnnotationScene => {
        const annotations = getAnnotationsWithSelectedInput(parentScene.annotations, inputAnnotations);

        const removeEmptyAnnotations = (shapes: Shape[]) => {
            // Determine if this annotation is placed inside of another annotation, that has
            // an empty label from the same task
            const boundingBoxes = shapes.map(getCenterOfShape);
            const emptyAnnotations = annotations.filter(({ labels, shape }) => {
                if (!labels.some(isExclusive)) {
                    return false;
                }

                const emptyBoundingBox = getBoundingBox(shape);

                return boundingBoxes.some((center) => containsCenterOfShape(emptyBoundingBox, center));
            });

            emptyAnnotations.forEach((emptyAnnotation) => {
                if (emptyAnnotation.labels.length === 1) {
                    parentScene.removeAnnotations([emptyAnnotation], true);
                } else {
                    parentScene.removeLabels(emptyAnnotation.labels.filter(isExclusive), [emptyAnnotation.id], true);
                }
            });
        };

        const addShapes = (shapes: Shape[], label: Label | null = defaultLabel, isSelected = true): Annotation[] => {
            removeEmptyAnnotations(shapes);

            // NOTE: here we can add some validation for the label, i.e. if it is a detection label,
            // then don't assign it to shapes if they are not rectangles
            const isDetectionLabel = tasks.some(
                ({ labels, domain }) => isDetectionDomain(domain) && labels.some(({ id }) => id === label?.id)
            );
            const isNonDetectionShape = shapes.some(({ shapeType }) => shapeType !== ShapeType.Rect);

            if (isDetectionLabel && isNonDetectionShape) {
                label = null;
            }

            // Make sure the previously selected annotations from the previous task stay selected
            const selectedInputAnnotations = getSelectedInputAnnotations(annotations, inputAnnotations);

            // Add shape and select old annotations
            const newAnnotations = parentScene.addShapes(
                possiblyAddGlobalAnomalousShape(shapes, label, annotations, imageRoi),
                label,
                isSelected,
                getLabelConflictPredicate(tasks)
            );

            const extraAnomalousAnnotationWasAdded = newAnnotations.length > shapes.length;
            const check = extraAnomalousAnnotationWasAdded ? [...newAnnotations].splice(1) : newAnnotations;

            parentScene.setSelectedAnnotations((annotation) => {
                if (selectedInputAnnotations.some(({ id }) => id === annotation.id)) {
                    return true;
                }

                if (check.find(({ id }) => id === annotation.id)) {
                    return annotation.isSelected;
                }

                return false;
            });

            return newAnnotations;
        };

        const removeAnnotationsInsideOfROIs = (rois: Omit<Rect, 'shapeType'>[], excludeIds: string[]) => {
            const annotationsToBeRemoved: Annotation[] = annotations.filter((annotation) => {
                if (excludeIds.includes(annotation.id)) {
                    return false;
                }

                const center = getCenterOfShape(annotation.shape);

                return rois.some((roi) => {
                    return containsCenterOfShape(roi, center);
                });
            });

            if (annotationsToBeRemoved.length > 0) {
                parentScene.removeAnnotations(annotationsToBeRemoved, true);
            }
        };

        const addEmptyLabelToAnnotations = (label: Label, annotationIds: string[]) => {
            const emptyRois = annotationIds
                .map((annotationId) => {
                    const annotation = annotations.find(({ id }) => id === annotationId);

                    if (!annotation) {
                        return undefined;
                    }

                    return getBoundingBox(annotation.shape);
                })
                .filter((x): x is Omit<Rect, 'shapeType'> => x !== undefined);

            removeAnnotationsInsideOfROIs(emptyRois, annotationIds);

            parentScene.addLabel(label, annotationIds, getLabelConflictPredicate(tasks));
        };

        const addLabel = (label: Label, annotationIds: string[]) => {
            const isDetectionLabel = tasks.some(
                ({ labels, domain }) => isDetectionDomain(domain) && labels.some(({ id }) => id === label?.id)
            );

            // If we're adding a detection label then the label is only allowed to be added to a Rect shape
            const validAnnotationIds = annotationIds.filter((annotationId) => {
                return !isDetectionLabel
                    ? true
                    : annotations.some(({ id, shape }) => id === annotationId && shape.shapeType === ShapeType.Rect);
            });

            if (!isExclusive(label) && annotationIds.length > 0) {
                parentScene.addLabel(label, validAnnotationIds, getLabelConflictPredicate(tasks));
                return;
            }

            // If the empy label comes from a sub task then it's likely that the user intended to add it
            // to an existing annotation, otherwise we assume they intended to add it to a selected input
            if (selectedTask === null) {
                const task = tasks.find(({ labels }) => labels.some(({ id }) => id === label.id));

                if (task !== tasks[0]) {
                    addEmptyLabelToAnnotations(label, validAnnotationIds);
                    return;
                }
            }

            // Dealing with empty labels in a local task is special, because the empty labels
            // are a "global" label, hence we either need apply it to a selected input (in case of task chain),
            // or we if there is no input we create a new shape with the image ROI
            const selectedInputAnnotations = getSelectedInputAnnotations(annotations, inputAnnotations);

            if (selectedInputAnnotations.length > 0) {
                addEmptyLabelToAnnotations(
                    label,
                    selectedInputAnnotations.map(({ id }) => id)
                );
                return;
            }

            // If no input annotation was selected, we add an empty label to the image ROI, but only,
            // if this task doesn't follow another task
            const previousTask = getPreviousTask({ tasks }, selectedTask);
            if (previousTask !== undefined) {
                return;
            }

            if (!isGlobal(label)) {
                return;
            }

            if (containsGlobalAnnotationWithLabel(annotations, label, imageRoi)) {
                return;
            }

            const shapes = imageRoi !== undefined ? [imageRoi] : [];

            // Don't remove annotations that have the same label,
            // this prevents local anomalous annotations being removed when adding
            // a global anomalous annotation
            const nonConflictingAnnotations = annotations
                .filter(({ labels }) => {
                    return labels.some(({ id }) => id === label.id);
                })
                .map(({ id }) => id);

            removeAnnotationsInsideOfROIs(shapes, nonConflictingAnnotations);
            addShapes(shapes, label);
        };

        const selectAnnotation = (annotationId: string) => {
            // if it is an input annotation, toggle, otherwise do normal
            const isInputAnnotation = inputAnnotations.some(({ id }) => id === annotationId);

            if (!isInputAnnotation) {
                parentScene.selectAnnotation(annotationId);
            } else {
                // Also: if inputAnnotations.some(({ id, isSelected }) => id === annotationId && isSelected) return;
                parentScene.setSelectedAnnotations((annotation) => {
                    if (annotation.id === annotationId) {
                        return true;
                    }

                    // Deselect any other input annotations
                    if (inputAnnotations.some(({ id }) => id === annotation.id)) {
                        return false;
                    }

                    // Don't mutate this task's output selection state
                    return annotation.isSelected;
                });
            }
        };

        const removeAnnotations: AnnotationScene['removeAnnotations'] = (predicate, skipHistory = false) => {
            if (
                selectedTask === null ||
                (!isClassificationDomain(selectedTask.domain) && !isAnomalyDomain(selectedTask.domain))
            ) {
                parentScene.removeAnnotations(predicate, skipHistory);
                return;
            }

            // use this for a more refined roi?
            // const selectedInputAnnotations = getSelectedInputAnnotations(annotations, inputAnnotations);
            const roi = imageRoi as Rect;
            const globalAnnotations = getGlobalAnnotations(annotations, roi, selectedTask);

            const annotationsThatAreAllowedToBeRemoved = predicate.filter((annotation) => {
                return !globalAnnotations.some(({ id }) => annotation.id === id);
            });

            parentScene.removeAnnotations(annotationsThatAreAllowedToBeRemoved, skipHistory);
        };

        return {
            ...parentScene,

            // Add additional task chain behavior
            selectAnnotation,
            addShapes,
            addLabel,
            annotations,
            removeAnnotations,
        };
    }, [parentScene, inputAnnotations, tasks, imageRoi, selectedTask, defaultLabel]);

    const { inputs, outputs } = useSceneInputs(scene, tasks, selectedTask);

    return (
        <TaskChainContext.Provider value={{ inputs, outputs }}>
            <AnnotationSceneContext.Provider value={scene}>{children}</AnnotationSceneContext.Provider>
        </TaskChainContext.Provider>
    );
};

export const useTaskChain = (): TaskChainContextProps => {
    const context = useContext(TaskChainContext);

    if (context === undefined) {
        throw new MissingProviderError('useTaskChain', 'TaskChainProvider');
    }

    return context;
};
