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
import { DocumentList } from '../../../assets/icons';
import { NumberBadge } from '../number-badge/number-badge.component';

interface JobsIconsWithNumberProps {
    runningJobs: number | undefined;
    reversedColors?: boolean;
    isError?: boolean;
}

export const JobsIconWithNumber = ({
    runningJobs,
    reversedColors = false,
    isError,
}: JobsIconsWithNumberProps): JSX.Element => {
    return (
        <>
            <DocumentList aria-label={'tasks in progress'} />
            <div style={{ position: 'absolute', top: 1, right: 0 }}>
                <NumberBadge
                    number={runningJobs}
                    selected
                    reversedColor={reversedColors}
                    id={'jobs-management'}
                    isError={isError}
                />
            </div>
        </>
    );
};
