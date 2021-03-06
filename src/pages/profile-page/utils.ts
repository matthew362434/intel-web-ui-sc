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
import { ValidationError } from 'yup';

import { ROUTER_PATHS } from '../../core/services';

export const fullNameValidator = yup.string().required('Full name cannot be empty');

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export const isYupValidationError = (error: any): error is ValidationError => {
    return error.name === 'ValidationError' && error.message;
};

export const signOutAction = (): void => {
    const url = `${ROUTER_PATHS.SIGN_OUT}?rd=${window.location.origin}${ROUTER_PATHS.SIGN_OUT_PAGE}`;
    window.location.href = encodeURI(url);
};
