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

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExportFormats } from '../../../../core/projects';
import { UseExportDataset, useExportDataset } from '../../hooks/use-export-dataset.hook';
import { ExportDatasetDownload } from './export-dataset-download.component';

jest.mock('../../hooks/use-export-dataset.hook', () => ({
    ...jest.requireActual('../../hooks/use-export-dataset.hook'),
    useExportDataset: jest.fn(() => ({ exportDatasetStatus: {} })),
}));

const mockWorkspaceId = '123';
const mockLocalStorage = {
    datasetId: '123',
    exportFormat: ExportFormats.COCO,
    isPrepareDone: false,
    exportDatasetId: '321',
};

describe('ExportDatasetDownload', () => {
    const renderApp = async (): Promise<{ mockOnCloseDownload: jest.Mock; component: RenderResult }> => {
        const mockOnCloseDownload = jest.fn();
        const component = await render(
            <Provider theme={defaultTheme}>
                <ExportDatasetDownload
                    workspaceId={mockWorkspaceId}
                    localStorageData={mockLocalStorage}
                    onCloseDownload={mockOnCloseDownload}
                />
            </Provider>
        );

        return { mockOnCloseDownload, component };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls "onCloseDownload" after closing', async () => {
        const mocExportDatasetUrl = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetUrl: mocExportDatasetUrl,
        } as unknown as UseExportDataset);

        const { mockOnCloseDownload } = await renderApp();

        userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockOnCloseDownload).toHaveBeenNthCalledWith(1, mockLocalStorage.datasetId);
    });

    it('render the download url', async () => {
        const mocExportDatasetUrl = jest.fn();

        jest.mocked(useExportDataset).mockReturnValueOnce({
            exportDatasetUrl: mocExportDatasetUrl,
        } as unknown as UseExportDataset);

        await renderApp();

        const downloadLink = screen.getByLabelText('export-download-url');
        expect(downloadLink).toBeInTheDocument();
        expect(downloadLink).toHaveAttribute('download', `sonoma_creek_${mockLocalStorage.datasetId}.zip`);
        expect(mocExportDatasetUrl).toHaveBeenCalledWith({
            workspaceId: mockWorkspaceId,
            datasetId: mockLocalStorage.datasetId,
            exportDatasetId: mockLocalStorage.exportDatasetId,
        });
    });
});
