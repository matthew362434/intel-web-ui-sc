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

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { NETWORK_ERROR_MESSAGE } from '../../providers';
import { LOCAL_STORAGE_KEYS } from '../../shared/local-storage-keys';
import { removeLocalStorageKey } from '../../shared/utils';

const instance = axios.create({
    baseURL: `/api/`,
});

const SERVER_IS_UNAVAILABLE_STATUS_CODES = [StatusCodes.SERVICE_UNAVAILABLE, StatusCodes.TOO_MANY_REQUESTS];

instance.interceptors.response.use(
    (response) => {
        if (
            response.headers['content-type']?.includes('text/html') &&
            response.request?.responseURL?.includes('/dex/auth/')
        ) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.UNAUTHORIZED, 'true');
            window.dispatchEvent(new Event('storage'));

            return Promise.reject(response);
        } else {
            removeLocalStorageKey(LOCAL_STORAGE_KEYS.UNAUTHORIZED);
        }

        return response;
    },
    (error) => {
        const statusCode = error?.response?.status ?? '';
        const message = error?.response?.data?.message || error?.response?.data;

        if (SERVER_IS_UNAVAILABLE_STATUS_CODES.includes(statusCode)) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICE_UNAVAILABLE, 'true');
            window.dispatchEvent(new Event('storage'));

            return;
        }

        if (message && typeof message === 'string') {
            error.message = statusCode
                ? `Request failed with status code ${statusCode}: ${message}`
                : `Error: ${message}`;
        } else {
            // In case of a 422 error response, we need to show a specific message
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
            const isUnprocessableEntity = statusCode === StatusCodes.UNPROCESSABLE_ENTITY;

            if (isUnprocessableEntity && error.response.data.detail) {
                error.message = error.response.data.detail;
            } else {
                // If there is no response, then the `message` will be `null`, and `as per axios design,
                // the default error is a network error
                error.message = NETWORK_ERROR_MESSAGE;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
