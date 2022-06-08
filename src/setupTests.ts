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

import '@testing-library/jest-dom';
import '@wessberg/pointer-events';

window.ResizeObserver = class ResizeObserver {
    observe() {
        // empty
    }
    unobserve() {
        // empty
    }
    disconnect() {
        // empty
    }
};

// We need to specifically mock this util because it uses `import.meta.url` which is not supported by jest.
// More info at https://github.com/facebook/jest/issues/12183
jest.mock('./hooks/use-worker/utils.ts', () => ({ getWorker: jest.fn() }));

jest.mock('comlink');

process.env.REACT_APP_VALIDATION_COMPONENT_TESTS = 'true';
