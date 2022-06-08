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

interface LabelCommon {
    name: string;
    color: string;
    group: string;
    hotkey?: string;
}

export interface LabelCreation extends LabelCommon {
    parent_id: string | null;
}

export interface LabelDTO extends LabelCreation {
    id: string;
    is_empty: boolean;
}

export interface NewLabelDTO extends LabelCreation {
    is_empty: boolean;
    revisit_affected_annotations: boolean;
}

export interface DeletedLabelDTO extends LabelDTO {
    is_deleted: boolean;
}
