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

import { DOMAIN, TaskMetadata } from '../../../../core/projects';
import { LabelTreeItem } from '../../../annotator/components/labels/label-tree-view';
import { LABEL_TREE_TYPE } from './label-tree-type.enum';

export const getLabelTreeType = (domain: DOMAIN, firstInChain: boolean): LABEL_TREE_TYPE => {
    if (firstInChain) {
        return LABEL_TREE_TYPE.SINGLE;
    } else if (domain === DOMAIN.CLASSIFICATION) {
        return LABEL_TREE_TYPE.HIERARCHY;
    } else {
        return LABEL_TREE_TYPE.FLAT;
    }
};

export const getProjectLabels = (tasksLabels: TaskMetadata[]): LabelTreeItem[] => {
    return tasksLabels.flatMap((task) => task.labels);
};
