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
import { useOverlayTriggerState } from '@react-stately/overlays';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExportStatusStateDTO } from '../../../../core/configurable-parameters/dtos';
import { DatasetIdentifier, ExportFormats } from '../../../../core/projects';
import { RequiredProviders } from '../../../../test-utils';
import { UseExportDataset, useExportDataset } from '../../hooks/use-export-dataset.hook';
import { ExportDatasetNotification } from './export-dataset-notification.component';
import { RETRY_AFTER } from './export-dataset-status.component';

const mockdatasetIdentifier: DatasetIdentifier = {
    datasetId: '123',
    projectId: '412',
    workspaceId: '321',
};

const mockExportDatasetLSData = {
    isPrepareDone: false,
    exportDatasetId: '231',
    exportFormat: ExportFormats.VOC,
    datasetId: mockdatasetIdentifier.datasetId,
};

const mockupdateLsExportDataset = jest.fn();
const mockremoveDatasetLsByDatasetId = jest.fn();
const mockgetDatasetLsByDatasetId = jest.fn();
jest.mock('../../hooks/use-local-storage-export-dataset.hook', () => ({
    useLocalStorageExportDataset: () => ({
        getDatasetLsByDatasetId: mockgetDatasetLsByDatasetId,
        updateLsExportDataset: mockupdateLsExportDataset,
        removeDatasetLsByDatasetId: mockremoveDatasetLsByDatasetId,
    }),
}));

jest.mock('../../hooks/use-export-dataset.hook');

const updateUseExportDataset = (status: string, state: ExportStatusStateDTO) =>
    jest.mocked(useExportDataset).mockReturnValue({
        exportDatasetStatus: {
            status,
            isSuccess: true,
            mutate: jest.fn(),
            data: { state },
        },
        exportDatasetUrl: jest.fn(),
    } as unknown as UseExportDataset);

const App = () => {
    const visibilityState = useOverlayTriggerState({});
    return (
        <>
            <button onClick={() => visibilityState.open()}>open dialog</button>
            <RequiredProviders>
                <Provider theme={defaultTheme}>
                    <ExportDatasetNotification
                        visibilityState={visibilityState}
                        datasetIdentifier={mockdatasetIdentifier}
                    />
                </Provider>
            </RequiredProviders>
        </>
    );
};

const renderApp = async ({ isOpen } = { isOpen: true }): Promise<RenderResult> => {
    const component = await render(<App />);
    isOpen && userEvent.click(screen.getByText('open dialog'));

    return component;
};

describe('ExportDatasetNotification', () => {
    beforeAll(() => {
        jest.useFakeTimers('modern');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.clearAllTimers();
    });

    it('renders empty when local storage does not have export dataset info', async () => {
        await renderApp();

        expect(screen.queryByLabelText('export-dataset-notifications')).not.toBeInTheDocument();
        expect(mockgetDatasetLsByDatasetId).toHaveBeenLastCalledWith(mockdatasetIdentifier.datasetId);
    });

    it('closes exportStatus and opens exportDownload', async () => {
        mockgetDatasetLsByDatasetId.mockReturnValue(mockExportDatasetLSData);
        updateUseExportDataset('loading', ExportStatusStateDTO.EXPORTING);
        const { rerender } = await renderApp();
        expect(screen.queryByLabelText('export-dataset-status')).toBeInTheDocument();

        updateUseExportDataset('success', ExportStatusStateDTO.DONE);
        rerender(<App />);
        jest.advanceTimersByTime(RETRY_AFTER);

        expect(screen.queryByLabelText('export-dataset-status')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('export-dataset-download')).toBeInTheDocument();
    });

    it('closes exportDownload and exportNotification', async () => {
        mockgetDatasetLsByDatasetId.mockReturnValue({ ...mockExportDatasetLSData, isPrepareDone: true });
        await renderApp();
        expect(screen.queryByLabelText('export-dataset-download')).toBeInTheDocument();

        mockgetDatasetLsByDatasetId.mockReturnValue(undefined);
        userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(mockremoveDatasetLsByDatasetId).toHaveBeenNthCalledWith(1, mockExportDatasetLSData.datasetId);
        expect(screen.queryByLabelText('export-dataset-download')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('export-dataset-notifications')).not.toBeInTheDocument();
    });

    it('reopens with ExportDatasetStatus', async () => {
        mockgetDatasetLsByDatasetId.mockReturnValue(mockExportDatasetLSData);
        updateUseExportDataset('loading', ExportStatusStateDTO.EXPORTING);
        await renderApp({ isOpen: false });

        expect(screen.queryByLabelText('export-dataset-status')).toBeInTheDocument();
        expect(screen.queryByLabelText('export-dataset-download')).not.toBeInTheDocument();
    });

    it('reopens with dataset-download', async () => {
        mockgetDatasetLsByDatasetId.mockReturnValue({ ...mockExportDatasetLSData, isPrepareDone: true });
        await renderApp({ isOpen: false });

        expect(screen.queryByLabelText('export-dataset-download')).toBeInTheDocument();
        expect(screen.queryByLabelText('export-dataset-status')).not.toBeInTheDocument();
    });
});
