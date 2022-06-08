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

import { MutableRefObject, useCallback, useRef } from 'react';

import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import { useMutation } from 'react-query';

import { Annotation, getAnnotationStateForTask } from '../../../../core/annotations';
import { MEDIA_ANNOTATION_STATUS, SelectedMediaItem } from '../../../../core/media';
import { UseSubmitAnnotationsMutationResult } from './submit-annotations.interface';

export const shouldSaveAnnotations = (
    mediaItem: SelectedMediaItem | undefined,
    annotations: ReadonlyArray<Annotation>
): boolean => {
    if (mediaItem === undefined) {
        return false;
    }

    // We don't care if the user has selected, hovered, hidden or locked the annotation
    const withoutInteractions = (annotation: Annotation) => {
        return {
            id: annotation.id,
            shape: annotation.shape,
            labels: annotation.labels,
            zIndex: annotation.zIndex,
        };
    };

    return !isEqual(mediaItem.annotations.map(withoutInteractions), annotations.map(withoutInteractions));
};

// If the specific annotations have been provided, which may happen in case the
// user has chosen to remove invalid annotations or add empty annotations, use
// these otherwise the user's (unfinished) annotations are used.
const getAnnotationsToSave = (
    annotations: undefined | ReadonlyArray<Annotation>,
    userAnnotations: ReadonlyArray<Annotation>,
    unfinishedShapesCallback: UnfinishedShapesCallback
) => {
    if (annotations !== undefined) {
        return annotations;
    }

    return isFunction(unfinishedShapesCallback) ? unfinishedShapesCallback() : userAnnotations;
};

type UnfinishedShapesCallback = (() => Annotation[]) | null;
interface UseSubmitAnnotationsMutation {
    submitAnnotationsMutation: UseSubmitAnnotationsMutationResult;
    afterSaving: MutableRefObject<(() => Promise<void>) | undefined>;
    unfinishedShapesCallback: MutableRefObject<UnfinishedShapesCallback>;
    callCallbackAndClear: () => void;
}
export const useSubmitAnnotationsMutation = (
    mediaItem: SelectedMediaItem | undefined,
    userAnnotations: ReadonlyArray<Annotation>,
    setShowFailDialog: (showFailDialog: boolean) => void,
    setShowConfirmationDialog: (showConfirmationDialog: boolean) => void,
    saveAnnotations: (annotations: ReadonlyArray<Annotation>) => Promise<void>
): UseSubmitAnnotationsMutation => {
    // This callback is used to return a user's unfinished annotations, which
    // is used by object selection and object coloring
    const unfinishedShapesCallback = useRef<UnfinishedShapesCallback>(null);

    const afterSaving = useRef<() => Promise<void>>();

    const hasLabelsToRevisit =
        getAnnotationStateForTask(mediaItem?.annotationStatePerTask) === MEDIA_ANNOTATION_STATUS.TO_REVISIT;

    const callCallbackAndClear = useCallback(() => {
        if (afterSaving.current) {
            const callback = afterSaving.current;

            afterSaving.current = undefined;

            callback();
        }
    }, []);

    const submitAnnotationsMutation = useMutation({
        mutationFn: async ({
            annotations,
            callback,
        }: {
            annotations?: ReadonlyArray<Annotation>;
            callback?: () => Promise<void>;
        }) => {
            const annotationsToSave = getAnnotationsToSave(
                annotations,
                userAnnotations,
                unfinishedShapesCallback.current
            );

            if (callback !== undefined) {
                afterSaving.current = callback;
            }

            const hasInvalidAnnotations = annotationsToSave.some(({ labels }) => labels.length === 0);

            if (hasInvalidAnnotations) {
                setShowFailDialog(true);

                return;
            }

            const containsChanges = shouldSaveAnnotations(mediaItem, annotationsToSave);

            if (containsChanges || hasLabelsToRevisit) {
                await saveAnnotations(annotationsToSave);
            }

            callCallbackAndClear();
            setShowConfirmationDialog(false);
            setShowFailDialog(false);
        },

        // This empty function is used so that react query can infer the Error type
        onError: (_error: { error_code: string; http_status: number; message: string }) => {
            return;
        },
    });

    return {
        submitAnnotationsMutation,
        afterSaving,
        unfinishedShapesCallback,
        callCallbackAndClear,
    };
};
