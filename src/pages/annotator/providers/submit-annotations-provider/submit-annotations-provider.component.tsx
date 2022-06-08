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

import { createContext, useContext, ReactNode, useCallback, useState } from 'react';

import isFunction from 'lodash/isFunction';

import { Annotation } from '../../../../core/annotations';
import { SelectedMediaItem } from '../../../../core/media';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { Dialogs } from '../../components/submit-annotations/dialogs.component';
import { UseSubmitAnnotationsMutationResult } from './submit-annotations.interface';
import { shouldSaveAnnotations, useSubmitAnnotationsMutation } from './utils';

type UnfinishedShapesCallback = (() => Annotation[]) | null;

interface SubmitAnnotationsContextProps {
    setUnfinishedShapeCallback: (callback: UnfinishedShapesCallback) => void;
    submitAnnotationsMutation: UseSubmitAnnotationsMutationResult;
    confirmSaveAnnotations: (callback?: () => Promise<void>) => Promise<void>;
}

const SubmitAnnotationsContext = createContext<SubmitAnnotationsContextProps | undefined>(undefined);
export interface SubmitAnnotationsProviderProps {
    children: ReactNode;
    annotations: ReadonlyArray<Annotation>;
    currentMediaItem: SelectedMediaItem | undefined;
    saveAnnotations: (annotations: ReadonlyArray<Annotation>) => Promise<void>;
}

// Allows the user to save their annotations and select another media item to annotate
// if saving is not possible due to an error or invalid annotations we show a dialog
// and allow the user to either try again or edit their annotations
export const SubmitAnnotationsProvider = ({
    saveAnnotations,
    annotations: userAnnotations,
    currentMediaItem,
    children,
}: SubmitAnnotationsProviderProps): JSX.Element => {
    const hasInvalidAnnotations = userAnnotations.some(({ labels }) => labels.length === 0);

    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [showFailDialog, setShowFailDialog] = useState(false);

    const mediaItem = currentMediaItem;

    const { submitAnnotationsMutation, afterSaving, unfinishedShapesCallback, callCallbackAndClear } =
        useSubmitAnnotationsMutation(
            mediaItem,
            userAnnotations,
            setShowFailDialog,
            setShowConfirmationDialog,
            saveAnnotations
        );

    const confirmSaveAnnotations = useCallback(
        async (callback?: () => Promise<void>) => {
            if (isFunction(callback)) {
                afterSaving.current = callback;
            }

            const annotations = isFunction(unfinishedShapesCallback.current)
                ? unfinishedShapesCallback.current()
                : userAnnotations;

            const containsChanges = shouldSaveAnnotations(mediaItem, annotations);

            if (containsChanges) {
                setShowConfirmationDialog(true);

                return;
            }

            callCallbackAndClear();
        },
        [
            userAnnotations,
            setShowConfirmationDialog,
            callCallbackAndClear,
            afterSaving,
            mediaItem,
            unfinishedShapesCallback,
        ]
    );

    // For the confirmation dialog
    const discard = useCallback(async () => {
        callCallbackAndClear();

        setShowConfirmationDialog(false);
        setShowFailDialog(false);
    }, [callCallbackAndClear]);

    const submit = useCallback(async () => {
        const annotations = isFunction(unfinishedShapesCallback.current)
            ? unfinishedShapesCallback.current()
            : userAnnotations;

        submitAnnotationsMutation.mutate({ annotations });
    }, [submitAnnotationsMutation, userAnnotations, unfinishedShapesCallback]);

    const cancel = useCallback(async () => {
        afterSaving.current = undefined;
        submitAnnotationsMutation.reset();

        setShowConfirmationDialog(false);
        setShowFailDialog(false);
    }, [submitAnnotationsMutation, afterSaving]);

    const value = {
        setUnfinishedShapeCallback: (callback: UnfinishedShapesCallback) => {
            unfinishedShapesCallback.current = callback;
        },
        submitAnnotationsMutation,
        confirmSaveAnnotations,
    };

    return (
        <SubmitAnnotationsContext.Provider value={value}>
            {children}
            <Dialogs
                annotations={userAnnotations}
                cancel={cancel}
                discard={discard}
                hasInvalidAnnotations={hasInvalidAnnotations}
                submitAnnotationsMutation={submitAnnotationsMutation}
                showConfirmationDialog={showConfirmationDialog}
                showFailDialog={showFailDialog}
                submit={submit}
            />
        </SubmitAnnotationsContext.Provider>
    );
};

export const useSubmitAnnotations = (): SubmitAnnotationsContextProps => {
    const context = useContext(SubmitAnnotationsContext);

    if (context === undefined) {
        throw new MissingProviderError('useSubmitAnnotations', 'SubmitAnnotationsProvider');
    }

    return context;
};
