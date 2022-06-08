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

import { useEffect, useRef } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { Annotation, labelFromUser, Shape } from '../../../../core/annotations';
import { Label, recursivelyAddLabel, recursivelyRemoveLabels } from '../../../../core/labels';
import { AnnotationScene, UndoRedoActions } from '../../core';
import useUndoRedoState from '../../tools/undo-redo/use-undo-redo-state';
import { getLabeledShape } from '../../utils';

export const useAnnotationSceneState = (
    initialAnnotations: ReadonlyArray<Annotation>,
    labels: ReadonlyArray<Label>
): AnnotationScene & { undoRedoActions: UndoRedoActions } => {
    const [annotations, setAnnotations, undoRedoActions] = useUndoRedoState(initialAnnotations);
    const resetAnnotations = undoRedoActions.reset;
    const hasShapePointSelected = useRef(false);

    useEffect(() => resetAnnotations(initialAnnotations), [initialAnnotations, resetAnnotations]);

    const addShapes = (
        shapes: Shape[],
        label?: Label | null,
        isSelected = true,
        conflictPredicate?: (label: Label, otherLabel: Label) => boolean
    ): Annotation[] => {
        const newAnnotations: Annotation[] = shapes.map((shape, idx) => {
            const defaultLabels = label ? recursivelyAddLabel([], label, labels, conflictPredicate) : [];
            const annotationLabels = defaultLabels.map((annotationLabel) => labelFromUser(annotationLabel));

            return getLabeledShape(uuidv4(), shape, annotationLabels, isSelected, annotations.length + idx);
        });

        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return [...prevAnnotations, ...newAnnotations];
        });

        return newAnnotations;
    };

    const addAnnotations = (newAnnotations: Annotation[]) => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return [
                ...prevAnnotations.map((annotation) => {
                    return {
                        ...annotation,
                        isSelected: false,
                    };
                }),
                ...newAnnotations,
            ];
        });
    };

    const removeAnnotations = (predicate: Annotation[], skipHistory = false): void => {
        const ids = predicate.map(({ id }) => id);

        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return prevAnnotations.filter(({ id }) => !ids.includes(id));
        }, skipHistory);
    };

    const updateAnnotation = (annotation: Annotation): void => {
        setAnnotations((oldAnnotations: ReadonlyArray<Annotation>) => {
            return oldAnnotations.map((oldAnnotation: Annotation) => {
                return oldAnnotation.id === annotation.id ? annotation : oldAnnotation;
            });
        });
    };

    const replaceAnnotations = (newAnnotations: Annotation[], skipHistory = false): void => {
        setAnnotations(() => newAnnotations, skipHistory);
    };

    const addLabel = (
        label: Label,
        annotationIds: string[],
        conflictPredicate?: (label: Label, otherLabel: Label) => boolean
    ): void => {
        setAnnotations((newAnnotations: ReadonlyArray<Annotation>) => {
            return newAnnotations.map((annotation: Annotation) => {
                if (!annotationIds.includes(annotation.id)) {
                    return annotation;
                }

                const annotationLabels = recursivelyAddLabel(annotation.labels, label, labels, conflictPredicate).map(
                    (annotationLabel) => labelFromUser(annotationLabel)
                );

                return {
                    ...annotation,
                    labels: annotationLabels,
                };
            });
        });
    };

    const removeLabels = (labelToBeRemoved: Label[], annotationIds: string[], skipHistory = false): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return prevAnnotations.map((annotation: Annotation) => {
                if (!annotationIds.includes(annotation.id)) {
                    return annotation;
                }

                const annotationLabels = recursivelyRemoveLabels(annotation.labels, labelToBeRemoved).map(
                    (annotationLabel) => labelFromUser(annotationLabel)
                );

                return {
                    ...annotation,
                    labels: annotationLabels,
                };
            });
        }, skipHistory);
    };

    const hoverAnnotation = (annotationId: string | null): void => {
        setAnnotations(
            (prevAnnotations: ReadonlyArray<Annotation>) =>
                prevAnnotations.map((annotation) => ({ ...annotation, isHovered: annotation.id === annotationId })),
            true
        );
    };

    const selectAnnotation = (annotationId: string): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            const newAnnotations = prevAnnotations.map((annotation: Annotation) =>
                annotation.id === annotationId ? { ...annotation, isSelected: true } : annotation
            );

            return newAnnotations;
        }, true);
    };

    const setSelectedAnnotations = (predicate: (annotation: Annotation) => boolean): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return prevAnnotations.map((annotation: Annotation) => {
                const isSelected = predicate(annotation);

                if (isSelected !== annotation.isSelected) {
                    return { ...annotation, isSelected };
                }

                return annotation;
            });
        }, true);
    };

    const setLockedAnnotations = (predicate: (annotation: Annotation) => boolean): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return prevAnnotations.map((annotation: Annotation) => {
                const isLocked = predicate(annotation);

                if (isLocked !== annotation.isLocked) {
                    return { ...annotation, isLocked };
                }

                return annotation;
            });
        }, true);
    };

    const setHiddenAnnotations = (predicate: (annotation: Annotation) => boolean): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            return prevAnnotations.map((annotation: Annotation) => {
                const isHidden = predicate(annotation);

                if (isHidden !== annotation.isHidden) {
                    return { ...annotation, isHidden };
                }

                return annotation;
            });
        }, true);
    };

    const unselectAnnotation = (annotationId: string): void => {
        setAnnotations((prevAnnotations: ReadonlyArray<Annotation>) => {
            const newAnnotations = prevAnnotations.map((annotation: Annotation) =>
                annotation.id === annotationId ? { ...annotation, isSelected: false } : annotation
            );

            return newAnnotations;
        }, true);
    };

    const toggleLock = (shouldLock: boolean, annotationId: string): void => {
        setAnnotations(
            (prevAnnotations: ReadonlyArray<Annotation>) =>
                prevAnnotations.map((annotation) => {
                    if (annotation.id === annotationId) {
                        return { ...annotation, isLocked: shouldLock };
                    }

                    return annotation;
                }),
            true
        );
    };

    const hideAnnotation = (annotationId: string): void => {
        setAnnotations(
            (prevAnnotations: ReadonlyArray<Annotation>) =>
                prevAnnotations.map((annotation) => {
                    if (annotation.id === annotationId) {
                        return { ...annotation, isHidden: true };
                    }

                    return annotation;
                }),
            true
        );
    };

    const showAnnotation = (annotationId: string): void => {
        setAnnotations(
            (prevAnnotations: ReadonlyArray<Annotation>) =>
                prevAnnotations.map((annotation) => {
                    if (annotation.id === annotationId) {
                        return { ...annotation, isHidden: false };
                    }

                    return annotation;
                }),
            true
        );
    };

    const allAnnotationsHidden = !annotations.find((annotation: Annotation) => !annotation.isHidden);

    return {
        annotations,
        labels,

        addShapes,

        addLabel,
        allAnnotationsHidden,

        removeLabels,
        addAnnotations,
        removeAnnotations,
        updateAnnotation,
        replaceAnnotations,

        hoverAnnotation,

        setSelectedAnnotations,
        setLockedAnnotations,
        setHiddenAnnotations,

        selectAnnotation,
        unselectAnnotation,

        toggleLock,

        hideAnnotation,
        showAnnotation,
        hasShapePointSelected,

        undoRedoActions,
    };
};
