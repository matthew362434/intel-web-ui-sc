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

// This file is used to easily mock ResizeObserver so that we can test components
// that rely on useVirtual hooks

interface ResizeObserverListener {
    (rects: [{ contentRect: { width: number; height: number } }]): void;
}

export let resizeObserverListener: ResizeObserverListener | undefined = undefined;

// @ts-expect-error We want to mock the ResizeObserver so that we can force useVirtual to render
window.ResizeObserver = class ResizeObserver {
    constructor(listener: ResizeObserverListener) {
        resizeObserverListener = resizeObserverListener || listener;
    }
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
