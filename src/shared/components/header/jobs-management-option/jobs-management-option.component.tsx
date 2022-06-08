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

import { useState } from 'react';

import { ActionButton, DialogTrigger } from '@adobe/react-spectrum';
import { AxiosError } from 'axios';

import { ElementWithTooltip } from '../../element-with-tooltip/element-with-tooltip.component';
import { JobsIconWithNumber } from '../../jobs-icon-with-number';
import { JobsManagement } from '../jobs-management';

interface JobsManagementOptionProps {
    runningJobs: number | undefined;
    error: AxiosError | null;
    reversedColors?: boolean;
}

export const JobsManagementOption = ({
    runningJobs,
    error,
    reversedColors = false,
}: JobsManagementOptionProps): JSX.Element => {
    const errorMessage = error?.message;

    const [tooltipDisabled, setTooltipDisabled] = useState(false);

    const handleOpenDialog = (isOpen: boolean) => {
        setTooltipDisabled(isOpen);
    };

    return (
        <ElementWithTooltip
            tooltipProps={{ children: errorMessage || 'Jobs' }}
            tooltipTriggerProps={{ isDisabled: tooltipDisabled }}
            content={
                <DialogTrigger type='popover' hideArrow onOpenChange={handleOpenDialog}>
                    <ActionButton id={'tasks-in-progress'} aria-label={'Jobs in progress'} isQuiet>
                        <JobsIconWithNumber
                            runningJobs={runningJobs}
                            reversedColors={reversedColors}
                            isError={!!errorMessage}
                        />
                    </ActionButton>
                    <JobsManagement />
                </DialogTrigger>
            }
        />
    );
};
