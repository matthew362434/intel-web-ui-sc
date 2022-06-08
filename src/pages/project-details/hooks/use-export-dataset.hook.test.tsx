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

import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react-hooks';

import { ExportStatusStateDTO } from '../../../core/configurable-parameters/dtos';
import { ExportDatasetStatusIdentifier, ExportFormats } from '../../../core/projects';
import { API_URLS } from '../../../core/services';
import { NOTIFICATION_TYPE } from '../../../notification';
import { RequiredProviders } from '../../../test-utils';
import { useExportDataset } from './use-export-dataset.hook';

const mockExportDatasetId = '241';
const mockExportDatasetStatusIdentifier: ExportDatasetStatusIdentifier = {
    datasetId: '123',
    workspaceId: '321',
    exportDatasetId: mockExportDatasetId,
};

const mockeAddLsExportDataset = jest.fn();
jest.mock('./use-local-storage-export-dataset.hook', () => ({
    ...jest.requireActual('./use-local-storage-export-dataset.hook'),
    useLocalStorageExportDataset: () => ({
        addLsExportDataset: mockeAddLsExportDataset,
    }),
}));

const mockAddNotification = jest.fn();
jest.mock('../../../notification', () => ({
    ...jest.requireActual('../../../notification'),
    useNotification: () => ({ addNotification: mockAddNotification }),
}));

const mockprepareExportDataset = jest.fn();
const mockexportDatasetStatus = jest.fn();
jest.mock('../../../core/projects/hooks', () => ({
    ...jest.requireActual('../../../core/projects/hooks'),
    useProjectService: () => ({
        projectService: {
            prepareExportDataset: mockprepareExportDataset,
            exportDatasetStatus: mockexportDatasetStatus,
        },
    }),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
    return <RequiredProviders>{children}</RequiredProviders>;
};

describe('useStatus', () => {
    const errorMesage = 'test message';

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('retrieves the download url', async () => {
        const { result } = renderHook(() => useExportDataset(), { wrapper });

        const { workspaceId, datasetId, exportDatasetId } = mockExportDatasetStatusIdentifier;
        const exportUrl = result.current.exportDatasetUrl({ workspaceId, datasetId, exportDatasetId });
        expect(exportUrl).toBe(`/api/${API_URLS.EXPORT_DATASET(workspaceId, datasetId, exportDatasetId)}`);
    });

    describe('prepareExportDataset', () => {
        it('save info in local storage', async () => {
            mockprepareExportDataset.mockResolvedValue({ exportDatasetId: mockExportDatasetId });
            const { result, waitForNextUpdate } = renderHook(() => useExportDataset(), { wrapper });
            const { workspaceId, datasetId } = mockExportDatasetStatusIdentifier;

            result.current.prepareExportDataset.mutate({
                workspaceId,
                datasetId,
                exportFormat: ExportFormats.YOLO,
            });

            await waitForNextUpdate();
            expect(mockeAddLsExportDataset).toBeCalledWith({
                datasetId,
                isPrepareDone: false,
                exportFormat: ExportFormats.YOLO,
                exportDatasetId: mockExportDatasetId,
            });
        });

        it('shows notification error message', async () => {
            mockprepareExportDataset.mockRejectedValue({ message: errorMesage });
            const { result, waitForNextUpdate } = renderHook(() => useExportDataset(), { wrapper });
            const { workspaceId, datasetId } = mockExportDatasetStatusIdentifier;

            result.current.prepareExportDataset.mutate({
                workspaceId,
                datasetId,
                exportFormat: ExportFormats.YOLO,
            });

            await waitForNextUpdate();
            expect(mockAddNotification).toBeCalledWith(errorMesage, NOTIFICATION_TYPE.ERROR);
        });
    });

    describe('exportDatasetStatus', () => {
        it('export is not "DONE", do not show notifications', async () => {
            mockexportDatasetStatus.mockResolvedValue({ state: '' });
            const { result, waitForNextUpdate } = renderHook(() => useExportDataset(), { wrapper });
            const { workspaceId, datasetId } = mockExportDatasetStatusIdentifier;

            result.current.exportDatasetStatus.mutate({
                workspaceId,
                datasetId,
                exportDatasetId: mockExportDatasetId,
            });

            await waitForNextUpdate();
            expect(mockAddNotification).not.toBeCalled();
        });

        it('show notifications', async () => {
            mockexportDatasetStatus.mockResolvedValue({ state: ExportStatusStateDTO.DONE });
            const { result, waitForNextUpdate } = renderHook(() => useExportDataset(), { wrapper });
            const { workspaceId, datasetId } = mockExportDatasetStatusIdentifier;

            result.current.exportDatasetStatus.mutate({
                workspaceId,
                datasetId,
                exportDatasetId: mockExportDatasetId,
            });

            await waitForNextUpdate();
            expect(mockAddNotification).toBeCalledWith(expect.any(String), NOTIFICATION_TYPE.INFO);
        });

        it('shows notification error message', async () => {
            mockexportDatasetStatus.mockRejectedValue({ message: errorMesage });
            const { result, waitForNextUpdate } = renderHook(() => useExportDataset(), { wrapper });
            const { workspaceId, datasetId } = mockExportDatasetStatusIdentifier;

            result.current.exportDatasetStatus.mutate({
                workspaceId,
                datasetId,
                exportDatasetId: mockExportDatasetId,
            });

            await waitForNextUpdate();
            expect(mockAddNotification).toBeCalledWith(errorMesage, NOTIFICATION_TYPE.ERROR);
        });
    });
});
