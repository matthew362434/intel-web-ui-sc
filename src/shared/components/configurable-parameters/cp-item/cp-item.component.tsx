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

import { View, Flex, ActionButton, Divider } from '@adobe/react-spectrum';

import { Alert, InfoOutline } from '../../../../assets/icons';
import { idMatchingFormat } from '../../../../test-utils';
import { ButtonWithTooltip } from '../../button-with-tooltip';
import { TruncatedText } from '../../truncated-text';
import { ConfigParameterItemProp, ConfigurableParametersParams } from '../configurable-parameters.interface';
import { CPEditableItem } from './cp-editable-item';
import classes from './cp-item.module.scss';
import { CPStaticItem } from './cp-static-item';
import { ResetButton } from './reset-button';
import { getStaticContent } from './utils';

interface CPParamItemProps extends ConfigParameterItemProp {
    parameter: ConfigurableParametersParams;
}

export const CPParamItem = ({ parameter, updateParameter, isHPO }: CPParamItemProps): JSX.Element => {
    const { header, description, warning, editable } = parameter;
    const headerId = `${idMatchingFormat(header)}`;
    const isReadOnly = !editable || isHPO;
    const shouldShowHPOBtn = parameter.autoHPOValue !== null;

    const handleHPOValue = () => {
        if (parameter.autoHPOValue && updateParameter) {
            updateParameter(headerId, parameter.autoHPOValue);
        }
    };

    const handleResetButton = () => {
        updateParameter && updateParameter(parameter.id, parameter.defaultValue);
    };

    return (
        <View marginBottom={'size-65'}>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
                <TruncatedText id={`${headerId}-id`} classes={classes.configParameterTitle}>
                    {header}
                </TruncatedText>
                <Flex alignItems={'center'}>
                    {warning && !isReadOnly ? (
                        <ButtonWithTooltip
                            buttonInfo={{ type: 'action_button', button: ActionButton }}
                            buttonClasses={classes.configParameterTooltipButton}
                            content={<Alert aria-label='Notification Alert' color='notice' />}
                            tooltipProps={{
                                children: warning,
                            }}
                            variant={'primary'}
                            isQuiet
                            id={`${headerId}-warning-id`}
                        />
                    ) : (
                        <></>
                    )}
                    <ButtonWithTooltip
                        buttonInfo={{ type: 'action_button', button: ActionButton }}
                        buttonClasses={classes.configParameterTooltipButton}
                        content={<InfoOutline />}
                        tooltipProps={{
                            children: description,
                        }}
                        variant={'primary'}
                        isQuiet
                        id={`${headerId}-tooltip-id`}
                    />
                    {!isReadOnly ? (
                        <>
                            <ResetButton
                                id={`${headerId}-reset-button-id`}
                                handleResetButton={handleResetButton}
                                isDisabled={parameter.value === parameter.defaultValue}
                            />
                            {shouldShowHPOBtn && (
                                <ActionButton
                                    isQuiet
                                    UNSAFE_className={classes.configParamHPOBtn}
                                    isDisabled={parameter.value === parameter.autoHPOValue}
                                    onPress={handleHPOValue}
                                    id={`${headerId}-reset-hpo-button-id`}
                                    data-testid={`${headerId}-reset-hpo-button-id`}
                                >
                                    HPO
                                </ActionButton>
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                </Flex>
            </Flex>
            <View marginTop={'size-125'} marginBottom={'size-225'} UNSAFE_className={classes.configParameterContent}>
                {!isHPO &&
                    (!isReadOnly && updateParameter ? (
                        <CPEditableItem updateParameter={updateParameter} parameter={parameter} id={headerId} />
                    ) : (
                        <CPStaticItem
                            shouldShowHPO={parameter.value === parameter.autoHPOValue}
                            id={`${headerId}-content-id`}
                            content={getStaticContent(parameter)}
                        />
                    ))}
            </View>
            <Divider size={'S'} UNSAFE_className={classes.configParameterDivider} />
        </View>
    );
};
