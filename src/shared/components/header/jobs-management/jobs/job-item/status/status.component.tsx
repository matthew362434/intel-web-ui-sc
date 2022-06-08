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
import { Divider, Flex, Text } from '@adobe/react-spectrum';

import { TrainingDetails } from '../../../../../../../core/projects/project-status.interface';
import { LoadingIndicator } from '../../../../../loading';
import { ProgressLoading } from '../../../../../progress-loading';
import { isNegativePercentage } from '../../../utils';
import classes from './status.module.scss';

interface StatusProps {
    jobId: string;
    status: TrainingDetails;
}

export const Status = ({ status, jobId }: StatusProps): JSX.Element => {
    const { message, progress, timeRemaining } = status;

    return (
        <>
            <Divider size={'S'} marginX={'size-100'} />
            <Flex direction={'row'} UNSAFE_className={classes.additionalSection} gap={'size-200'} marginBottom={0}>
                <ProgressLoading id={`job-progress-icon-${jobId}-id`} />
                <Text flexGrow={2} id={`job-step-${jobId}-id`}>
                    {message}
                </Text>
                <Text flexGrow={1} id={`job-progress-${jobId}-id`}>
                    {isNegativePercentage(progress) ? <LoadingIndicator size={'S'} /> : progress}
                </Text>
                {timeRemaining ? (
                    <Text flexGrow={1} id={`job-time-remaining-${jobId}-id`}>
                        {timeRemaining} left
                    </Text>
                ) : (
                    <></>
                )}
            </Flex>
        </>
    );
};
