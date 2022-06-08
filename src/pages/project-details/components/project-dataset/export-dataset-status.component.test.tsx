// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { render, RenderResult } from '@testing-library/react';

import { ExportStatusStateDTO } from '../../../../core/configurable-parameters/dtos';
import { ExportFormats } from '../../../../core/projects';
import { UseExportDataset, useExportDataset } from '../../hooks/use-export-dataset.hook';
import { ExportDatasetStatus, RETRY_AFTER } from './export-dataset-status.component';

jest.mock('../../hooks/use-export-dataset.hook', () => ({
    ...jest.requireActual('../../hooks/use-export-dataset.hook'),
    useExportDataset: jest.fn(() => ({ exportDatasetStatus: {} })),
}));

const mockWorkspaceId = '123';
const mockLocalStorage = {
    datasetId: '123',
    exportFormat: ExportFormats.YOLO,
    isPrepareDone: false,
    exportDatasetId: '321',
};

describe('ExportDatasetStatus', () => {
    const renderApp = async (): Promise<{
        mockOnCloseStatus: jest.Mock;
        mockOnPrepareDone: jest.Mock;
        component: RenderResult;
    }> => {
        const mockOnPrepareDone = jest.fn();
        const mockOnCloseStatus = jest.fn();
        const component = await render(
            <ExportDatasetStatus
                onCloseStatus={mockOnCloseStatus}
                workspaceId={mockWorkspaceId}
                localStorageData={mockLocalStorage}
                onPrepareDone={mockOnPrepareDone}
            />
        );

        return { mockOnCloseStatus, mockOnPrepareDone, component };
    };

    beforeAll(() => {
        jest.useFakeTimers('modern');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.clearAllTimers();
    });

    it('renders and calls the export status service', async () => {
        const mockMutate = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetStatus: {
                mutate: mockMutate,
            },
        } as unknown as UseExportDataset);

        await renderApp();

        expect(mockMutate).toHaveBeenNthCalledWith(1, {
            workspaceId: mockWorkspaceId,
            datasetId: mockLocalStorage.datasetId,
            exportDatasetId: mockLocalStorage.exportDatasetId,
        });
    });

    it('checks if the status is "Done" and call the service again', async () => {
        const mockMutate = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetStatus: {
                isSuccess: true,
                mutate: mockMutate,
            },
        } as unknown as UseExportDataset);

        await renderApp();
        jest.advanceTimersByTime(RETRY_AFTER);

        expect(mockMutate).toHaveBeenCalledTimes(2);
    });

    it('calls "onPrepareDone" when status is "DONE"', async () => {
        const mockMutate = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetStatus: {
                isSuccess: true,
                mutate: mockMutate,
                data: { state: ExportStatusStateDTO.DONE },
            },
        } as unknown as UseExportDataset);

        const { mockOnPrepareDone } = await renderApp();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockOnPrepareDone).toHaveBeenCalledWith(mockLocalStorage);
    });

    it('calls "mockOnCloseStatus" when there is an error', async () => {
        const mockMutate = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetStatus: {
                isError: true,
                isSuccess: true,
                mutate: mockMutate,
                data: { state: ExportStatusStateDTO.ERROR },
            },
        } as unknown as UseExportDataset);

        const { mockOnCloseStatus } = await renderApp();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockOnCloseStatus).toHaveBeenCalledWith(mockLocalStorage.datasetId);
    });

    it('skip extra mutation when the status is "loading"', async () => {
        const mockMutate = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetStatus: {
                isLoading: true,
                mutate: mockMutate,
            },
        } as unknown as UseExportDataset);

        const { mockOnCloseStatus, mockOnPrepareDone } = await renderApp();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockOnCloseStatus).not.toHaveBeenCalled();
        expect(mockOnPrepareDone).not.toHaveBeenCalled();
    });
});
