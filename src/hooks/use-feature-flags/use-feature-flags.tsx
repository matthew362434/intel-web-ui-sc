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

// Add a new flag here
export type FeatureFlag = 'DATASET_IMPORT' | 'DATASET_EXPORT' | 'ANNOTATOR_SETTINGS';

/*
    TODO: Ideally we should persist this configuration, by either storing it on the local cache
    or having this configuration coming from a backend endpoint. That way we could remotely toggle on/off any feature,
    instead of having to push a new commit changing a flag from `false` to `true`.
*/
export const useFeatureFlags = (): Record<FeatureFlag, boolean> => {
    const FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
        DATASET_IMPORT: true,
        DATASET_EXPORT: true,
        ANNOTATOR_SETTINGS: true,
        // Add a new flag here
    };

    return FEATURE_FLAGS;
};
