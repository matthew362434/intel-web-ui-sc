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
import { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { useJobsService } from './use-jobs-service.hook';

interface UseDeleteJobProps {
    deleteJob: UseMutationResult<unknown, Error, { workspaceId: string; jobId: string }>;
}

export const useDeleteJob = (): UseDeleteJobProps => {
    const { addNotification } = useNotification();
    const service = useJobsService().jobsService;
    const deleteJob = useMutation(
        async ({ workspaceId, jobId }: { workspaceId: string; jobId: string }) => {
            await service.deleteJob(workspaceId, jobId);
        },
        {
            onError: (error: AxiosError | Error) => {
                const responseMessage = 'response' in error ? error.response?.data?.message : undefined;
                const errorContent = responseMessage || error.message;
                addNotification(errorContent, NOTIFICATION_TYPE.ERROR);
            },
        }
    );

    return { deleteJob };
};
