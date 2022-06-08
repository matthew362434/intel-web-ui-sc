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

import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { DatasetIdentifier } from '..';
import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import QUERY_KEYS from '../../requests/query-keys';
import { useProjectService } from './use-project-service.hook';

interface UseDeleteAllMedia {
    deleteAllMedia: UseMutationResult<string, Error, DatasetIdentifier>;
}

export const useDeleteAllMedia = (): UseDeleteAllMedia => {
    const service = useProjectService().projectService;
    const client = useQueryClient();

    const { addNotification } = useNotification();

    const deleteAllMedia = useMutation<string, Error, DatasetIdentifier>(
        async ({ workspaceId, projectId, datasetId }: DatasetIdentifier) => {
            return await service.deleteAllMedia({ workspaceId, projectId, datasetId });
        },
        {
            onSuccess: async (_, variables: DatasetIdentifier) => {
                await client.invalidateQueries(QUERY_KEYS.MEDIA_ITEMS(variables));
                await client.invalidateQueries(QUERY_KEYS.ADVANCED_MEDIA_ITEMS(variables, {}, {}));
            },
            onError: (error: Error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return { deleteAllMedia };
};
