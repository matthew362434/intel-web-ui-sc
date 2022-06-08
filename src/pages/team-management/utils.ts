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

import * as yup from 'yup';

import { confirmPasswordErrorMessage, newPasswordErrorMessage, passwordRegex } from '../../shared/utils';
import { DISTINCT_COLORS } from '../create-project/components/distinct-colors';
import { PasswordState } from './add-member-popup';

export const MAX_NUMBER_OF_CHARACTERS = 100;

export const defaultPasswordState: PasswordState = {
    value: '',
    error: '',
};

export const validatePasswordsSchema = yup.object({
    password: yup.string().required('Password is required').matches(passwordRegex, newPasswordErrorMessage),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], confirmPasswordErrorMessage),
});

export const validateEmail = yup.string().email();

export const BACKGROUND_COLORS = [...DISTINCT_COLORS];

export const randomizeColor = (): string => {
    if (!BACKGROUND_COLORS.length) {
        BACKGROUND_COLORS.push(...DISTINCT_COLORS);
    }

    const backgroundColor = BACKGROUND_COLORS[0];

    BACKGROUND_COLORS.splice(0, 1);

    return backgroundColor;
};

export const resetColors = (): void => {
    BACKGROUND_COLORS.splice(0, BACKGROUND_COLORS.length);
    BACKGROUND_COLORS.push(...DISTINCT_COLORS);
};
