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
import { API_URLS } from '../../services';
import AxiosInstance from '../../services/axios-instance';
import { ForgotPasswordDTO, ResetPasswordDTO, UserRegistrationDTO } from '../dtos';

export interface UserService {
    registerUser: (body: UserRegistrationDTO) => Promise<void>;
    forgotPassword: (body: ForgotPasswordDTO) => Promise<void>;
    resetPassword: (body: ResetPasswordDTO) => Promise<void>;
}

export const createApiUserService = (): UserService => {
    const registerUser = async (body: UserRegistrationDTO): Promise<void> => {
        await AxiosInstance.post(API_URLS.USER_REGISTRATION, body);
    };

    const forgotPassword = async (body: ForgotPasswordDTO): Promise<void> => {
        await AxiosInstance.post(API_URLS.USER_FORGOT_PASSWORD, body);
    };

    const resetPassword = async (body: ResetPasswordDTO): Promise<void> => {
        await AxiosInstance.post(API_URLS.USER_RESET_PASSWORD, body);
    };

    return {
        registerUser,
        forgotPassword,
        resetPassword,
    };
};
