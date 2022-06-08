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

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { useApplicationServices } from '../../../providers/application-provider/application-services-provider.component';
import { ROUTER_PATHS } from '../../services';
import { ResetPasswordDTO } from '../dtos';

interface UseResetPasswordMutation {
    resetPassword: UseMutationResult<unknown, AxiosError, ResetPasswordDTO>;
}

export const useResetPassword = (): UseResetPasswordMutation => {
    const { userService } = useApplicationServices();
    const { addNotification } = useNotification();
    const resetPassword = useMutation<unknown, AxiosError, ResetPasswordDTO>(
        async (body: ResetPasswordDTO) => {
            await userService.resetPassword(body);
        },
        {
            onError: (error) => {
                addNotification(error.message, NOTIFICATION_TYPE.ERROR);
            },
            onSuccess: () => {
                window.location.href = ROUTER_PATHS.HOME;
            },
        }
    );
    return {
        resetPassword,
    };
};
