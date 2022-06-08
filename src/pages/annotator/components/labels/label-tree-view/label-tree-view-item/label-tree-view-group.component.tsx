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

import { useEffect, useState } from 'react';

import { ActionButton, Flex } from '@adobe/react-spectrum';

import { Folder, FolderOpen } from '../../../../../../assets/icons';
import { LabelItemType, LabelTreeGroup, LabelTreeItem } from '../label-tree-view.interface';
import { GroupEditionMode } from './group-edition-mode/group-edition-mode.component';
import { GroupPresentationMode } from './label-presentation-mode/group-presentation-mode.component';

export interface LabelTreeViewItemProps {
    item: LabelTreeItem;
    isEditable: boolean;
    save: (editedItem?: LabelTreeItem, previousId?: string) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    remove: (deletedGroup: LabelTreeItem) => void;
    isHovered: boolean;
    newTree: boolean;
    projectLabels: LabelTreeItem[];
}

export const LabelTreeViewGroup = ({
    item,
    isEditable,
    save,
    addChild,
    remove,
    isHovered,
    newTree,
    projectLabels,
}: LabelTreeViewItemProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(item.open);
    const [inEditMode, setInEditMode] = useState<boolean>(item.inEditMode);

    useEffect(() => {
        setInEditMode(item.inEditMode);
    }, [item.inEditMode]);

    const onOpenPressHandler = () => {
        setIsOpen(!isOpen);
        save({ ...item, open: !isOpen }, item.id);
    };

    return (
        <>
            <Flex width={'100%'} alignItems={'center'} height={'100%'} minHeight={'4.4rem'}>
                <ActionButton isQuiet onPress={onOpenPressHandler}>
                    {isOpen ? <FolderOpen /> : <Folder />}
                </ActionButton>
                <Flex alignItems='center' gap='size-100' width={'100%'}>
                    {inEditMode ? (
                        <GroupEditionMode
                            projectGroups={projectLabels}
                            group={item as LabelTreeGroup}
                            finishEdition={() => setInEditMode(false)}
                            save={save}
                        />
                    ) : (
                        <GroupPresentationMode
                            group={item as LabelTreeGroup}
                            isEditable={isEditable}
                            isHovered={isHovered}
                            setEditMode={() => setInEditMode(true)}
                            deleteGroup={remove}
                            addChild={addChild}
                            newTree={newTree}
                        />
                    )}
                </Flex>
            </Flex>
        </>
    );
};
