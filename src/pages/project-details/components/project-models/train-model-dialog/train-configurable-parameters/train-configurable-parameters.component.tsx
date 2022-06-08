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

import { Dispatch, SetStateAction, useEffect } from 'react';

import { Flex, View } from '@adobe/react-spectrum';

import { useModelConfigParameters } from '../../../../../../core/configurable-parameters/hooks';
import {
    ConfigurableParameters,
    ConfigurableParametersSingle,
    ConfigurableParametersTaskChain,
    ConfigurableParametersType,
    SliderAnimation,
} from '../../../../../../shared/components';
import { ConfigParamsPlaceholder } from '../../../../../../shared/components/configurable-parameters/config-params-placeholder';
import { useProjectIdentifier } from '../../../../../annotator/hooks/use-project-identifier';
import { TrainModelSettingsItem } from '../train-model-settings-item';
import { HPOProps } from '../use-training-state-value';
import { trainFromScratchTooltipMsg } from '../utils';

interface TrainConfigurableParametersProps {
    modelTemplateId: string;
    taskId: string;
    configParameters: ConfigurableParametersTaskChain | undefined;
    setConfigParameters: Dispatch<SetStateAction<ConfigurableParametersTaskChain | undefined>>;
    updateParameter: ConfigurableParametersSingle['updateParameter'];
    trainFromScratch: boolean;
    setTrainFromScratch: Dispatch<SetStateAction<boolean>>;
    animationDirection: number;
    hpo: HPOProps;
}

export const TrainConfigurableParameters = ({
    modelTemplateId,
    taskId,
    configParameters,
    setConfigParameters,
    trainFromScratch,
    setTrainFromScratch,
    updateParameter,
    animationDirection,
    hpo,
}: TrainConfigurableParametersProps): JSX.Element => {
    const { workspaceId, projectId } = useProjectIdentifier();
    const { isLoading, data: configParametersData } = useModelConfigParameters(
        workspaceId,
        projectId,
        taskId,
        undefined,
        modelTemplateId,
        true
    );

    useEffect(() => {
        // update state only when configParameters are undefined
        if (configParametersData && !configParameters) {
            setConfigParameters(configParametersData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configParametersData]);

    return (
        <Flex direction={'column'} height={'100%'}>
            <View
                backgroundColor={'gray-50'}
                borderColor={'gray-50'}
                borderRadius={'regular'}
                padding={'size-250'}
                paddingEnd={0}
                UNSAFE_style={{ boxSizing: 'border-box', overflow: 'hidden' }}
                flex={1}
            >
                {isLoading ? (
                    <SliderAnimation animationDirection={animationDirection} style={{ height: '100%' }}>
                        <ConfigParamsPlaceholder />
                    </SliderAnimation>
                ) : (
                    configParameters && (
                        <SliderAnimation animationDirection={animationDirection} style={{ height: '100%' }}>
                            <ConfigurableParameters
                                type={ConfigurableParametersType.SINGLE_CONFIG_PARAMETERS}
                                configParametersData={configParameters}
                                updateParameter={updateParameter}
                                hpo={hpo}
                            />
                        </SliderAnimation>
                    )
                )}
            </View>

            {!isLoading && configParameters && (
                <SliderAnimation animationDirection={animationDirection}>
                    <TrainModelSettingsItem
                        text={'Train from scratch'}
                        tooltip={trainFromScratchTooltipMsg}
                        isSelected={trainFromScratch}
                        handleIsSelected={setTrainFromScratch}
                    />
                </SliderAnimation>
            )}
        </Flex>
    );
};
