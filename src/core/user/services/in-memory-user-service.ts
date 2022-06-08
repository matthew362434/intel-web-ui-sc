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
import { ForgotPasswordDTO, ResetPasswordDTO, UserRegistrationDTO } from '../dtos';
import { UserService } from './api-user-service';

export const createInMemoryUserRegistrationService = (): UserService => {
    const registerUser = async (_body: UserRegistrationDTO): Promise<void> => {
        return Promise.resolve();
    };

    const forgotPassword = async (_body: ForgotPasswordDTO): Promise<void> => {
        return Promise.resolve();
    };

    const resetPassword = async (_body: ResetPasswordDTO): Promise<void> => {
        return Promise.resolve();
    };

    return {
        registerUser,
        forgotPassword,
        resetPassword,
    };
};
