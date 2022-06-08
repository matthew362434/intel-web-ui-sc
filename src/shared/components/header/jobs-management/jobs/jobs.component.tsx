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
import { Text, View } from '@adobe/react-spectrum';

import { JobProps } from '../../../../../core/jobs/job.interface';
import { Loading } from '../../../loading';
import { JobTabType } from '../jobs-management.component';
import { DISCARD } from './job-item/discard-button/discard-button.component';
import { JobItem } from './job-item/job-item.component';

interface JobsProps {
    type: JobTabType;
    jobs: JobProps[];
    isLoading: boolean;
    icon?: JSX.Element;
}

export const Jobs = ({ jobs, type, isLoading, icon = <></> }: JobsProps): JSX.Element => {
    const discardType = type === JobTabType.FAILED || type === JobTabType.FINISHED ? DISCARD.DELETE : DISCARD.CANCEL;

    return (
        <View
            paddingY={'size-100'}
            overflow={'auto'}
            maxHeight={'100%'}
            minHeight={'100%'}
            UNSAFE_style={{ boxSizing: 'border-box' }}
        >
            {jobs.map((job: JobProps) => (
                <JobItem
                    key={job.id}
                    discardType={discardType}
                    header={job.name}
                    id={job.id}
                    message={job.description}
                    additionalInformation={'message' in job ? job.message : undefined}
                    icon={icon}
                    status={'status' in job ? job.status : undefined}
                />
            ))}
            {isLoading ? <Loading /> : jobs.length === 0 ? <Text>There are no jobs.</Text> : <></>}
        </View>
    );
};
