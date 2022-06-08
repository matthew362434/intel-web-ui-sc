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

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Divider, Heading } from '@adobe/react-spectrum';
import { MutationStatus } from 'react-query';

import { LoadingIndicator } from '../../../../shared/components';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import classes from './invalid-annotations-dialog.module.scss';

interface ConfirmationDialogProps {
    onCancel: () => Promise<void>;
    onSubmit: () => Promise<void>;
    onDiscard: () => Promise<void>;
    submitAnnotationsMutation: UseSubmitAnnotationsMutationResult;
}

const SubmitButtonBody = ({ status }: { status: MutationStatus }) => {
    switch (status) {
        case 'loading':
            return (
                <>
                    <LoadingIndicator size='S' marginEnd='size-100' />
                    Submit
                </>
            );
        case 'error':
            return <>Try again</>;
        case 'success':
        case 'idle':
            return <>Submit</>;
    }
};

export const ConfirmationDialog = ({
    onCancel,
    onSubmit,
    onDiscard,
    submitAnnotationsMutation,
}: ConfirmationDialogProps): JSX.Element => (
    <DialogContainer onDismiss={onCancel} isDismissable={false}>
        <Dialog size='M'>
            <Heading>Discard or submit annotations</Heading>
            <Divider />
            <Content>
                Annotations in this image are not submitted. Discard or submit annotations.
                {submitAnnotationsMutation.error !== null ? (
                    <>
                        <br />
                        <span className={classes.savingError}>{submitAnnotationsMutation.error?.message}</span>
                    </>
                ) : (
                    <></>
                )}
            </Content>

            <ButtonGroup>
                <Button variant='secondary' onPress={onCancel} id='cancel-saving-confirmation'>
                    Cancel
                </Button>
                <Button variant='negative' onPress={onDiscard} id='discard-saving-confirmation'>
                    Discard
                </Button>
                <Button
                    variant='cta'
                    onPress={onSubmit}
                    isDisabled={submitAnnotationsMutation.isLoading}
                    id='submit-saving-confirmation'
                >
                    <SubmitButtonBody status={submitAnnotationsMutation.status} />
                </Button>
            </ButtonGroup>
        </Dialog>
    </DialogContainer>
);
