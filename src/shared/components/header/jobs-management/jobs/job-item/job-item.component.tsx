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
import { Flex, Heading, ProgressBar, Text, View } from '@adobe/react-spectrum';

import { TrainingDetails } from '../../../../../../core/projects/project-status.interface';
import { CustomWell } from '../../../../custom-well';
import { DISCARD, DiscardButton } from './discard-button/discard-button.component';
import classes from './job-item.module.scss';
import { Status } from './status/status.component';

export interface JobItemProps {
    icon?: JSX.Element;
    discardType: DISCARD;
    header: string;
    id: string;
    message: string;
    status?: TrainingDetails;
    additionalInformation?: string;
}

export const JobItem = ({
    icon = <></>,
    discardType,
    header,
    message,
    status,
    additionalInformation = '',
    id,
}: JobItemProps): JSX.Element => {
    return (
        <CustomWell id={`job-item-${id}`} isSelectable={false} position={'relative'}>
            <>
                <View padding={'size-200'}>
                    <Flex alignItems={'center'} gap={'size-200'} id={`job-icon-${id}-id`}>
                        {icon}
                        <Flex justifyContent={'space-between'} width={'100%'}>
                            <Flex direction='column'>
                                <Heading margin={0} id={`job-type-${id}-id`}>
                                    {header}
                                </Heading>
                                <Text id={`job-description-${id}-id`}>{message}</Text>
                                {additionalInformation.length > 0 ? (
                                    <Text
                                        id={`job-additional-information-${id}-id`}
                                        UNSAFE_className={classes.additionalInfo}
                                    >
                                        {additionalInformation}
                                    </Text>
                                ) : (
                                    <></>
                                )}
                            </Flex>
                            <DiscardButton discardType={discardType} jobId={id} jobMessage={message} />
                        </Flex>
                    </Flex>
                </View>
                {status ? <Status status={status} jobId={id} /> : <></>}

                {status?.progress && (
                    <ProgressBar
                        size={'S'}
                        aria-label='job-item-progress-bar'
                        showValueLabel={false}
                        UNSAFE_className={classes.progressBar}
                        value={Number(status?.progress.replace('%', ''))}
                    />
                )}
            </>
        </CustomWell>
    );
};
