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

import { Flex, Text } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { SupportedAlgorithm } from '../../../../../../../core/supported-algorithms/dtos';
import { idMatchingFormat } from '../../../../../../../test-utils';
import { SelectableCard } from '../../selectable-card';
import { AlgorithmTemplatesSelectionProps } from '../algorithm-templates-selection.component';
import classes from './algorithm-template.module.scss';

interface AlgorithmTemplateProps extends Omit<AlgorithmTemplatesSelectionProps, 'algorithms' | 'animationDirection'> {
    algorithm: SupportedAlgorithm;
}

export const AlgorithmTemplate = ({
    selectedAlgorithm,
    setSelectedAlgorithm,
    algorithm,
}: AlgorithmTemplateProps): JSX.Element => {
    const { algorithmName, gigaflops, modelSize } = algorithm;
    const isSelected = algorithmName === selectedAlgorithm?.algorithmName;

    const handleOnPress = useCallback(() => {
        setSelectedAlgorithm(algorithm);
    }, [setSelectedAlgorithm, algorithm]);

    return (
        <SelectableCard
            headerContent={
                <Heading margin={0} UNSAFE_className={classes.algorithmName}>
                    {algorithmName}
                </Heading>
            }
            descriptionContent={
                <Flex height={'100%'} alignItems={'center'} gap={'size-550'}>
                    <Flex direction={'column'}>
                        <Text UNSAFE_className={classes.algorithmDescriptionHeader}>Size</Text>
                        <Text
                            data-testid={`${idMatchingFormat(algorithmName)}-size-id`}
                            UNSAFE_className={classes.algorithmNameDescriptionContent}
                        >
                            {modelSize} MB
                        </Text>
                    </Flex>
                    <Flex direction={'column'}>
                        <Text UNSAFE_className={classes.algorithmDescriptionHeader}>Complexity</Text>
                        <Text
                            data-testid={`${idMatchingFormat(algorithmName)}-complexity-id`}
                            UNSAFE_className={classes.algorithmNameDescriptionContent}
                        >
                            {gigaflops} GFlops
                        </Text>
                    </Flex>
                </Flex>
            }
            text={algorithmName}
            isSelected={isSelected}
            handleOnPress={handleOnPress}
        />
    );
};
