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

import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

import { NOTIFICATION_TYPE } from '../../../notification';
import { useDeleteProject } from './use-delete-project.hook';
import { useProjectService, UseProjectServiceInterface } from './use-project-service.hook';

const mockSetQueryData = jest.fn();
jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQueryClient: () => ({ setQueryData: mockSetQueryData }),
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
            deleteProject: jest.fn(() => result),
        },
    };
    jest.mocked(useProjectService).mockImplementationOnce(() => mocks as UseProjectServiceInterface);
    return mocks as UseProjectServiceInterface;
};

const wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useDeleteProject', () => {
    it('call setQueryData when resolve successfully', async () => {
        const { projectService } = updateUseProjectService(Promise.resolve(''));
        const { result, waitForNextUpdate } = renderHook(() => useDeleteProject(), { wrapper });
        const mockData = { workspaceId: '1', projectId: '4' };

        act(() => {
            result.current.deleteProject.mutate(mockData);
        });

        await waitForNextUpdate();

        expect(mockSetQueryData).toHaveBeenCalled();
        expect(mockAddNotification).not.toHaveBeenCalled();
        expect(projectService.deleteProject).toHaveBeenCalledWith(mockData);
    });

    it('call addNotification when rejects', async () => {
        const error = { message: 'test' };
        const { projectService } = updateUseProjectService(Promise.reject(error));
        const { result, waitForNextUpdate } = renderHook(() => useDeleteProject(), { wrapper });
        const mockData = { workspaceId: '1', projectId: '4' };

        act(() => {
            result.current.deleteProject.mutate(mockData);
        });

        await waitForNextUpdate();

        expect(projectService.deleteProject).toHaveBeenCalledWith(mockData);
        expect(mockAddNotification).toHaveBeenCalledWith(error.message, NOTIFICATION_TYPE.ERROR);
    });
});
