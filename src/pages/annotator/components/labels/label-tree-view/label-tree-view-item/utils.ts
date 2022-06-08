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
import { LabelItemEditionState, LabelItemType, LabelTreeItem } from '../label-tree-view.interface';

export const setRemovedStateToChildren = (currentItem: LabelTreeItem): LabelTreeItem[] => {
    return currentItem.children.map((child) => {
        return {
            ...child,
            state: child.type === LabelItemType.LABEL ? LabelItemEditionState.REMOVED : child.state,
            children: setRemovedStateToChildren(child),
        };
    });
};
