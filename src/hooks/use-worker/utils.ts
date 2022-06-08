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

import { AlgorithmType } from './use-worker.hook';

// We couldn't make it simple and just assign a path to each AlgorithmType because `URL` needs a hardcoded string
// e.g. new URL(someVariableOfTypeString) doesn't work
export const getWorker = (algorithm: AlgorithmType): Worker => {
    switch (algorithm) {
        case AlgorithmType.WATERSHED:
            return new Worker(new URL('../../webworkers/watershed.worker', import.meta.url));
        case AlgorithmType.GRABCUT:
            return new Worker(new URL('../../webworkers/grabcut.worker', import.meta.url));
        case AlgorithmType.INTELLIGENT_SCISSORS:
            return new Worker(new URL('../../webworkers/intelligent-scissors.worker', import.meta.url));
    }
};
