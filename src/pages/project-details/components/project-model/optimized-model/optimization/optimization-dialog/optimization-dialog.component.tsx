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
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import {
    ActionButton,
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Flex,
    Heading,
    Text,
} from '@adobe/react-spectrum';
import { useQueryClient } from 'react-query';

import { InfoOutline } from '../../../../../../../assets/icons';
import { OptimizeModelDTO } from '../../../../../../../core/models/dtos/optimize-model.interface';
import { useOptimizeModel } from '../../../../../../../core/models/hooks';
import QUERY_KEYS from '../../../../../../../core/requests/query-keys';
import { useModelIdentifier } from '../../../../../../../hooks';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../../../notification';
import { ButtonWithTooltip, LoadingIndicator } from '../../../../../../../shared/components';
import { NNCF_DIALOG_TOOLTIP, STARTED_OPTIMIZATION } from '../../utils';
import { OptimizationNNCF } from '../optimization-nncf';
import { OptimizationTypes } from '../optimization-types';
import classes from './optimization-dialog.module.scss';
import { getOptimizationType, OptimizationTypesEnum } from './utils';

interface OptimizationDialogProps {
    isFilterPruningDisabled: boolean;
    isFilterPruningSupported: boolean;
    isPOTVisible: boolean;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const OptimizationDialog = (props: OptimizationDialogProps): JSX.Element => {
    const { isFilterPruningDisabled, isFilterPruningSupported, isPOTVisible, isOpen, setIsOpen } = props;
    const [selectedOptType, setSelectedOptType] = useState<OptimizationTypesEnum>(OptimizationTypesEnum.NNCF);
    const [isEnabledFilterPruning, setIsEnabledFilterPruning] = useState<boolean>(false);
    const [accuracyDrop, setAccuracyDrop] = useState<number>(1);
    const modelIdentifier = useModelIdentifier();
    const { addNotification } = useNotification();
    const { optimizeModel } = useOptimizeModel();
    const isBtnDisabled = optimizeModel.isLoading || optimizeModel.isSuccess;
    const queryClient = useQueryClient();

    const handleCloseDialog = (): void => {
        setIsOpen(false);
        setSelectedOptType(OptimizationTypesEnum.NNCF);
        setIsEnabledFilterPruning(false);
        setAccuracyDrop(1);
    };

    const handleSelectOptimizationType = useCallback((value: string): void => {
        setSelectedOptType(getOptimizationType(value));
    }, []);

    const handledFilterPruningEnable = useCallback((value: boolean) => {
        setIsEnabledFilterPruning(value);
    }, []);

    const handleAccuracyDrop = useCallback((value: number) => {
        setAccuracyDrop(value);
    }, []);

    const handleOptimizeModel = (): void => {
        const body: OptimizeModelDTO = {
            enable_nncf_optimization: selectedOptType === OptimizationTypesEnum.NNCF,
            enable_pot_optimization: selectedOptType === OptimizationTypesEnum.POT,
            optimization_parameters: {
                pot: selectedOptType === OptimizationTypesEnum.POT ? {} : undefined,
                nncf:
                    selectedOptType === OptimizationTypesEnum.NNCF
                        ? {
                              accuracy_drop: accuracyDrop / 100,
                              enable_filter_pruning: isEnabledFilterPruning,
                          }
                        : undefined,
            },
        };

        const { workspaceId, projectId, architectureId, modelId } = modelIdentifier;
        optimizeModel.mutate(
            { workspaceId, projectId, architectureId, modelId, body },
            {
                onSuccess: async () => {
                    await queryClient.invalidateQueries(
                        QUERY_KEYS.MODEL_KEY(workspaceId, projectId, architectureId, modelId)
                    );
                    setIsOpen(false);
                },
            }
        );
    };

    useEffect(() => {
        // once optimization has started, wait for the model to appear on the screen and show the notification
        // once this component unmounts
        return () => {
            if (optimizeModel.isSuccess) {
                addNotification(STARTED_OPTIMIZATION, NOTIFICATION_TYPE.DEFAULT);
                optimizeModel.isSuccess = false;
            }
        };
    }, [addNotification, optimizeModel]);

    return (
        <DialogContainer onDismiss={handleCloseDialog}>
            {isOpen && (
                <Dialog>
                    <Heading>
                        {isPOTVisible ? (
                            'Optimization'
                        ) : (
                            <Flex alignItems={'center'}>
                                <Text>Training-time optimization</Text>
                                <ButtonWithTooltip
                                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                                    variant={'primary'}
                                    content={<InfoOutline />}
                                    tooltipProps={{
                                        children: NNCF_DIALOG_TOOLTIP,
                                    }}
                                    isQuiet
                                />
                            </Flex>
                        )}
                    </Heading>
                    <Divider />
                    <Content UNSAFE_className={classes.optimizationDialogContent}>
                        {isPOTVisible ? (
                            <OptimizationTypes
                                selectedOptType={selectedOptType}
                                handleSelectOptimizationType={handleSelectOptimizationType}
                                isFilterPruningDisabled={isFilterPruningDisabled}
                                isFilterPruningSupported={isFilterPruningSupported}
                                isFilterPruningEnabled={isEnabledFilterPruning}
                                handleFilterPruningEnable={handledFilterPruningEnable}
                                accuracyDrop={accuracyDrop}
                                handleAccuracyDrop={handleAccuracyDrop}
                            />
                        ) : (
                            <OptimizationNNCF
                                isFilterPruningDisabled={isFilterPruningDisabled}
                                isFilterPruningSupported={isFilterPruningSupported}
                                isFilterPruningEnabled={isEnabledFilterPruning}
                                handleFilterPruningEnable={handledFilterPruningEnable}
                                accuracyDrop={accuracyDrop}
                                handleAccuracyDrop={handleAccuracyDrop}
                            />
                        )}
                    </Content>
                    <ButtonGroup>
                        <Button variant={'secondary'} onPress={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button variant={'cta'} onPress={handleOptimizeModel} isDisabled={isBtnDisabled}>
                            <Flex alignItems={'center'} gap={'size-65'}>
                                {isBtnDisabled ? <LoadingIndicator size={'S'} /> : <></>}
                                <Text>Start</Text>
                            </Flex>
                        </Button>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogContainer>
    );
};
