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
import { useMemo } from 'react';

import {
    CreateApiModelConfigParametersService,
    createApiModelConfigParametersService,
    createInMemoryApiModelConfigParametersService,
} from '../services';

interface UseConfigParametersService {
    configParametersService: CreateApiModelConfigParametersService;
}

export const useConfigParametersService = (): UseConfigParametersService => {
    return useMemo(() => {
        if (process.env.REACT_APP_VALIDATION_COMPONENT_TESTS === 'true') {
            return { configParametersService: createInMemoryApiModelConfigParametersService() };
        }

        return {
            configParametersService: createApiModelConfigParametersService(),
        };
    }, []);
};
