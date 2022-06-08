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

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NOTIFICATION_TYPE } from '../../../../../../../notification';
import { applicationRender as render, screen } from '../../../../../../../test-utils';
import { DISCARD, DiscardButton } from './discard-button.component';

let mockNotificationMessages: string[] = [];

const mockedAddNotification = jest.fn((text: string, _type: NOTIFICATION_TYPE) => {
    mockNotificationMessages.push(text);
});

jest.mock('../../../../../../../notification', () => ({
    ...jest.requireActual('../../../../../../../notification'),
    useNotification: () => {
        return {
            addNotification: mockedAddNotification,
        };
    },
}));

beforeEach(() => {
    mockNotificationMessages = [];
});

describe('Discard button', () => {
    it('Cancel button should display confirmation window', async () => {
        await render(<DiscardButton discardType={DISCARD.CANCEL} jobId={'1'} jobMessage={'test job'} />);
        userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByText('Confirmation of job deletion')).toBeInTheDocument();
    });

    it('Check if confirmation dialog has proper text and buttons', async () => {
        await render(<DiscardButton discardType={DISCARD.CANCEL} jobId={'1'} jobMessage={'Test job'} />);
        userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel the job' })).toBeInTheDocument();
        expect(screen.getByText('Do you want to cancel Test job?')).toBeInTheDocument();
    });

    it('Delete button should not display confirmation window', async () => {
        await render(<DiscardButton discardType={DISCARD.DELETE} jobId={'1'} jobMessage={'test job'} />);
        userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(screen.queryByText('Confirmation of job deletion')).not.toBeInTheDocument();
    });

    it('Cannot delete job-2 and show proper message', async () => {
        await render(<DiscardButton discardType={DISCARD.DELETE} jobId={'job-2'} jobMessage={'test job'} />);
        userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(mockNotificationMessages).toStrictEqual(['Job cannot be deleted just because']);
        });
    });

    it('Cannot delete job-3 and show proper message', async () => {
        await render(<DiscardButton discardType={DISCARD.DELETE} jobId={'job-3'} jobMessage={'test job'} />);
        userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(mockNotificationMessages).toStrictEqual(['Some error occurred']);
        });
    });
});
