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
import { Flex } from '@adobe/react-spectrum';

import { TrainingProgressTaskItems } from './training-progress-task-items';

interface TrainingProgressTaskProps {
    name: string;
    architecture: string;
    version: string;
}

export const TrainingProgressTask = ({ name, architecture, version }: TrainingProgressTaskProps): JSX.Element => {
    return (
        <Flex gap={'size-2400'}>
            <TrainingProgressTaskItems names={['Task', 'Version']} values={[name, version]} />
            <TrainingProgressTaskItems names={['Architecture']} values={[architecture]} />
        </Flex>
    );
};
