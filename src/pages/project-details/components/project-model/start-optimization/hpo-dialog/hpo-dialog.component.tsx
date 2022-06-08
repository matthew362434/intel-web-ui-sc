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
import { Dispatch, SetStateAction, useState } from 'react';

import { DialogContainer, Dialog, Content, ButtonGroup, Button, View, Divider, Text } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { useTrainModel } from '../../../../../../core/models/hooks';
import { ButtonWithLoading } from '../../../../../../shared/components';
import sharedClasses from '../../../../../../shared/shared.module.scss';
import { useProjectIdentifier } from '../../../../../annotator/hooks/use-project-identifier';
import { useProject } from '../../../../providers';
import { HPOTimeRatiosList } from '../../../project-models/train-model-dialog/train-configurable-parameters/train-hpo/hpo-time-ratios-list';
import { SupportedHPORatios } from '../../../project-models/train-model-dialog/use-training-state-value';
import { getTrainingBodyDTO } from '../../../project-models/train-model-dialog/utils';

interface HPODialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    modelTemplateId: string;
    taskId: string;
    handleOpenHPONotification: () => void;
}

export const HPODialog = ({
    isOpen,
    setIsOpen,
    modelTemplateId,
    taskId,
    handleOpenHPONotification,
}: HPODialogProps): JSX.Element => {
    const [selectedHPOTimeRatio, setSelectedHPOTimeRatio] = useState<SupportedHPORatios>(4);
    const { trainModel } = useTrainModel();

    const { workspaceId, projectId } = useProjectIdentifier();
    const {
        project: { datasets },
    } = useProject();
    const { isLoading } = trainModel;

    const handleOnDismiss = (): void => {
        setIsOpen(false);
        setSelectedHPOTimeRatio(4);
    };

    const handleHPOTimeRatio = (value: SupportedHPORatios): void => {
        setSelectedHPOTimeRatio(value);
    };

    const handleHPOTraining = (): void => {
        const trainBodyDTO = getTrainingBodyDTO({
            modelTemplateId,
            taskId,
            datasetId: datasets[0].id,
            hpoTimeRatio: selectedHPOTimeRatio,
            enableHyperParameterOptimization: true,
            trainFromScratch: false,
            configParameters: undefined,
            enablePOTOpt: false,
        });

        trainModel.mutate(
            { workspaceId, projectId, body: trainBodyDTO },
            {
                onSuccess: () => {
                    handleOnDismiss();
                    handleOpenHPONotification();
                },
            }
        );
    };

    return (
        <DialogContainer onDismiss={handleOnDismiss}>
            {isOpen && (
                <Dialog>
                    <Heading>Improve Accuracy (HPO)</Heading>
                    <Divider size={'S'} />
                    <Content
                        UNSAFE_className={[
                            sharedClasses.dialogContent,
                            isLoading ? sharedClasses.contentDisabled : '',
                        ].join(' ')}
                        data-testid={'hpo-dialog-open-id'}
                    >
                        <View paddingX={'size-300'} paddingY={'size-250'}>
                            <Text id={'hpo-title-id'}>
                                Improve accuracy by finding the best training parameters using HPO
                            </Text>
                            <HPOTimeRatiosList
                                selectedHPOTimeRatio={selectedHPOTimeRatio}
                                handleHPOTimeRatio={handleHPOTimeRatio}
                            />
                        </View>
                    </Content>
                    <ButtonGroup>
                        <Button variant={'secondary'} onPress={handleOnDismiss}>
                            Cancel
                        </Button>
                        <ButtonWithLoading isDisabled={isLoading} isLoading={isLoading} onPress={handleHPOTraining}>
                            Start
                        </ButtonWithLoading>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogContainer>
    );
};
