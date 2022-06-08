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

import { getFlattenedItems, LABEL_BEHAVIOUR } from '../../../../../core/labels';
import { idMatchingFormat } from '../../../../../test-utils';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import { getAvailableColors } from '../../../../project-details/components/project-labels/project-labels-management/utils';
import { GROUP_SEPARATOR } from '../utils';
import { getEditedMultiLabelGroupName } from '../utils/group-utils';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeGroup,
    LabelTreeItem,
    LabelTreeLabel,
} from './label-tree-view.interface';

export const ICONS_SIZE_IN_REM = 3.2;
const MAX_AMOUNT_OF_ICONS = 3;
export const LABEL_ITEM_MENU_PLACEHOLDER_WIDTH = MAX_AMOUNT_OF_ICONS * ICONS_SIZE_IN_REM;
export const DEFAULT_GROUP_NAME = 'Default group';

export const getUpdatedItem = (
    editedLabelValues: LabelTreeItem,
    { inEditMode }: { inEditMode: boolean }
): LabelTreeItem => {
    const { name, children, id, state } = editedLabelValues;

    const isNew = [LabelItemEditionState.NEW_EMPTY, LabelItemEditionState.NEW].includes(state);
    const labelId = isNew ? idMatchingFormat(name) : id;
    return {
        ...editedLabelValues,
        id: labelId,
        inEditMode: inEditMode,
        state: isNew ? LabelItemEditionState.NEW : LabelItemEditionState.CHANGED,
        children: children.map((child) => ({
            ...child,
            parent: name,
            parentLabelId: labelId,
        })),
    };
};

export const DEFAULT_LABEL = (options: {
    name?: string;
    color: string;
    groupName: string;
    relation: LabelsRelationType;
    parentLabelId?: string;
    inEditMode?: boolean;
    state?: LabelItemEditionState;
    hotkey?: string;
}): LabelTreeLabel => {
    const { name, color, groupName, relation, parentLabelId, inEditMode = true, state, hotkey } = options;
    return {
        name: name || '',
        id: name ? idMatchingFormat(name) : 'new',
        color: color ? `${color.toLowerCase()}ff` : '#ededed',
        group: groupName,
        parentLabelId: parentLabelId || null,
        open: true,
        children: [],
        hotkey,
        state: state || LabelItemEditionState.IDLE,
        inEditMode: inEditMode === undefined ? true : inEditMode,
        behaviour: LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL,
        type: LabelItemType.LABEL,
        relation,
    };
};

export const DEFAULT_GROUP = (options: {
    name: string;
    relation: LabelsRelationType;
    parentLabelId?: string | null;
    inEditMode?: boolean;
    parentName: string | null;
    state?: LabelItemEditionState;
}): LabelTreeGroup => {
    const { name, relation, parentLabelId = null, inEditMode = true, parentName, state } = options;
    return {
        name,
        id: !name.length ? 'child' : name,
        parentLabelId,
        parentName,
        open: true,
        children: [],
        inEditMode,
        relation: relation,
        type: LabelItemType.GROUP,
        state: state || LabelItemEditionState.NEW,
    };
};

export const getNextColor = (labels: LabelTreeItem[]): string => {
    const availableColors = getAvailableColors(getFlattenedItems(labels));
    const index = Math.floor(Math.random() * availableColors.length);
    return availableColors[index];
};

const getEditedLabelValue = (
    label: LabelTreeLabel,
    newValues?: LabelTreeLabel,
    projectCreation?: boolean
): LabelTreeLabel => {
    const labelWithEditedValues = { ...label, ...newValues };

    const isNew = label.state.includes(LabelItemEditionState.NEW) || projectCreation;

    const childGroupName =
        labelWithEditedValues.relation === LabelsRelationType.MULTI_SELECTION && isNew
            ? getEditedMultiLabelGroupName(labelWithEditedValues.group, labelWithEditedValues.name)
            : labelWithEditedValues.group;

    return { ...labelWithEditedValues, group: childGroupName };
};

const filterOutLabels = ({ state }: LabelTreeItem) => ![LabelItemEditionState.NEW_EMPTY].includes(state);

export const getLabelsWithUpdatedItem = (
    currentLabels: LabelTreeItem[],
    labelId?: string,
    newValues?: LabelTreeItem,
    projectCreation?: boolean
): LabelTreeItem[] => {
    const editedLabels: LabelTreeItem[] = currentLabels.map((item: LabelTreeItem) => {
        if (item.id === labelId) {
            if (item.type === LabelItemType.LABEL) {
                return getEditedLabelValue(item, newValues as LabelTreeLabel, projectCreation);
            }
            return { ...item, ...newValues } as LabelTreeGroup;
        } else {
            const children = getLabelsWithUpdatedItem(item.children, labelId, newValues, projectCreation).filter(
                filterOutLabels
            );

            return {
                ...item,
                children,
            };
        }
    });

    return editedLabels.filter(filterOutLabels);
};

export const getLabelsWithAddedChild = (
    currentLabel: LabelTreeItem[],
    color: string | undefined,
    parentId: string,
    groupName: string,
    type: LabelItemType
): LabelTreeItem[] => {
    return currentLabel.map((label: LabelTreeItem) => {
        if (label.id === parentId) {
            const childGroupName =
                label.relation === LabelsRelationType.MULTI_SELECTION
                    ? `${groupName}${GROUP_SEPARATOR}child`
                    : groupName;

            const defaultLabel = DEFAULT_LABEL({
                name: '',
                color: color || getNextColor(currentLabel),
                groupName: childGroupName,
                relation: label.relation,
                parentLabelId: parentId,
                inEditMode: true,
                state: LabelItemEditionState.NEW_EMPTY,
            });

            const defaultGroup = DEFAULT_GROUP({
                name: '',
                relation: LabelsRelationType.SINGLE_SELECTION,
                parentLabelId: parentId,
                parentName: groupName,
                state: LabelItemEditionState.NEW_EMPTY,
            });

            const newChild = type === LabelItemType.LABEL ? defaultLabel : defaultGroup;
            return { ...label, open: true, children: [...label.children, newChild] };
        } else return { ...label, children: getLabelsWithAddedChild(label.children, color, parentId, groupName, type) };
    });
};
