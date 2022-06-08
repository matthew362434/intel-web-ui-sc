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
import { Flex, Text, Heading } from '@adobe/react-spectrum';

import { idMatchingFormat } from '../../../../../../../test-utils';
import classes from './training-progress-task-items.module.scss';

interface TrainingProgressTaskItemsProps {
    names: string[];
    values: string[];
}

export const TrainingProgressTaskItems = ({ names, values }: TrainingProgressTaskItemsProps): JSX.Element => {
    return (
        <Flex gap={'size-500'} alignItems={'center'}>
            <Flex direction={'column'} justifyContent={'center'} rowGap={'size-100'}>
                {names.map((name) => (
                    <Text key={idMatchingFormat(name)} id={`${idMatchingFormat(name)}-id`}>
                        {name}:
                    </Text>
                ))}
            </Flex>
            <Flex direction={'column'} justifyContent={'center'} rowGap={'size-50'}>
                {values.map((value, index) => (
                    <Heading
                        key={`${idMatchingFormat(names[index])}-value-id`}
                        UNSAFE_className={classes.trainingItemValue}
                    >
                        {value}
                    </Heading>
                ))}
            </Flex>
        </Flex>
    );
};
