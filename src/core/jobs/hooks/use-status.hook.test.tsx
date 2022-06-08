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

import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

import { NOTIFICATION_TYPE } from '../../../notification';
import { useStatus } from './use-status.hook';

const mockedGetStatus = jest.fn();
jest.mock('./use-status-service.hook', () => ({
    ...jest.requireActual('./use-status-service.hook'),
    useStatusService: () => ({
        statusService: {
            getStatus: mockedGetStatus,
        },
    }),
}));

const mockAddNotification = jest.fn();
jest.mock('../../../notification', () => ({
    ...jest.requireActual('../../../notification'),
    useNotification: () => ({ addNotification: mockAddNotification }),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useStatus', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('shows a warning when free space is less than 10', async () => {
        const warning = 'warning test';
        mockedGetStatus.mockImplementationOnce(() => Promise.resolve({ freeSpace: '9.999 GB', warning }));
        const { waitForNextUpdate } = renderHook(() => useStatus(), { wrapper });
        await waitForNextUpdate();

        expect(mockAddNotification).toHaveBeenCalledWith(warning, NOTIFICATION_TYPE.WARNING);
    });

    describe('not shows the notification', () => {
        it('freeSpace is greater than 10', async () => {
            mockedGetStatus.mockImplementationOnce(() => Promise.resolve({ freeSpace: '100 GB' }));
            const { waitForNextUpdate } = renderHook(() => useStatus(), { wrapper });
            await waitForNextUpdate();

            expect(mockAddNotification).not.toHaveBeenCalled();
        });

        it('freeSpace does not have the proper format', async () => {
            mockedGetStatus.mockImplementationOnce(() => Promise.resolve({ freeSpace: '100' }));
            const { waitForNextUpdate } = renderHook(() => useStatus(), { wrapper });
            await waitForNextUpdate();

            expect(mockAddNotification).not.toHaveBeenCalled();
        });

        it('freeSpace is not a number', async () => {
            mockedGetStatus.mockImplementationOnce(() => Promise.resolve({ freeSpace: 'qwer GB' }));
            const { waitForNextUpdate } = renderHook(() => useStatus(), { wrapper });
            await waitForNextUpdate();

            expect(mockAddNotification).not.toHaveBeenCalled();
        });
    });
});
