// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import values from 'lodash/values';

import { Annotation, AnnotationLabel } from '../../../../core/annotations';
import { recursivelyAddLabel } from '../../../../core/labels/label-resolver';
import { useProject } from '../../../project-details/providers';
import { getLabelConflictPredicate } from '../task-chain-provider/utils';

interface MergeAnnotations {
    (newAnnotations: ReadonlyArray<Annotation>, oldAnnotations: ReadonlyArray<Annotation>): Annotation[];
}

// This hook returns a function that allows us to merge annotations recursively if the
// new annotations contain annotations with the same id as an old annotation, then the
// shape will be replaced and labels will be merged
export const useMergeAnnotations = (): MergeAnnotations => {
    const { project } = useProject();

    const mergeAnnotation = (originalAnnotation: Annotation, newAnnotation: Annotation) => {
        const conflictPredicate = getLabelConflictPredicate(project.tasks);
        const mergedLabels = newAnnotation.labels.reduce<ReadonlyArray<AnnotationLabel>>((labels, label) => {
            return recursivelyAddLabel(
                labels,
                label,
                project.labels,
                conflictPredicate
            ) as ReadonlyArray<AnnotationLabel>;
        }, originalAnnotation.labels);

        return {
            ...originalAnnotation,
            shape: newAnnotation.shape,
            labels: mergedLabels,
        };
    };

    const mergeAnnotations = (newAnnotations: ReadonlyArray<Annotation>, oldAnnotations: ReadonlyArray<Annotation>) => {
        // Prepare a map that includes the current input and output annotations from the user
        const results: Record<string, Annotation> = oldAnnotations.reduce((a, x) => ({ ...a, [x.id]: x }), {});

        // Merge (or add) the new annotations into the results map
        newAnnotations.forEach((annotation) => {
            const oldAnnotation = oldAnnotations.find(({ id }) => id === annotation.id);

            if (oldAnnotation === undefined) {
                results[annotation.id] = annotation;
                return;
            }

            results[annotation.id] = mergeAnnotation(results[annotation.id], annotation);
        });

        return values(results);
    };

    return mergeAnnotations;
};
