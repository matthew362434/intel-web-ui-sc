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

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Divider, Flex, Text } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';
import { PressEvent } from '@react-types/shared';

import { InfoOutline } from '../../assets/icons';
import { DOMAIN } from '../../core/projects';
import { LoadingIndicator } from '../../shared/components';
import { InfoSection } from './components/info-section/info-section.component';
import { MIN_NUMBER_OF_LABELS_FOR_CLASSIFICATION } from './components/project-labels-management/task-labels-management/task-labels-management.component';
import { useNewProjectDialog } from './new-project-dialog-provider';

interface NewProjectDialogProps {
    buttonText: string;
}

export const NewProjectDialog = ({ buttonText }: NewProjectDialogProps): JSX.Element => {
    const {
        save,
        isLoading,
        hasNextStep,
        hasPreviousStep,
        goToNextStep,
        goToPreviousStep,
        resetSteps,
        content,
        isValid,
    } = useNewProjectDialog();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Content (<ProjectLabelsManagement />) gets the correct "selectedDomain" as props
    const showClassificationInfo = content.props.selectedDomain === DOMAIN.CLASSIFICATION && !hasNextStep;

    const handleOpenDialog = (): void => {
        setIsOpen(true);
    };

    const handleCloseDialog = (): void => {
        setIsOpen(false);
    };

    const handleOnDismiss = (): void => {
        resetSteps();
        handleCloseDialog();
    };

    const create = (_e: PressEvent) => {
        save();
    };

    return (
        <>
            <Button
                variant={'primary'}
                id={'create-new-project-button'}
                UNSAFE_style={{ padding: '3px' }}
                onPress={handleOpenDialog}
            >
                <Text marginX={'size-100'}>{buttonText}</Text>
            </Button>

            <DialogContainer onDismiss={handleOnDismiss}>
                {isOpen && (
                    <Dialog height='100%' minWidth={'90rem'}>
                        <Heading id={'create-new-project-id'}>Create new project</Heading>

                        <Divider />

                        <Content UNSAFE_style={{ overflow: 'hidden' }}>
                            {content}
                            {showClassificationInfo ? (
                                <InfoSection
                                    icon={<InfoOutline />}
                                    message={`Classification projects require at least
                                        ${MIN_NUMBER_OF_LABELS_FOR_CLASSIFICATION} labels.`}
                                />
                            ) : null}
                        </Content>

                        <ButtonGroup>
                            <Button variant={'secondary'} onPress={handleOnDismiss} id={'cancel-new-project-button'}>
                                Cancel
                            </Button>

                            {hasPreviousStep && (
                                <Button id='back-new-project-button' variant={'secondary'} onPress={goToPreviousStep}>
                                    Back
                                </Button>
                            )}
                            {hasNextStep && (
                                <Button
                                    id='next-new-project-button'
                                    variant={'primary'}
                                    isDisabled={!isValid}
                                    onPress={goToNextStep}
                                >
                                    Next
                                </Button>
                            )}
                            {!hasNextStep && (
                                <Button
                                    id='confirm-create-new-project-button'
                                    variant={'cta'}
                                    type='submit'
                                    isDisabled={!isValid || isLoading}
                                    onPress={create}
                                    position={'relative'}
                                >
                                    <Flex alignItems={'center'} gap={'size-65'}>
                                        {isLoading ? <LoadingIndicator size={'S'} /> : <></>}
                                        <Text>Create</Text>
                                    </Flex>
                                </Button>
                            )}
                        </ButtonGroup>
                    </Dialog>
                )}
            </DialogContainer>
        </>
    );
};
