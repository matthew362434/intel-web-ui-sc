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

import { Flex, View, Text } from '@adobe/react-spectrum';

import { Performance } from '../../../../../../core/projects';
import { AccuracyContainer } from './accuracy-container';

interface ModelPerformanceProps {
    performance: Performance;
    upToDate: boolean;
    genericId: string;
}
export const ModelPerformance = ({ performance, upToDate, genericId }: ModelPerformanceProps) => {
    const accuracyContainerTooltipDescription = upToDate ? 'Latest model score' : 'The score is outdated';

    if (performance.type === 'default_performance') {
        return (
            <View backgroundColor='gray-200' paddingY='size-125' paddingX='size-200' borderRadius='small'>
                <AccuracyContainer
                    disabled={!upToDate}
                    tooltip={<Text>{accuracyContainerTooltipDescription}</Text>}
                    value={performance.score}
                    id={genericId}
                    heading='Accuracy'
                />
            </View>
        );
    }

    return (
        <Flex direction='row' gap='size-100'>
            <View backgroundColor='gray-200' paddingY='size-125' paddingX='size-200' borderRadius='small'>
                <AccuracyContainer
                    disabled={!upToDate}
                    tooltip={<Text>{accuracyContainerTooltipDescription}</Text>}
                    value={performance.globalScore}
                    id={`${genericId}-image-score`}
                    heading='Image score'
                />
            </View>
            <View backgroundColor='gray-200' paddingY='size-125' paddingX='size-200' borderRadius='small'>
                <AccuracyContainer
                    disabled={!upToDate}
                    tooltip={
                        <Text>
                            {performance.localScore === null
                                ? 'Annotate your media to compute localization score'
                                : accuracyContainerTooltipDescription}
                        </Text>
                    }
                    value={performance.localScore}
                    id={`${genericId}-object-score`}
                    heading='Object score'
                />
            </View>
        </Flex>
    );
};
