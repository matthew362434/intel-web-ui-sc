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

import { Group, Label } from '../../../../../core/labels';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';

export type LabelTreeItem = LabelTreeLabel | LabelTreeGroup;

export enum LabelItemType {
    LABEL,
    GROUP,
}

export enum LabelItemEditionState {
    NEW = 'New',
    NEW_EMPTY = 'New Empty',
    CHANGED = 'Changed',
    REMOVED = 'Removed',
    IDLE = 'Idle',
}

export interface LabelTreeCommon {
    children: LabelTreeItem[];
    open: boolean;
    inEditMode: boolean;
    state: LabelItemEditionState;
    relation: LabelsRelationType;
}

export type LabelTreeGroup = Group & LabelTreeCommon & { type: LabelItemType.GROUP };
export type LabelTreeLabel = Label & LabelTreeCommon & { type: LabelItemType.LABEL };
