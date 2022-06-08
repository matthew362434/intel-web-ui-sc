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
import { Key, useState } from 'react';

import { MenuTrigger, Button, Menu, Item, Text } from '@adobe/react-spectrum';

import { idMatchingFormat } from '../../../../../test-utils';
import { UseOptimizedModels } from '../hooks/use-optimized-models';
import { usePOTModel } from '../hooks/use-pot-model';
import { OptimizationDialog } from '../optimized-model/optimization';
import { HPODialog } from './hpo-dialog';

enum OptimizationKeys {
    'IMPROVE_SPEED' = 'IMPROVE_SPEED',
    'IMPROVE_ACCURACY' = 'IMPROVE_ACCURACY',
    'NONE' = 'NONE',
}

interface StartOptimizationProps extends Omit<UseOptimizedModels, 'modelDetails'> {
    isHPOSupported: boolean;
    modelTemplateId: string;
    taskId: string;
    handleOpenHPONotification: () => void;
}

export const StartOptimization = (props: StartOptimizationProps): JSX.Element => {
    const {
        isImproveSpeedOptimizationVisible,
        isPOTModel,
        displayNNCFNoModels,
        displayPOTBtnNoNNCF,
        displayPOTBtnAfterNNCF,
        isFilterPruningDisabled,
        isFilterPruningSupported,
        isHPOSupported,
        modelTemplateId,
        taskId,
        handleOpenHPONotification,
    } = props;
    const [isOptimizationOpen, setIsOptimizationOpen] = useState<boolean>(false);
    const [isHPOOpen, setIsHPOOpen] = useState<boolean>(false);
    const { optimizePOTModel } = usePOTModel();

    const handleOnSelectionChange = (key: Key): void => {
        if (key === OptimizationKeys.IMPROVE_SPEED) {
            if (displayNNCFNoModels) {
                setIsOptimizationOpen(true);
            } else if (displayPOTBtnNoNNCF || displayPOTBtnAfterNNCF) {
                optimizePOTModel();
            }
        } else if (key === OptimizationKeys.IMPROVE_ACCURACY) {
            setIsHPOOpen(true);
        } else {
            throw new Error(`Optimization key: ${key} is not supported`);
        }
    };

    const DISABLED_KEYS: OptimizationKeys[] = [
        isImproveSpeedOptimizationVisible ? OptimizationKeys.NONE : OptimizationKeys.IMPROVE_SPEED,
        isHPOSupported ? OptimizationKeys.NONE : OptimizationKeys.IMPROVE_ACCURACY,
    ];

    return (
        <>
            <MenuTrigger>
                <Button variant={'cta'} id={'start-optimization-id'}>
                    Start optimization
                </Button>
                <Menu onAction={handleOnSelectionChange} disabledKeys={DISABLED_KEYS}>
                    <Item key={OptimizationKeys.IMPROVE_SPEED}>
                        <Text id={`${idMatchingFormat(OptimizationKeys.IMPROVE_SPEED)}-id`}>Improve speed</Text>
                    </Item>
                    <Item key={OptimizationKeys.IMPROVE_ACCURACY}>
                        <Text id={`${idMatchingFormat(OptimizationKeys.IMPROVE_ACCURACY)}-id`}>Improve accuracy</Text>
                    </Item>
                </Menu>
            </MenuTrigger>
            {displayNNCFNoModels && (
                <OptimizationDialog
                    isOpen={isOptimizationOpen}
                    setIsOpen={setIsOptimizationOpen}
                    isFilterPruningDisabled={isFilterPruningDisabled}
                    isFilterPruningSupported={isFilterPruningSupported}
                    isPOTVisible={!isPOTModel}
                    key={isPOTModel as unknown as Key}
                />
            )}
            <HPODialog
                modelTemplateId={modelTemplateId}
                taskId={taskId}
                isOpen={isHPOOpen}
                setIsOpen={setIsHPOOpen}
                handleOpenHPONotification={handleOpenHPONotification}
            />
        </>
    );
};
