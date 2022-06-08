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

import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Flex,
    Form,
    Heading,
    Text,
} from '@adobe/react-spectrum';

import { useTrainModel } from '../../../../../core/models/hooks';
import { ButtonWithLoading } from '../../../../../shared/components';
import sharedClasses from '../../../../../shared/shared.module.scss';
import { useProjectIdentifier } from '../../../../annotator/hooks/use-project-identifier';
import classes from './train-model-dialog.module.scss';
import { TrainingSteps, useTrainStateValue } from './use-training-state-value';

interface TrainModelDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    handleOnSuccess?: () => void;
}

export const TrainModelDialog = (props: TrainModelDialogProps): JSX.Element => {
    const { isOpen, handleClose, handleOnSuccess } = props;
    const { trainModel } = useTrainModel();

    const { workspaceId, projectId } = useProjectIdentifier();

    const {
        currentStep: { title, description, stepNumber, key },
        showNextButton,
        showBackButton,
        nextAction,
        prevAction,
        trainingBodyDTO,
        handleDefaultStateOnClose,
        renderCurrentStep,
    } = useTrainStateValue();

    const isConfigParamsStep = key === TrainingSteps.CONFIGURABLE_PARAMETERS;

    const handleOnDismiss = (): void => {
        handleClose();
        handleDefaultStateOnClose();
    };

    const handleSubmit = (): void => {
        trainModel.mutate(
            { workspaceId, projectId, body: trainingBodyDTO },
            {
                onSuccess: () => {
                    handleOnDismiss();
                    handleOnSuccess && handleOnSuccess();
                },
            }
        );
    };

    return (
        <>
            <DialogContainer onDismiss={handleOnDismiss}>
                {isOpen && (
                    <Dialog width={'94rem'} maxHeight={'64rem'} height={isConfigParamsStep ? '64rem' : ''}>
                        <Heading>
                            <Flex direction={'column'}>
                                {title}
                                <Flex
                                    justifyContent={'space-between'}
                                    alignItems={'center'}
                                    UNSAFE_className={classes.trainingDialogDescription}
                                >
                                    <Text marginTop={'size-50'}>{description}</Text>
                                    {stepNumber && (
                                        <Text UNSAFE_className={classes.trainingDialogStepNumber}>
                                            {stepNumber} of 2
                                        </Text>
                                    )}
                                </Flex>
                            </Flex>
                        </Heading>
                        <Divider marginBottom={'size-100'} />
                        <Content
                            UNSAFE_className={[
                                classes.trainingDialogContent,
                                trainModel.isLoading ? sharedClasses.contentDisabled : '',
                            ].join(' ')}
                        >
                            <Form height={isConfigParamsStep ? '100%' : 'auto'}>
                                <>{renderCurrentStep(key)}</>
                            </Form>
                        </Content>
                        <ButtonGroup UNSAFE_className={classes.buttonGroup}>
                            <Button
                                variant={'secondary'}
                                onPress={handleOnDismiss}
                                id={'cancel-button-id'}
                                isDisabled={trainModel.isLoading}
                            >
                                Cancel
                            </Button>
                            {showBackButton && (
                                <Button
                                    variant={'primary'}
                                    onPress={prevAction}
                                    id={'back-button-id'}
                                    isDisabled={trainModel.isLoading}
                                >
                                    Back
                                </Button>
                            )}
                            {showNextButton ? (
                                <Button variant={'primary'} onPress={nextAction} id={'next-button-id'}>
                                    Next
                                </Button>
                            ) : (
                                <ButtonWithLoading
                                    isLoading={trainModel.isLoading}
                                    isDisabled={trainModel.isLoading}
                                    id={'start-button-id'}
                                    onPress={handleSubmit}
                                >
                                    Start
                                </ButtonWithLoading>
                            )}
                        </ButtonGroup>
                    </Dialog>
                )}
            </DialogContainer>
        </>
    );
};
