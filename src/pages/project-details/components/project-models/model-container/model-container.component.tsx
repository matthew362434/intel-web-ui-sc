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

import { ActionButton, Flex } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';
import { View } from '@react-spectrum/view';
import { AnimatePresence, motion } from 'framer-motion';

import { ChevronUpLight } from '../../../../../assets/icons';
import { ANIMATION_PARAMETERS } from '../../../../../shared/animation-parameters/animation-parameters';
import { InfoTooltip } from '../../../../../shared/components';
import { useTasksWithSupportedAlgorithms } from '../../../hooks/use-tasks-with-supported-algorithms';
import { getModelTemplateDetails } from '../train-model-dialog/utils';
import { ModelCard, ModelCardProps } from './model-card';
import { ModelContainerProps } from './model-container.interface';

export const ModelContainer = ({
    architectureName,
    architectureId,
    modelVersions,
    modelTemplateId,
    taskId,
}: ModelContainerProps): JSX.Element => {
    const [expandedModels, setExpandedModels] = useState<boolean>(false);
    const renderModelVersions: ModelCardProps[] = expandedModels
        ? modelVersions
        : modelVersions.length
        ? [{ ...modelVersions[0] }]
        : [];
    const { tasksWithSupportedAlgorithms } = useTasksWithSupportedAlgorithms();
    const { templateName, summary } = getModelTemplateDetails(modelTemplateId, tasksWithSupportedAlgorithms[taskId]);
    const hasManyModels = modelVersions.length > 1;

    return (
        <>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
                <Flex gap={'size-100'} alignItems={'center'}>
                    <Heading id={`model-group-name-${architectureId}-id`}>
                        {templateName} ({architectureName})
                    </Heading>
                    <InfoTooltip id={`algorithm-summary-${architectureId}-id`} tooltipText={summary} />
                </Flex>
                <Flex gap={'size-150'} alignItems={'center'}>
                    {hasManyModels && (
                        <ActionButton
                            isQuiet
                            onPress={() => setExpandedModels((prev) => !prev)}
                            id={`expand-button-${architectureId}-id`}
                        >
                            <motion.div animate={{ rotate: expandedModels ? 0 : 180 }}>
                                <ChevronUpLight
                                    aria-label={expandedModels ? 'Hide models' : 'Expand models'}
                                    id={'chevron-up-id'}
                                />
                            </motion.div>
                        </ActionButton>
                    )}
                </Flex>
            </Flex>
            <View>
                <AnimatePresence>
                    {renderModelVersions.map((model: ModelCardProps, index) => (
                        <motion.div
                            variants={ANIMATION_PARAMETERS.ANIMATE_LIST}
                            initial={'hidden'}
                            animate={'visible'}
                            exit={'hidden'}
                            custom={index}
                            key={model.id}
                        >
                            <ModelCard {...model} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </View>
        </>
    );
};
