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

import { useState } from 'react';

import { ActionButton, Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { FolderAdd } from '../../../../../assets/icons';
import {
    getLabelsWithAddedChild,
    getLabelsWithUpdatedItem,
    getNextColor,
    LabelItemType,
    LabelTreeGroup,
    LabelTreeItem,
    GroupEditionMode,
    MixedModeTreeView,
} from '../../../../annotator/components/labels/label-tree-view';
import { ProjectLabelsManagementProps } from './project-labels-management.component';

type MixedLabelsManagementProps = ProjectLabelsManagementProps;

export const MixedLabelsManagement = ({
    isInEditMode,
    setIsDirty,
    labelsTree,
    setLabelsTree,
}: MixedLabelsManagementProps): JSX.Element => {
    const [addItemVisibility, setAddItemVisibility] = useState<boolean>(false);

    const addChild = (parentId: string, groupName: string, type: LabelItemType) => {
        const childColor = getNextColor(labelsTree);
        setTaskLabelsHandler(getLabelsWithAddedChild(labelsTree, childColor, parentId, groupName, type));
    };

    const setTaskLabelsHandler = (updatedLabels: LabelTreeItem[]): void => {
        setLabelsTree(updatedLabels);
        setIsDirty(true);
    };

    const saveHandler = (editedLabel?: LabelTreeItem, previousId?: string) => {
        const updated = getLabelsWithUpdatedItem(labelsTree, previousId, editedLabel);
        setTaskLabelsHandler(updated);
    };

    const addGroupHandler = (group?: LabelTreeGroup) => {
        group && setTaskLabelsHandler([...labelsTree, group]);
    };

    return (
        <>
            <View>
                <Flex justifyContent={'end'} alignItems={'center'}>
                    {isInEditMode && !addItemVisibility && (
                        <ActionButton isQuiet onPress={() => setAddItemVisibility(true)}>
                            <FolderAdd />
                        </ActionButton>
                    )}
                </Flex>

                {addItemVisibility && (
                    <GroupEditionMode
                        projectGroups={labelsTree}
                        save={addGroupHandler}
                        finishEdition={() => setAddItemVisibility(false)}
                    />
                )}
            </View>
            <View id='labels-management-id' width='100%'>
                <>
                    <MixedModeTreeView
                        labels={labelsTree}
                        isEditable={isInEditMode}
                        save={saveHandler}
                        addChild={addChild}
                        light
                        projectLabels={labelsTree}
                        setTaskLabels={setTaskLabelsHandler}
                        isMixedRelation={true}
                    />
                </>
            </View>
        </>
    );
};
