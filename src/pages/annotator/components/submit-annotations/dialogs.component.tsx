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
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { ConfirmationDialog } from './confirmation-dialog.component';
import { InvalidAnnotationsDialog } from './invalid-annotations-dialog.component';
import { SavingFailedDialog } from './saving-failed-dialog.component';

interface DialogsProps {
    annotations: ReadonlyArray<Annotation>;
    cancel: () => Promise<void>;
    discard: () => Promise<void>;
    submit: () => Promise<void>;
    hasInvalidAnnotations: boolean;
    showConfirmationDialog: boolean;
    showFailDialog: boolean;
    submitAnnotationsMutation: UseSubmitAnnotationsMutationResult;
}

export const Dialogs = ({
    annotations,
    cancel,
    discard,
    hasInvalidAnnotations,
    submitAnnotationsMutation,
    showConfirmationDialog,
    showFailDialog,
    submit,
}: DialogsProps): JSX.Element => {
    if (showFailDialog && hasInvalidAnnotations) {
        return (
            <InvalidAnnotationsDialog
                cancel={cancel}
                submitAnnotationsMutation={submitAnnotationsMutation}
                saveOnlyValidAnnotations={async () => {
                    const validAnnotations = annotations.filter(({ labels }) => labels.length > 0);

                    submitAnnotationsMutation.mutate({ annotations: validAnnotations });
                }}
            />
        );
    }

    if (showConfirmationDialog) {
        return (
            <ConfirmationDialog
                onCancel={cancel}
                onDiscard={discard}
                onSubmit={submit}
                submitAnnotationsMutation={submitAnnotationsMutation}
            />
        );
    }

    if (submitAnnotationsMutation.isError) {
        return (
            <SavingFailedDialog
                submitAnnotationsMutation={submitAnnotationsMutation}
                cancel={cancel}
                retry={() => {
                    submitAnnotationsMutation.mutate({});
                }}
            />
        );
    }

    return <></>;
};
