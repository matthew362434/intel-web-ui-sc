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

import uniq from 'lodash/uniq';

import { DeletedLabel, getFlattenedItems, Label } from '../../../../core/labels';
import { DOMAIN } from '../../../../core/projects';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeGroup,
    LabelTreeItem,
    LabelTreeLabel,
} from '../../../annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../create-project/components/select-project-template/utils';

export const getFlattenedLabels = (labelsTree: LabelTreeItem[]): LabelTreeLabel[] => {
    return getFlattenedItems(labelsTree).filter(({ type }) => type === LabelItemType.LABEL) as LabelTreeLabel[];
};

export const getFlattenedGroups = (labelsTree: LabelTreeItem[]): LabelTreeGroup[] => {
    return getFlattenedItems(labelsTree).filter(({ type }) => type === LabelItemType.GROUP) as LabelTreeGroup[];
};

export const getLabelsWithState = (
    flattenedLabels: LabelTreeLabel[],
    states: LabelItemEditionState[]
): LabelTreeLabel[] => {
    return flattenedLabels.filter(({ state }) => states.includes(state));
};

const returnLabelParentId = (
    parentId: string | null,
    groups: LabelTreeGroup[],
    labels: LabelTreeLabel[]
): string | null => {
    if (parentId === null) {
        return null;
    }

    const parentGroup = groups.find((currentGroup) => currentGroup.id === parentId);

    if (parentGroup) {
        return returnLabelParentId(parentGroup.parentLabelId, groups, labels);
    } else {
        if (labels.find((currentLabel) => currentLabel.id === parentId)) {
            return parentId;
        } else {
            return null;
        }
    }
};

export const getNewLabelPayload = (
    label: LabelTreeLabel,
    flattenedGroups: LabelTreeGroup[],
    flattenedLabels: LabelTreeLabel[],
    revisit: boolean
) => {
    const { name, color, hotkey, group, behaviour, parentLabelId } = label;

    return {
        revisitAffectedAnnotations: revisit,
        name,
        color,
        hotkey,
        group,
        parentLabelId: returnLabelParentId(parentLabelId, flattenedGroups, flattenedLabels),
        behaviour,
    };
};

export const getDeletedLabelPayload = (label: LabelTreeLabel): DeletedLabel => {
    const { name, color, hotkey, group, behaviour, parentLabelId, id } = label;
    return {
        id,
        name,
        color,
        hotkey,
        group,
        parentLabelId,
        behaviour,
        isDeleted: true,
    };
};

export const getLabelPayload = (label: LabelTreeLabel) => {
    const { id, name, color, hotkey, group, parentLabelId, behaviour } = label;

    return {
        id,
        name,
        color,
        hotkey,
        group,
        parentLabelId,
        behaviour,
    };
};

export const getRelation = (labels: Label[], domains: DOMAIN[]): LabelsRelationType => {
    if (domains.length > 1) {
        return LabelsRelationType.MIXED;
    } else {
        const domain = domains[0];

        if (domain !== DOMAIN.CLASSIFICATION) {
            return LabelsRelationType.SINGLE_SELECTION;
        } else {
            const groups = labels.map(({ group }) => group);
            const uniqueGroups = uniq(groups);

            if (uniqueGroups.length === 1) {
                return LabelsRelationType.SINGLE_SELECTION;
            } else if (uniqueGroups.length === labels.length) {
                return LabelsRelationType.MULTI_SELECTION;
            } else {
                return LabelsRelationType.MIXED;
            }
        }
    }
};
