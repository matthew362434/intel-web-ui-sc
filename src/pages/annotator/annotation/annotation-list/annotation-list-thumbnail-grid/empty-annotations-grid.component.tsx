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

import { Flex, Link, Text, View } from '@adobe/react-spectrum';

import { Info } from '../../../../../assets/icons';
import { AnnotationToolContext } from '../../../core';
import { useTask } from '../../../providers';
import { getPreviousTask } from '../../../providers/task-chain-provider/utils';

interface EmptyAnnotationsGridProps {
    annotationToolContext: AnnotationToolContext;
}

export const EmptyAnnotationsGrid = ({ annotationToolContext }: EmptyAnnotationsGridProps): JSX.Element => {
    const { setSelectedTask } = useTask();
    const previousTask = getPreviousTask(annotationToolContext, annotationToolContext.selectedTask);

    const handleSelectPreviousTask = () => {
        setSelectedTask(previousTask ?? null);
    };

    return (
        <View marginTop='size-200'>
            <Flex>
                <View paddingX='size-100' paddingTop={'size-25'}>
                    <Info />
                </View>
                <Flex direction='column'>
                    <Text>No objects detected</Text>
                    <Text>
                        Please select the{' '}
                        <Link variant='overBackground' onPress={handleSelectPreviousTask}>
                            previous task
                        </Link>{' '}
                        to add objects.
                    </Text>
                </Flex>
            </Flex>
        </View>
    );
};
