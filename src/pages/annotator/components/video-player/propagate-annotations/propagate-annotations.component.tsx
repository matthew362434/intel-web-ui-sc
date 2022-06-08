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

import { DialogTrigger } from '@adobe/react-spectrum';
import { UseMutationResult } from 'react-query';

import { PropagateAnnotationsButton } from './propagate-annotations-button.component';
import { PropagateAnnotationsDialog } from './propagate-annotations-dialog.component';

interface PropagateAnnotationsProps {
    isDisabled: boolean;
    showReplaceOrMergeDialog: boolean;
    propagateAnnotationsMutation: UseMutationResult<void, unknown, boolean, unknown>;
}

export const PropagateAnnotations = ({
    isDisabled,
    showReplaceOrMergeDialog,
    propagateAnnotationsMutation,
}: PropagateAnnotationsProps): JSX.Element => {
    if (!showReplaceOrMergeDialog) {
        return (
            <PropagateAnnotationsButton
                isDisabled={isDisabled || propagateAnnotationsMutation.isLoading}
                onPress={() => propagateAnnotationsMutation.mutate(false)}
            />
        );
    }

    return (
        <DialogTrigger>
            <PropagateAnnotationsButton isDisabled={isDisabled} />

            {(close) => (
                <PropagateAnnotationsDialog close={close} propagateAnnotationsMutation={propagateAnnotationsMutation} />
            )}
        </DialogTrigger>
    );
};
