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

import { useCallback } from 'react';

import { Flex, Heading, Text } from '@adobe/react-spectrum';

import { InfoTooltip } from '../../../../../../../shared/components';
import { SelectableCard } from '../../selectable-card';
import { ModelTemplatesNames, Template, TrainModelTemplatesProps } from '../train-model-templates-list';
import classes from './train-model-template.module.scss';

interface TrainModelTemplateProps
    extends Omit<TrainModelTemplatesProps, 'templates' | 'animationDirection' | 'selectedDomain'> {
    template: Template;
}

export const TrainModelTemplate = ({
    template,
    handleSelectedModelTemplate,
    selectedModelTemplate,
}: TrainModelTemplateProps): JSX.Element => {
    const { text, algorithmName, description, summary } = template;
    const isSelected = selectedModelTemplate.text === text;
    const isNameInvisible = template.text === ModelTemplatesNames.CUSTOM;

    const handleOnPress = useCallback(() => {
        handleSelectedModelTemplate(template);
    }, [template, handleSelectedModelTemplate]);

    return (
        <SelectableCard
            headerContent={
                <Flex justifyContent={'space-between'} alignItems={'self-start'}>
                    <Flex gap={'size-50'} direction={'column'}>
                        <Heading margin={0} UNSAFE_className={classes.trainTemplateName}>
                            {text}
                        </Heading>
                        <Text
                            UNSAFE_className={[
                                classes.trainAlgorithmName,
                                isNameInvisible ? classes.trainAlgorithmNameInvisible : '',
                            ].join(' ')}
                        >
                            {algorithmName}
                        </Text>
                    </Flex>
                    <InfoTooltip id={`${text.toLocaleLowerCase()}-summary-id`} tooltipText={summary} />
                </Flex>
            }
            descriptionContent={<Text>{description}</Text>}
            text={text}
            isSelected={isSelected}
            handleOnPress={handleOnPress}
        />
    );
};
