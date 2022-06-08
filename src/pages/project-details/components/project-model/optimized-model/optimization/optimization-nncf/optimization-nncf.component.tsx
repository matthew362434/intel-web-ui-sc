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
import { Text, NumberField, Checkbox, Flex, ActionButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { Alert, InfoOutline } from '../../../../../../../assets/icons';
import { ButtonWithTooltip } from '../../../../../../../shared/components';
import {
    DISABLED_FILTER_PRUNING_TOOLTIP,
    FILTER_PRUNING_IS_NOT_SUPPORTED,
    FILTER_PRUNING_TOOLTIP,
    FILTER_PRUNING_WARNING,
} from '../../utils';
import classes from '../optimization-dialog/optimization-dialog.module.scss';
import { OptimizationTypesProps } from '../optimization-types';

type OptimizationNNCFProps = Omit<OptimizationTypesProps, 'selectedOptType' | 'handleSelectOptimizationType'>;

export const OptimizationNNCF = (props: OptimizationNNCFProps): JSX.Element => {
    const {
        isFilterPruningDisabled,
        isFilterPruningSupported,
        isFilterPruningEnabled,
        accuracyDrop,
        handleAccuracyDrop,
        handleFilterPruningEnable,
    } = props;

    return (
        <Flex direction={'column'}>
            <Text marginY={'size-100'}>Max accuracy drop %</Text>
            <NumberField
                step={1}
                minValue={0}
                maxValue={100}
                aria-label={'Accuracy value'}
                value={accuracyDrop}
                onChange={handleAccuracyDrop}
            />

            <Flex marginTop={'size-100'}>
                <TooltipTrigger isDisabled={isFilterPruningSupported ? !isFilterPruningDisabled : false} delay={200}>
                    <ActionButton isQuiet UNSAFE_className={classes.filterPruningTooltip}>
                        <Checkbox
                            aria-label={'Enable filter pruning'}
                            isDisabled={isFilterPruningSupported ? isFilterPruningDisabled : true}
                            isSelected={isFilterPruningEnabled}
                            onChange={handleFilterPruningEnable}
                            UNSAFE_className={classes.optimizationFilterPruning}
                            isEmphasized
                        >
                            <Text>Enable filter pruning</Text>
                        </Checkbox>
                    </ActionButton>
                    <Tooltip data-testid={'filter-pruning-tooltip-id'}>
                        {!isFilterPruningSupported ? FILTER_PRUNING_IS_NOT_SUPPORTED : DISABLED_FILTER_PRUNING_TOOLTIP}
                    </Tooltip>
                </TooltipTrigger>

                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    variant={'primary'}
                    content={<InfoOutline aria-label={'Training-time optimization info'} />}
                    tooltipProps={{ children: FILTER_PRUNING_TOOLTIP }}
                    isQuiet
                />
                {isFilterPruningDisabled && (
                    <ButtonWithTooltip
                        id={'filter-pruning-warning-id'}
                        data-testid={'filter-pruning-warning-id'}
                        buttonInfo={{ type: 'action_button', button: ActionButton }}
                        variant={'primary'}
                        content={<Alert aria-label='Training-time optimization alert' color='notice' />}
                        tooltipProps={{ children: FILTER_PRUNING_WARNING }}
                        isQuiet
                    />
                )}
            </Flex>
        </Flex>
    );
};
