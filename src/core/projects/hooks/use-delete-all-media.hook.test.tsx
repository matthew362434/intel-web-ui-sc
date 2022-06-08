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

import { act, renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useProjectService, UseProjectServiceInterface } from '.';
import { NOTIFICATION_TYPE } from '../../../notification';
import { useDeleteAllMedia } from './use-delete-all-media.hook';

const mockInvalidateQueries = jest.fn();
jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const mockAddNotification = jest.fn();
jest.mock('../../../notification', () => ({
    ...jest.requireActual('../../../notification'),
    useNotification: () => ({ addNotification: mockAddNotification }),
}));

jest.mock('./use-project-service.hook', () => ({
    ...jest.requireActual('./use-project-service.hook'),
    useProjectService: jest.fn(),
}));

const updateUseProjectService = (result: Promise<string>) => {
    const mocks: unknown = {
        projectService: {
            deleteAllMedia: jest.fn(() => result),
        },
    };

    jest.mocked(useProjectService).mockImplementationOnce(() => mocks as UseProjectServiceInterface);

    return mocks as UseProjectServiceInterface;
};

const wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const mockDatasetIdentifier = { workspaceId: '1', projectId: '4', datasetId: '1234' };

describe('useDeleteAllMedia', () => {
    it('mockInvalidateQueries is called when the call succeeds', async () => {
        const { projectService } = updateUseProjectService(Promise.resolve(''));
        const { result, waitForNextUpdate } = renderHook(() => useDeleteAllMedia(), { wrapper });

        act(() => {
            result.current.deleteAllMedia.mutate(mockDatasetIdentifier);
        });

        await waitForNextUpdate();

        expect(mockInvalidateQueries).toHaveBeenCalled();
        expect(mockAddNotification).not.toHaveBeenCalled();
        expect(projectService.deleteAllMedia).toHaveBeenCalledWith(mockDatasetIdentifier);
    });

    it('addNotification is called when the call fails', async () => {
        const error = { message: 'test' };
        const { projectService } = updateUseProjectService(Promise.reject(error));
        const { result, waitForNextUpdate } = renderHook(() => useDeleteAllMedia(), { wrapper });

        act(() => {
            result.current.deleteAllMedia.mutate(mockDatasetIdentifier);
        });

        await waitForNextUpdate();

        expect(projectService.deleteAllMedia).toHaveBeenCalledWith(mockDatasetIdentifier);
        expect(mockAddNotification).toHaveBeenCalledWith(error.message, NOTIFICATION_TYPE.ERROR);
    });
});
