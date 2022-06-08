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

import { useMutation, UseMutationResult } from 'react-query';

import { ExportDatasetStatusDTO, ExportStatusStateDTO } from '../../../core/configurable-parameters/dtos';
import { ExportDatasetIdentifier, ExportDatasetStatusIdentifier } from '../../../core/projects';
import { useProjectService } from '../../../core/projects/hooks';
import { API_URLS } from '../../../core/services';
import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { useLocalStorageExportDataset } from './use-local-storage-export-dataset.hook';

export interface UseExportDataset {
    exportDatasetUrl: (data: ExportDatasetStatusIdentifier) => string;
    exportDatasetStatus: UseMutationResult<ExportDatasetStatusDTO, Error, ExportDatasetStatusIdentifier>;
    prepareExportDataset: UseMutationResult<{ exportDatasetId: string }, Error, ExportDatasetIdentifier>;
}

const isExportingDone = (data: ExportDatasetStatusDTO): boolean => {
    return data.state === ExportStatusStateDTO.DONE;
};

export const useExportDataset = (): UseExportDataset => {
    const service = useProjectService().projectService;

    const { addNotification } = useNotification();
    const { addLsExportDataset } = useLocalStorageExportDataset();

    const prepareExportDataset = useMutation(
        async ({ workspaceId, datasetId, exportFormat }: ExportDatasetIdentifier) => {
            return await service.prepareExportDataset({ workspaceId, datasetId, exportFormat });
        },
        {
            onSuccess: ({ exportDatasetId }, { datasetId, exportFormat }) => {
                return addLsExportDataset({ datasetId, exportFormat, exportDatasetId, isPrepareDone: false });
            },
            onError: (error: Error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    const exportDatasetStatus = useMutation(
        async ({ workspaceId, datasetId, exportDatasetId }: ExportDatasetStatusIdentifier) => {
            return await service.exportDatasetStatus({ workspaceId, datasetId, exportDatasetId });
        },
        {
            onSuccess: (response, { datasetId }) => {
                isExportingDone(response) &&
                    addNotification(`Dataset ${datasetId} is ready to download`, NOTIFICATION_TYPE.INFO);
            },
            onError: (error: Error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    const exportDatasetUrl = ({ workspaceId, datasetId, exportDatasetId }: ExportDatasetStatusIdentifier) =>
        `/api/${API_URLS.EXPORT_DATASET(workspaceId, datasetId, exportDatasetId)}`;

    return { prepareExportDataset, exportDatasetStatus, exportDatasetUrl };
};
