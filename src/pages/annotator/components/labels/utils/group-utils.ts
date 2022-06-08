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
import uniq from 'lodash/uniq';

import { Label } from '../../../../../core/labels';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';

export const GROUP_SEPARATOR = '___';
export const separateGroup = (groupName: string): string[] => groupName.split(GROUP_SEPARATOR);

export const getEditedMultiLabelGroupName = (groupName: string, name: string): string => {
    const groupNameParts = groupName.split(GROUP_SEPARATOR);
    groupNameParts[groupNameParts.length - 1] = name;
    return groupNameParts.join(GROUP_SEPARATOR);
};

export const isDescendant = (group: string, parentGroup: string): boolean => {
    return group.startsWith(`${parentGroup}${GROUP_SEPARATOR}`) || group === parentGroup;
};

export const getGroupRelation = (allLabels: ReadonlyArray<Label>, groupName: string): LabelsRelationType => {
    const descendants = allLabels.filter(({ group }) => {
        return isDescendant(group, groupName);
    });
    const uniqueDescendantsGroupNames = uniq(descendants.map(({ group }) => group));
    return uniqueDescendantsGroupNames.length === 1
        ? LabelsRelationType.SINGLE_SELECTION
        : LabelsRelationType.MULTI_SELECTION;
};
