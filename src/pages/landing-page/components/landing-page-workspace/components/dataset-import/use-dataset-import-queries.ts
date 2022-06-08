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

import { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../../../../notification';
import { createApiDatasetImportService } from './api-dataset-import-service';
import {
    DatasetImportPrepareResponse,
    DatasetImportCreateResponse,
    DatasetImportPrepareProps,
    DatasetImportCreateProps,
} from './dataset-import.interface';

interface UseDatasetImportQueries {
    prepare: UseMutationResult<DatasetImportPrepareResponse, AxiosError, DatasetImportPrepareProps>;
    create: UseMutationResult<DatasetImportCreateResponse, AxiosError, DatasetImportCreateProps>;
}

export const useDatasetImportQueries = (): UseDatasetImportQueries => {
    const service = createApiDatasetImportService();
    const { addNotification } = useNotification();

    const prepare = useMutation<DatasetImportPrepareResponse, AxiosError, DatasetImportPrepareProps>(
        async ({ workspaceId, uploadId }: DatasetImportPrepareProps) => {
            const response = await service.prepare({ workspaceId, uploadId });

            return response;
        },
        {
            onError: (error: AxiosError | Error) => {
                const responseMessage = 'response' in error ? error.response?.data?.message : undefined;
                const errorContent = responseMessage || error.message;

                addNotification(errorContent, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    const create = useMutation<DatasetImportCreateResponse, AxiosError, DatasetImportCreateProps>(
        async ({ workspaceId, projectData }: DatasetImportCreateProps) => {
            const response = await service.create({ workspaceId, projectData });

            return response;
        },
        {
            onError: (error: AxiosError | Error) => {
                const responseMessage = 'response' in error ? error.response?.data?.message : undefined;
                const errorContent = responseMessage || error.message;

                addNotification(errorContent, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return { prepare, create };
};
