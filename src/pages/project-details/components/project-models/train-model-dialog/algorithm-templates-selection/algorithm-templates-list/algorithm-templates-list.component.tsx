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
import { View, Flex } from '@adobe/react-spectrum';

import { SliderAnimation } from '../../../../../../../shared/components';
import { AlgorithmTemplate } from '../algorithm-template';
import { AlgorithmTemplatesSelectionProps } from '../algorithm-templates-selection.component';

export const AlgorithmTemplatesList = ({
    algorithms,
    selectedAlgorithm,
    setSelectedAlgorithm,
    animationDirection,
}: AlgorithmTemplatesSelectionProps): JSX.Element => {
    return (
        <View
            backgroundColor={'gray-50'}
            borderRadius={'regular'}
            padding={'size-300'}
            UNSAFE_style={{ boxSizing: 'border-box' }}
        >
            <SliderAnimation animationDirection={animationDirection}>
                <Flex alignItems={'center'} gap={'size-250'}>
                    {algorithms.map((algorithm) => (
                        <AlgorithmTemplate
                            key={algorithm.algorithmName}
                            algorithm={algorithm}
                            selectedAlgorithm={selectedAlgorithm}
                            setSelectedAlgorithm={setSelectedAlgorithm}
                        />
                    ))}
                </Flex>
            </SliderAnimation>
        </View>
    );
};
