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

export const idMatchingFormat = (text: string | number): string => {
    if (typeof text === 'string') {
        return text.split(' ').join('-').replace(',', '').toLowerCase();
    }
    return String(text);
};

export const idToName = (id: string): string => {
    return id.split('-').join(' ').split('_').join('-');
};
