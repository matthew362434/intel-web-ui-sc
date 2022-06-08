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
import { useEffect, useState } from 'react';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Divider, Flex, Text } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import {
    ButtonWithTooltip,
    ConfigurableParameters,
    ConfigurableParametersType,
    Loading,
    LoadingIndicator,
} from '../../../../../shared/components';
import sharedClasses from '../../../../../shared/shared.module.scss';
import classes from './reconfigure-models.module.scss';
import { useReconfigureParametersValue } from './use-reconfigure-parameters-value';

export const ReconfigureModels = (): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const {
        configParameters,
        isLoading,
        setIsQueryEnabled,
        isReconfigureButtonDisabled,
        reconfigure,
        isReconfiguring,
        setSelectedComponentId,
        selectedComponent,
        selectedComponentId,
        updateParameter,
    } = useReconfigureParametersValue();

    const handleOpen = (): void => {
        setIsOpen(true);
    };

    const handleOnDismiss = (): void => {
        setIsOpen(false);
        setSelectedComponentId(undefined);
    };

    useEffect(() => {
        setIsQueryEnabled(isOpen);
    }, [isOpen, setIsQueryEnabled]);

    return (
        <>
            <ButtonWithTooltip
                buttonInfo={{ button: Button, type: 'button' }}
                content={'Reconfigure'}
                tooltipProps={{
                    children: 'Reconfigure parameters for active model.',
                }}
                variant={'primary'}
                onPress={handleOpen}
                isClickable
            />
            <DialogContainer onDismiss={handleOnDismiss}>
                {isOpen && (
                    <Dialog UNSAFE_className={classes.reconfigureDialog}>
                        <Heading>Reconfigure parameters for active model</Heading>
                        <Divider />
                        <Content UNSAFE_className={sharedClasses.dialogContent}>
                            {isLoading ? (
                                <Loading />
                            ) : configParameters ? (
                                <ConfigurableParameters
                                    type={ConfigurableParametersType.MANY_CONFIG_PARAMETERS}
                                    configParametersData={configParameters}
                                    selectedComponent={selectedComponent}
                                    selectedComponentId={selectedComponentId}
                                    setSelectedComponentId={setSelectedComponentId}
                                    updateParameter={updateParameter}
                                />
                            ) : (
                                <></>
                            )}
                        </Content>
                        <ButtonGroup UNSAFE_className={classes.reconfigureActionButtons}>
                            <Button variant={'secondary'} id={'cancel-button-id'} onPress={handleOnDismiss}>
                                Cancel
                            </Button>
                            <Button
                                variant={'cta'}
                                id={'start-reconfiguration-button-id'}
                                onPress={() => reconfigure(handleOnDismiss)}
                                isDisabled={isReconfigureButtonDisabled}
                            >
                                <Flex alignItems={'center'} gap={'size-65'}>
                                    {isReconfiguring ? <LoadingIndicator size={'S'} /> : <></>}
                                    <Text>Reconfigure</Text>
                                </Flex>
                            </Button>
                        </ButtonGroup>
                    </Dialog>
                )}
            </DialogContainer>
        </>
    );
};
