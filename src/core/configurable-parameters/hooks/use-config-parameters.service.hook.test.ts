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

import { renderHook } from '@testing-library/react-hooks';

import { useConfigParametersService } from './use-config-parameters-service.hook';

jest.mock('../services', () => ({
    createInMemoryApiModelConfigParametersService: () => ({
        getConfigParameters: () => 'in memory',
    }),
    createApiModelConfigParametersService: () => ({
        getConfigParameters: () => 'actual api call',
    }),
}));

describe('useConfigParametersService', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('returns the inMemory service if validation tests are running', () => {
        process.env = { ...OLD_ENV, REACT_APP_VALIDATION_COMPONENT_TESTS: 'true' };

        const { result } = renderHook(() => useConfigParametersService());

        expect(result.current.configParametersService.getConfigParameters('', '')).toEqual('in memory');
    });

    it('returns the actual service if the app is running', () => {
        process.env = { ...OLD_ENV, REACT_APP_VALIDATION_COMPONENT_TESTS: 'false' };

        const { result } = renderHook(() => useConfigParametersService());

        expect(result.current.configParametersService.getConfigParameters('', '')).toEqual('actual api call');
    });
});
