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

import { screen } from '@testing-library/react';

import { JobState } from '../../../../../../core/jobs/job.interface';
import { applicationRender } from '../../../../../../test-utils';
import { getMockedJob } from '../../../../../../test-utils/mocked-items-factory/mocked-jobs';
import { DISCARD } from './discard-button/discard-button.component';
import { JobItem } from './job-item.component';

const mockJob = getMockedJob(JobState.IDLE, {
    id: '2',
    name: 'Test scheduled job',
    description: 'This is test scheduled job',
});

describe('jobs list', () => {
    it("Don't show the progress bar when there is no status", async () => {
        await applicationRender(
            <JobItem id={mockJob.id} header={mockJob.name} discardType={DISCARD.CANCEL} message={mockJob.description} />
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('Show the progress bar when has status progress', async () => {
        await applicationRender(
            <JobItem
                id={mockJob.id}
                header={mockJob.name}
                discardType={DISCARD.CANCEL}
                message={mockJob.description}
                status={{
                    message: 'Training - Base model training (Step 1/5)',
                    progress: '50%',
                    timeRemaining: '123123',
                }}
            />
        );
        expect(screen.queryByRole('progressbar')).toBeInTheDocument();
    });
});
