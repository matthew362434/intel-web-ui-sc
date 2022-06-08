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

import { useDatasetImport } from '../dataset-import.provider.component';

export const DatasetImportItemDeletionDialog = (): JSX.Element => {
    const { deletingUpload, setDeletingUpload, removeUpload } = useDatasetImport();

    return (
        <DialogContainer onDismiss={() => setDeletingUpload(undefined)}>
            {!!deletingUpload && (
                <AlertDialog
                    title='Delete'
                    variant='destructive'
                    primaryActionLabel='Delete'
                    cancelLabel='Cancel'
                    onPrimaryAction={() => removeUpload(deletingUpload.fileId)}
                >
                    Are you sure you want to delete &quot;{deletingUpload.name}&quot;?
                </AlertDialog>
            )}
        </DialogContainer>
    );
};
