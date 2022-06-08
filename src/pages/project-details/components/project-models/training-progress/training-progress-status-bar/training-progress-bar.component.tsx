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
import { Flex, Text } from '@adobe/react-spectrum';

import { RunningJobProps } from '../../../../../../core/jobs/job.interface';
import { ProgressLoading } from '../../../../../../shared/components/progress-loading';

interface TrainingProgressStatusBarProps {
    trainingStatus: RunningJobProps['status'];
}

export const TrainingProgressStatusBar = ({ trainingStatus }: TrainingProgressStatusBarProps): JSX.Element => {
    const { progress, timeRemaining, message } = trainingStatus;
    return (
        <Flex marginStart={'size-150'} gap={'size-250'}>
            <ProgressLoading id={'progress'} />
            <Text id={'running-calculation-id'}>{message}</Text>
            <Text id={'training-percent-progress-id'}>{progress}</Text>
            {timeRemaining && <Text id={'training-time-left-id'}>{timeRemaining} left</Text>}
        </Flex>
    );
};
