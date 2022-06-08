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

import { isEqual } from 'lodash';

import {
    Annotation,
    BoundingBox,
    containsCenterOfShape,
    getBoundingBox,
    getCenterOfShape,
    hasEqualBoundingBox,
    Shape,
} from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { isAnomalous, isExclusive, isGlobal, Label } from '../../../../core/labels';
import { DOMAIN, Task } from '../../../../core/projects';
import {
    isAnomalyDomain,
    isClassificationDomain,
    isDetectionDomain,
    isSegmentationDomain,
} from '../../../../core/projects/domains';
import { AnnotationToolContext } from '../../core';

export const getPreviousTask = (
    annotationToolContext: Pick<AnnotationToolContext, 'tasks'>,
    task: Task | null
): Task | undefined => {
    if (task === null) {
        return undefined;
    }

    const tasks = annotationToolContext.tasks;

    if (tasks.length === 1) {
        return undefined;
    }

    const idx = tasks.findIndex(({ id }) => id === task.id);

    return idx - 1 >= 0 ? tasks[idx - 1] : undefined;
};

export const getAnnotationsInsideParentAnnotations = (
    parentAnnotations: ReadonlyArray<Annotation>,
    annotations: Annotation[]
): Annotation[] => {
    const previousBoundingBoxes = parentAnnotations.map(({ shape }) => getBoundingBox(shape));

    return annotations.filter((annotation) => {
        // Don't include annotations that are considered as inputs from the previous task
        if (parentAnnotations.some(({ id }) => id === annotation.id)) {
            return false;
        }

        const center = getCenterOfShape(annotation.shape);

        return previousBoundingBoxes.some((parentShape) => {
            return containsCenterOfShape(parentShape, center);
        });
    });
};

export const getFilterAnnotationByTask = (task: Task) => {
    return (annotation: Annotation): boolean => {
        if (isDetectionDomain(task.domain) && annotation.shape.shapeType !== ShapeType.Rect) {
            return false;
        }

        return (
            annotation.labels.length === 0 ||
            annotation.labels.some((label) => task.labels.some(({ id }) => id === label.id))
        );
    };
};

export const getOutputFromTask = (
    annotationToolContext: Pick<AnnotationToolContext, 'scene' | 'tasks'>,
    task: Task | null
): ReadonlyArray<Annotation> => {
    const tasks = annotationToolContext.tasks;

    // Don't filter out annotations for single, "All tasks" and Local -> Global tasks
    if (tasks.length === 1 || task === null) {
        return annotationToolContext.scene.annotations;
    }

    // In a Local -> Global task the local inputs become the outputs as well
    if (isClassificationDomain(task.domain)) {
        const inputs = getInputForTask(annotationToolContext, task);

        return inputs;
    }

    // In a Local -> Local task, only return annotations that are inside of annotations from a previous task
    if (isSegmentationDomain(task.domain) || isDetectionDomain(task.domain)) {
        const annotations = annotationToolContext.scene.annotations.filter(getFilterAnnotationByTask(task));

        const previousTask = getPreviousTask(annotationToolContext, task);

        if (previousTask === undefined) {
            return annotations;
        }

        const selectedInputs = getInputForTask(annotationToolContext, task).filter(({ isSelected }) => isSelected);

        return getAnnotationsInsideParentAnnotations(selectedInputs, annotations);
    }

    return [];
};

export const annotationContainsEmptyLabel = (annotation: Annotation, task: Task): boolean => {
    return annotation.labels.some((label) => {
        return isExclusive(label) && task.labels.some(({ id }) => id === label.id);
    });
};

export const getGlobalAnnotations = (
    annotations: ReadonlyArray<Annotation>,
    roi: BoundingBox,
    selectedTask: Task | null
) => {
    const globalAnnotations = annotations.filter((annotation) => {
        if (annotation.shape.shapeType !== ShapeType.Rect) {
            return false;
        }

        if (
            selectedTask === null ||
            (!isClassificationDomain(selectedTask.domain) && !isAnomalyDomain(selectedTask.domain))
        ) {
            // In case of a detection or segmentation project we want to show
            // the annotation's shape if it does not yet have a global label
            if (!annotation.labels.some(isGlobal)) {
                return false;
            }
        }

        return hasEqualBoundingBox(getBoundingBox(annotation.shape), roi);
    });

    // Hacky way to make sure that there is only 1 global annotation,
    // this allows a user to have both a global anomalous annotation in anomaly
    // detection and a local anomaousl annotation of the same size
    if (globalAnnotations.length > 0) {
        return [globalAnnotations[0]];
    }

    return [];
};

export const getInputForTask = (
    annotationToolContext: Pick<AnnotationToolContext, 'scene' | 'tasks'>,
    task: Task | null
): ReadonlyArray<Annotation> => {
    const previousTask = getPreviousTask(annotationToolContext, task);

    if (previousTask === undefined) {
        // NOTE: since classification is a global task its input and output
        // annotations are the same.
        // One caveat is that in Detection -> Classification we will also show
        // detection annotations without labels
        if (task?.domain === DOMAIN.CLASSIFICATION) {
            return getOutputFromTask(annotationToolContext, task);
        }

        return [];
    }

    const output = getOutputFromTask(annotationToolContext, previousTask).filter(
        (annotation) => !annotationContainsEmptyLabel(annotation, previousTask)
    );

    if (task?.domain === DOMAIN.CLASSIFICATION) {
        return output;
    }

    return output.filter(({ labels }) => {
        return labels.length > 0;
    });
};

interface LabelConflictPredicate {
    (label: Label, otherLabel: Label): boolean;
}
export const getLabelConflictPredicate = (tasks: Task[]): LabelConflictPredicate => {
    return (label: Label, otherLabel: Label) => {
        if (label.group === otherLabel.group) {
            return true;
        }

        if (isExclusive(label) || isExclusive(otherLabel)) {
            const task = tasks.find(({ labels }) => labels.some(({ id }) => id === label.id));
            const otherTask = tasks.find(({ labels }) => labels.some(({ id }) => id === otherLabel.id));

            return task?.id === otherTask?.id;
        }

        return false;
    };
};

export const getAnnotationsWithSelectedInput = (
    annotations: ReadonlyArray<Annotation>,
    inputAnnotations: ReadonlyArray<Annotation>
): ReadonlyArray<Annotation> => {
    const visibleInputAnnotations = inputAnnotations.filter(({ isHidden }) => !isHidden);

    const selectedInputAnnotations = visibleInputAnnotations.filter(({ isSelected }) => isSelected);

    if (visibleInputAnnotations.length === 0 || selectedInputAnnotations.length === 1) {
        return annotations;
    }

    if (selectedInputAnnotations.length === 0) {
        // Make sure that at least one of the inputs is selected, defaulting
        // to the last drawn visible input as this is most likely to not be annotated
        // TODO: first check if there is a partially annotated annotation so that this can be selected instead
        const lastAnnotation = visibleInputAnnotations[visibleInputAnnotations.length - 1];

        return annotations.map((annotation) => {
            if (annotation.id === lastAnnotation.id) {
                return { ...annotation, isSelected: true };
            }

            return annotation;
        });
    }

    // Deselect all annotations except the last one
    const lastAnnotation = selectedInputAnnotations[selectedInputAnnotations.length - 1];

    return annotations.map((annotation) => {
        const isSelectedInput =
            annotation.isSelected && selectedInputAnnotations.some(({ id }) => id === annotation.id);

        if (isSelectedInput) {
            return { ...annotation, isSelected: annotation.id === lastAnnotation.id };
        }

        return annotation;
    });
};

export const getSelectedInputAnnotations = (
    annotations: ReadonlyArray<Annotation>,
    inputAnnotations: ReadonlyArray<Annotation>
): ReadonlyArray<Annotation> => {
    return annotations.filter(({ isSelected, id }) => {
        return isSelected && inputAnnotations.some((annotation) => annotation.id === id);
    });
};

export const possiblyAddGlobalAnomalousShape = (
    shapes: Shape[],
    label: Label | null,
    existingAnnotations: ReadonlyArray<Annotation>,
    roi: { x: number; y: number; width: number; height: number } | undefined
): Shape[] => {
    if (roi === undefined || label === null || !isAnomalous(label)) {
        return shapes;
    }

    const containsAGlobalShape = shapes.some((shape) => {
        return hasEqualBoundingBox(roi, getBoundingBox(shape));
    });

    if (containsAGlobalShape) {
        return shapes;
    }

    const hasAnomalousGlobalAnnotation = existingAnnotations.some((annotation) => {
        if (!annotation.labels.some(({ id }) => label.id === id)) {
            return false;
        }

        return hasEqualBoundingBox(roi, getBoundingBox(annotation.shape));
    });

    if (hasAnomalousGlobalAnnotation) {
        return shapes;
    }

    // Add an extra global anomalous shape
    const globalAnomalousShape = { shapeType: ShapeType.Rect, ...roi } as const;
    return [globalAnomalousShape, ...shapes];
};

export const containsGlobalAnnotationWithLabel = (
    annotations: ReadonlyArray<Annotation>,
    label: Label,
    imageRoi: Shape | undefined
): boolean => {
    return annotations.some((annotation) => {
        if (!annotation.labels.some(({ id }) => id === label.id)) {
            return false;
        }

        return isEqual(annotation.shape, imageRoi);
    });
};
