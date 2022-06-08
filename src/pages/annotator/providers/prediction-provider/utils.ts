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

import { Annotation } from '../../../../core/annotations';
import { AnnotationScene } from '../../core';

export const minimalThresholdPercentage = (annotations: ReadonlyArray<Annotation>): number => {
    const scores = annotations.flatMap(({ labels }) => {
        return labels.map((label) => {
            return label.score !== undefined ? label.score : 1.0;
        });
    });

    return 100 * Math.min(...scores);
};

const hasLabelWithScoreAboveThreshold = (annotation: Annotation, scoreThreshold: number) => {
    return annotation.labels.some((label) => label.score !== undefined && 100 * label.score > scoreThreshold);
};

interface UsePredictionFilter {
    (annotations: ReadonlyArray<Annotation>, predictionScene: AnnotationScene): readonly [
        string[],
        (annotationId: string) => void,
        (annotationId: string) => void,
        number,
        (scoreThreshold: number) => void
    ];
}

// TODO: make task chain aware
export const usePredictionFilter: UsePredictionFilter = (annotations, scene) => {
    const { showAnnotation, hideAnnotation } = scene;
    const [scoreThreshold, setScoreThreshold] = useState(() => minimalThresholdPercentage(annotations));
    const [rejectedAnnotations, setRejectedAnnotations] = useState<string[]>([]);

    useEffect(() => {
        setRejectedAnnotations([]);
        setScoreThreshold(minimalThresholdPercentage(annotations));
    }, [annotations]);

    const setScoreThresholdAndRejectAnnotations = (newScoreThreshold: number) => {
        setScoreThreshold(newScoreThreshold);
        setRejectedAnnotations(
            annotations
                .filter((annotation) => !hasLabelWithScoreAboveThreshold(annotation, newScoreThreshold))
                .map((annotation) => annotation.id)
        );
    };

    const acceptAnnotation = (annotationId: string) => {
        setRejectedAnnotations((oldRejectedAnnotations) => oldRejectedAnnotations.filter((id) => id !== annotationId));
        showAnnotation(annotationId);
    };

    const rejectAnnotation = (annotationId: string) => {
        hideAnnotation(annotationId);
        setRejectedAnnotations((oldRejectedAnnotations) => {
            return oldRejectedAnnotations.includes(annotationId)
                ? oldRejectedAnnotations
                : [...oldRejectedAnnotations, annotationId];
        });
    };

    return [
        rejectedAnnotations,
        acceptAnnotation,
        rejectAnnotation,
        scoreThreshold,
        setScoreThresholdAndRejectAnnotations,
    ] as const;
};
