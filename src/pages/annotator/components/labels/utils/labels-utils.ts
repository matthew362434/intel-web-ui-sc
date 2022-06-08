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

import { sortBy, uniqBy } from 'lodash';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

import { Label } from '../../../../../core/labels';
import { idMatchingFormat } from '../../../../../test-utils';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeGroup,
    LabelTreeItem,
    LabelTreeLabel,
} from '../label-tree-view';
import { getGroupRelation, GROUP_SEPARATOR, separateGroup } from './group-utils';

export const getLabelId = (namespace: string, label?: Label): string => {
    if (!label) {
        return '';
    }

    const prefix: string[] = ['label', namespace];
    const postfix: string[] = [...label.name.split(' '), label.id];

    return [...prefix, ...postfix]
        .join('-')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};

export const findLabelParents = (labels: ReadonlyArray<Label>, item: Label): Label[] => {
    const parents: Label[] = [];
    const parent = labels.find((label: Label) => label.id === item.parentLabelId);

    if (parent) {
        return [parent, ...findLabelParents(labels, parent)];
    }

    return parents;
};

const sortLabel = (label: LabelTreeLabel) => {
    return [label.group, label.name];
};

export const fetchLabelsChildren = (
    labels: ReadonlyArray<Label>,
    labelId: string | null = null,
    opened: string[] | 'all' = [],
    relation: LabelsRelationType
): LabelTreeLabel[] => {
    return sortBy(
        labels
            .filter((label: Label) => label.parentLabelId === labelId)
            .map((label: Label): LabelTreeLabel => {
                const currentChildren = fetchLabelsChildren(labels, label.id, opened, relation);

                return {
                    ...label,
                    open: opened === 'all' || opened.includes(label.id),
                    children: currentChildren,
                    inEditMode: false,
                    type: LabelItemType.LABEL,
                    state: LabelItemEditionState.IDLE,
                    relation,
                };
            }),
        sortLabel
    );
};

export const fetchLabelsTree = (labels: ReadonlyArray<Label>, opened: string[] | 'all' = []): LabelTreeLabel[] => {
    // Find all labels that either have no parent, or whose parent is not known
    // because they may not be part of the currently selected task
    const labelRoots = labels.filter((label: Readonly<Label>): boolean => {
        if (label.parentLabelId === null) {
            return true;
        }

        return !labels.some(({ id }) => label.parentLabelId === id);
    });

    // Relation does not have impact on this labels tree so set to basic one
    const currentRelation = LabelsRelationType.SINGLE_SELECTION;

    const labelsWithChildren = labelRoots.map((label: Label): LabelTreeLabel => {
        const currentChildren = fetchLabelsChildren(labels, label.id, opened, currentRelation);

        return {
            ...label,
            open: opened === 'all' || opened.includes(label.id),
            children: currentChildren,
            inEditMode: false,
            type: LabelItemType.LABEL,
            state: LabelItemEditionState.IDLE,
            relation: currentRelation,
        };
    });

    return sortBy(labelsWithChildren, sortLabel);
};

export const uniqueLabels = (allLabels: Label[]): Label[] => {
    return uniqBy(allLabels, (label: Label) => label.id);
};

const getLabelsByGroup = (labels: ReadonlyArray<Label>, groupName: string): Label[] => {
    return labels.filter(({ group }) => group === groupName);
};

const getGroupChildrenGroups = (
    childrenNames: string[],
    allLabels: ReadonlyArray<Label>,
    opened: string[] | 'all' = [],
    parentLabelId: string | null,
    parentGroupName: string | null,
    level: number
): LabelTreeItem[] => {
    return childrenNames.map((group) => {
        const relation = getGroupRelation(allLabels, group);
        const currentChildren: LabelTreeItem[] = getChildItemsOfGroup(
            group,
            allLabels,
            level,
            opened,
            parentLabelId,
            relation
        );

        if (
            currentChildren.length === 1 &&
            `${parentGroupName}${GROUP_SEPARATOR}${currentChildren[0].name}` === group
        ) {
            return currentChildren[0] as LabelTreeLabel;
        }

        return {
            id: idMatchingFormat(group),
            name: separateGroup(group)[separateGroup(group).length - 1],
            type: LabelItemType.GROUP,
            parentLabelId: group,
            parentName: parentGroupName,
            open: true,
            relation,
            children: currentChildren,
            inEditMode: false,
            state: LabelItemEditionState.IDLE,
        } as LabelTreeGroup;
    });
};

const getGroupChildrenLabels = (
    groupLabels: Label[],
    allLabels: ReadonlyArray<Label>,
    opened: string[] | 'all' = [],
    level: number,
    relation: LabelsRelationType
) => {
    return groupLabels.map((label: Label): LabelTreeItem => {
        const currentChildren = fetchLabelsTreeWithGroups(
            allLabels,
            opened,
            label.id,
            label.group,
            undefined,
            level + 1
        );
        return {
            ...label,
            open: opened === 'all' || opened.includes(label.id),
            children: currentChildren,
            inEditMode: false,
            type: LabelItemType.LABEL,
            state: LabelItemEditionState.IDLE,
            relation,
        };
    });
};

const getUniqueChildGroupsNames = (
    labels: ReadonlyArray<Label>,
    groupName: string,
    parentId: string | null
): string[] => {
    const groupHierarchy = separateGroup(groupName);

    const isGroupChildren = ({ group, parentLabelId }: Label) => {
        const currentGroupHierarchy = separateGroup(group);

        if (groupHierarchy.length === currentGroupHierarchy.length || parentLabelId !== parentId) {
            return false;
        }

        const parentGroupHierarchy = currentGroupHierarchy.slice(0, currentGroupHierarchy.length - 1);

        return isEqual(groupHierarchy, parentGroupHierarchy);
    };

    return uniq(labels.filter(isGroupChildren).map(({ group }) => group));
};

/*Function return labels hierarchy (with groups representation) from flat labels got from server*/
export const fetchLabelsTreeWithGroups = (
    labels: ReadonlyArray<Label>,
    opened: string[] | 'all' = [],
    parentId: string | null,
    parentGroup: string | null,
    groupName?: string,
    level = 1
): LabelTreeItem[] => {
    // Find all labels that either have no parent, or whose parent is not known
    // because they may not be part of the currently selected task
    const labelRoots = labels.filter((label: Readonly<Label>): boolean => {
        if (parentId === null) {
            return !labels.some(({ id }) => label.parentLabelId === id);
        }

        return label.parentLabelId === parentId;
    });

    /**
     * Take groups of the current level from the list of all existing groups
     * or take groups which are higher level
     */
    const descendantGroups: string[] = labelRoots
        .map(({ group }) => {
            const separatedGroups = separateGroup(group);

            if (separatedGroups.length > level) {
                return separatedGroups.slice(0, level).join(GROUP_SEPARATOR);
            } else if (separatedGroups.length === level) {
                return group;
            } else {
                return undefined;
            }
        })
        .filter((group) => group !== undefined) as string[];

    //all groups of the level
    const uniqueDescendantGroups = uniq([...descendantGroups]);

    return uniqueDescendantGroups.map((uniqueGroupName: string) => {
        const relation = getGroupRelation(labels, uniqueGroupName);

        const children = getChildItemsOfGroup(uniqueGroupName, labels, level, opened, parentId, relation);
        return {
            id: [parentId, uniqueGroupName].filter((item) => item !== null).join(GROUP_SEPARATOR),
            name: separateGroup(uniqueGroupName)[separateGroup(uniqueGroupName).length - 1],
            type: LabelItemType.GROUP,
            parentLabelId: parentId,
            open: true,
            relation,
            parentName: parentGroup,
            children,
            inEditMode: false,
            state: LabelItemEditionState.IDLE,
        } as LabelTreeItem;
    });
};

const getChildItemsOfGroup = (
    groupName: string,
    labels: ReadonlyArray<Label>,
    level: number,
    opened: string[] | 'all',
    parentLabelId: string | null,
    relation: LabelsRelationType
) => {
    const currentGroupLabels = getLabelsByGroup(labels, groupName);
    const currentGroupLabelsHierarchical: LabelTreeItem[] = getGroupChildrenLabels(
        currentGroupLabels,
        labels,
        opened,
        level,
        relation
    );

    const groupChildrenGroupsNames = getUniqueChildGroupsNames(labels, groupName, parentLabelId);
    const currentGroupGroupsHierarchical: LabelTreeItem[] = getGroupChildrenGroups(
        groupChildrenGroupsNames,
        labels,
        opened,
        parentLabelId,
        groupName,
        level + 1
    );

    return [...currentGroupLabelsHierarchical, ...currentGroupGroupsHierarchical];
};
