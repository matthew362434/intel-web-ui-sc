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

import { AlertDialog, DialogContainer } from '@adobe/react-spectrum';
import { OverlayTriggerState } from '@react-stately/overlays';

export const DeleteDatasetDialog = ({
    triggerState,
    onAction,
}: {
    triggerState: OverlayTriggerState;
    onAction: () => void;
}) => (
    <DialogContainer onDismiss={() => triggerState.close()}>
        {triggerState.isOpen && (
            <AlertDialog
                title='Delete all media'
                variant='destructive'
                primaryActionLabel='Confirm'
                onPrimaryAction={() => {
                    triggerState.close();
                    onAction();
                }}
                cancelLabel={'Cancel'}
            >
                Are you sure you want to delete all media for the currently selected dataset?
            </AlertDialog>
        )}
    </DialogContainer>
);
