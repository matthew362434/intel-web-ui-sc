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
import { useState } from 'react';

import { ActionButton } from '@adobe/react-spectrum';

import { useDeleteJob } from '../../../../../../../core/jobs/hooks/use-delete-job.hook';
import { useApplicationContext } from '../../../../../../../providers';
import { CustomAlertDialog } from '../../../../../alert-dialog/custom-alert-dialog.component';
import { LoadingIndicator } from '../../../../../loading';
import classes from './discard-button.module.scss';

export enum DISCARD {
    CANCEL = 'Cancel',
    DELETE = 'Delete',
}

interface DiscardButtonProps {
    discardType: DISCARD;
    jobId: string;
    jobMessage: string;
}

export const DiscardButton = ({ discardType, jobId, jobMessage }: DiscardButtonProps): JSX.Element => {
    const { deleteJob } = useDeleteJob();
    const { workspaceId } = useApplicationContext();
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const deleteTheJob = () => {
        deleteJob.mutate({ workspaceId: workspaceId, jobId: jobId });
    };

    const onPressHandler = () => {
        if (discardType === DISCARD.CANCEL) {
            setDialogOpen(true);
        } else {
            deleteTheJob();
        }
    };

    return (
        <>
            <CustomAlertDialog
                title={`Confirmation of job deletion`}
                message={`Do you want to cancel ${jobMessage}?`}
                cancelLabel={'Back'}
                primaryActionLabel={'Cancel the job'}
                onPrimaryAction={deleteTheJob}
                open={dialogOpen}
                setOpen={setDialogOpen}
            />
            <ActionButton
                id={`job-discard-${jobId}-id`}
                isQuiet
                minWidth='max-content'
                UNSAFE_className={classes.button}
                onPress={onPressHandler}
            >
                {deleteJob.isLoading ? <LoadingIndicator size={'S'} marginX={'size-100'} /> : <></>}
                {discardType}
            </ActionButton>
        </>
    );
};
