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
import { Annotation } from '../../../../core/annotations';
import { AnnotationToolContext } from '../../core';
import { PredictionListItem } from './prediction-list-item.component';
import classes from './prediction-list.module.scss';

interface PredictionListProps {
    annotations: ReadonlyArray<Annotation>;
    isRejected: (annotationId: string) => boolean;
    rejectAnnotation: (annotationId: string) => void;
    acceptAnnotation: (annotationId: string) => void;
    hoverAnnotation: (annotationId: string | null) => void;
    hideAnnotation: (annotationId: string) => void;
    showAnnotation: (annotationId: string) => void;
    annotationToolContext: AnnotationToolContext;
}

export const PredictionList = ({
    annotations,
    isRejected,
    rejectAnnotation,
    acceptAnnotation,
    hoverAnnotation,
    hideAnnotation,
    showAnnotation,
    annotationToolContext,
}: PredictionListProps): JSX.Element => {
    const onHoverEnd = () => {
        hoverAnnotation(null);
    };

    const onHoverStart = (annotation: Annotation) => {
        hoverAnnotation(annotation.id);
    };

    const onPressReject = (annotation: Annotation) => {
        const annotationIsRejected = isRejected(annotation.id);

        if (annotationIsRejected) {
            acceptAnnotation(annotation.id);
            showAnnotation(annotation.id);
        } else {
            rejectAnnotation(annotation.id);
            hideAnnotation(annotation.id);
        }
    };

    const onPressVisibility = (annotation: Annotation) => {
        if (annotation.isHidden) {
            showAnnotation(annotation.id);
        } else {
            hideAnnotation(annotation.id);
        }
    };

    return (
        <ul className={classes.predictionList} aria-label='Predicted annotations'>
            {annotations.map((annotation): JSX.Element => {
                return (
                    <PredictionListItem
                        key={annotation.id}
                        annotationToolContext={annotationToolContext}
                        annotation={annotation}
                        isRejected={isRejected(annotation.id)}
                        onHoverEnd={() => onHoverEnd()}
                        onHoverStart={() => onHoverStart(annotation)}
                        onPressReject={() => onPressReject(annotation)}
                        onPressVisibility={() => onPressVisibility(annotation)}
                    />
                );
            })}
        </ul>
    );
};
