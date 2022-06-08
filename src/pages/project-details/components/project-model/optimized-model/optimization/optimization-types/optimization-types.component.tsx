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
import { ActionButton, Divider, Flex, Radio, RadioGroup, Text, View } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../../../../../assets/icons';
import { ButtonWithTooltip } from '../../../../../../../shared/components';
import { NNCF_DIALOG_TOOLTIP, POT_DIALOG_TOOLTIP } from '../../utils';
import classes from '../optimization-dialog/optimization-dialog.module.scss';
import { OptimizationTypesEnum } from '../optimization-dialog/utils';
import { OptimizationNNCF } from '../optimization-nncf';

export interface OptimizationTypesProps {
    selectedOptType: OptimizationTypesEnum;
    handleSelectOptimizationType: (value: string) => void;
    isFilterPruningDisabled: boolean;
    isFilterPruningSupported: boolean;
    isFilterPruningEnabled: boolean;
    handleFilterPruningEnable: (value: boolean) => void;
    accuracyDrop: number;
    handleAccuracyDrop: (value: number) => void;
}

export const OptimizationTypes = (props: OptimizationTypesProps): JSX.Element => {
    const { selectedOptType, handleSelectOptimizationType, ...rest } = props;
    return (
        <RadioGroup
            aria-label={'Select optimization type'}
            value={selectedOptType}
            onChange={handleSelectOptimizationType}
            isEmphasized
        >
            <Flex marginBottom={'size-200'}>
                <View UNSAFE_className={classes.optimizationAwareContainer}>
                    <Radio
                        aria-label={'Training-time optimization'}
                        value={OptimizationTypesEnum.NNCF}
                        marginEnd={'size-100'}
                    >
                        <Text>Training-time optimization (Recommended)</Text>
                    </Radio>
                    <OptimizationNNCF {...rest} />
                </View>
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    variant={'primary'}
                    content={<InfoOutline />}
                    tooltipProps={{ children: NNCF_DIALOG_TOOLTIP }}
                    isQuiet
                />
            </Flex>

            <Divider size={'S'} marginY={'size-150'} />
            <Flex alignItems={'center'}>
                <Radio
                    aria-label={'Post-training optimization'}
                    value={OptimizationTypesEnum.POT}
                    marginEnd={'size-100'}
                >
                    <Text id={'pot-id'}>Post-training optimization</Text>
                </Radio>
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    variant={'primary'}
                    content={<InfoOutline />}
                    tooltipProps={{ children: POT_DIALOG_TOOLTIP }}
                    isQuiet
                />
            </Flex>
        </RadioGroup>
    );
};
