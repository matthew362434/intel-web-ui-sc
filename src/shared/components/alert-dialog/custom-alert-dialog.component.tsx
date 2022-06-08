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
import { Dispatch, SetStateAction } from 'react';

import { AlertDialog, DialogContainer, Provider } from '@adobe/react-spectrum';

interface CustomAlertDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onPrimaryAction: () => void;
    title: string;
    primaryActionLabel: string;
    cancelLabel: string;
    message: string;
}

export const CustomAlertDialog = ({
    open,
    setOpen,
    onPrimaryAction,
    title,
    message,
    primaryActionLabel,
    cancelLabel,
}: CustomAlertDialogProps): JSX.Element => (
    <Provider isQuiet={false}>
        <DialogContainer onDismiss={() => setOpen(false)}>
            {open && (
                <AlertDialog
                    title={title}
                    primaryActionLabel={primaryActionLabel}
                    variant='destructive'
                    cancelLabel={cancelLabel}
                    onPrimaryAction={onPrimaryAction}
                >
                    {message}
                </AlertDialog>
            )}
        </DialogContainer>
    </Provider>
);
