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

import { JobProps, JobState } from '../../../../../core/jobs/job.interface';
import {
    applicationRender,
    getAllWithMatchId,
    getById,
    providersRender as render,
    screen,
} from '../../../../../test-utils';
import { getMockedJob } from '../../../../../test-utils/mocked-items-factory/mocked-jobs';
import { JobTabType } from '../jobs-management.component';
import { Jobs } from './jobs.component';

describe('jobs list', () => {
    const scheduledJobsMock: JobProps[] = [
        getMockedJob(JobState.IDLE, { id: '1', name: 'Test scheduled job', description: 'This is test scheduled job' }),
        getMockedJob(JobState.IDLE, { id: '2', name: 'Test scheduled job', description: 'This is test scheduled job' }),
    ];
    it('Show "There are no jobs." if there are no jobs', () => {
        render(<Jobs isLoading={false} type={JobTabType.RUNNING} jobs={[]} />);
        expect(screen.getByText('There are no jobs.')).toBeInTheDocument();
    });

    it("Show 'Cancel' on running jobs discard button", async () => {
        await applicationRender(<Jobs isLoading={false} type={JobTabType.RUNNING} jobs={[scheduledJobsMock[0]]} />);

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it("Show 'Cancel' on scheduled jobs discard button", async () => {
        await applicationRender(<Jobs isLoading={false} type={JobTabType.SCHEDULED} jobs={[scheduledJobsMock[0]]} />);

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it("Show 'Delete' on failed jobs discard button", async () => {
        await applicationRender(<Jobs isLoading={false} type={JobTabType.FAILED} jobs={[scheduledJobsMock[0]]} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it("Show 'Delete' on finished jobs discard button", async () => {
        await applicationRender(<Jobs isLoading={false} type={JobTabType.FINISHED} jobs={[scheduledJobsMock[0]]} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('Show proper result if there is list of jobs - scheduled tab', async () => {
        const { container } = await applicationRender(
            <Jobs isLoading={false} type={JobTabType.SCHEDULED} jobs={scheduledJobsMock} />
        );

        expect(screen.getAllByText('Test scheduled job')).toHaveLength(2);
        expect(screen.getAllByText('This is test scheduled job')).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(2);
        expect(getAllWithMatchId(container, 'job-item-')).toHaveLength(2);
    });

    it('Cancelled job - check if message is shown', async () => {
        const jobs = [getMockedJob(JobState.CANCELLED, { message: 'Cancelled' })];
        const { container } = await applicationRender(<Jobs isLoading={false} type={JobTabType.RUNNING} jobs={jobs} />);
        expect(getById(container, 'job-additional-information', { exact: false })).toHaveTextContent('Cancelled');
    });
});
