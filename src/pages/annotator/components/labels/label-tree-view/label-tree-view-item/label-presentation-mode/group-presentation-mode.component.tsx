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
import { Flex, Text } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { idMatchingFormat } from '../../../../../../../test-utils';
import { LabelsRelationType } from '../../../../../../create-project/components/select-project-template/utils';
import { GROUP_SEPARATOR } from '../../../utils/group-utils';
import { LabelItemType, LabelTreeGroup, LabelTreeItem } from '../../label-tree-view.interface';
import { LABEL_ITEM_MENU_PLACEHOLDER_WIDTH } from '../../utils';
import { ItemEditionState } from '../item-edition-state/item-edition-state.component';
import { LabelPresentationModeMenu } from './label-presentation-mode-menu/label-presentation-mode-menu.component';

interface GroupPresentationModeProps {
    group: LabelTreeGroup;
    isHovered: boolean;
    isEditable: boolean;
    setEditMode: () => void;
    deleteGroup: (deletedGroup: LabelTreeItem) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    newTree: boolean;
}

export const GroupPresentationMode = ({
    group,
    isHovered,
    setEditMode,
    isEditable,
    deleteGroup,
    addChild,
    newTree,
}: GroupPresentationModeProps): JSX.Element => {
    const { name, relation, state } = group;
    const DOT_SIGN = '∙';
    const prefix = relation === LabelsRelationType.SINGLE_SELECTION ? DOT_SIGN : `${DOT_SIGN}${DOT_SIGN}`;

    const addChildHandler = (parentId: string, type: LabelItemType) => {
        const groupName = group.parentName ? `${group.parentName}${GROUP_SEPARATOR}${group.name}` : group.name;
        addChild(parentId, groupName, type);
    };

    return (
        <Flex gap={'size-600'} width={'100%'}>
            <Flex
                gap={'size-100'}
                width={'100%'}
                justifyContent={'space-between'}
                alignItems={'center'}
                height={'100%'}
            >
                <Flex gap={'size-100'}>
                    <Text>{name}</Text>
                    {!newTree && <ItemEditionState state={state} idSuffix={idMatchingFormat(name)} />}
                </Flex>
                <View
                    backgroundColor={'gray-50'}
                    width={'size-1700'}
                    padding={'size-50'}
                    borderRadius={'large'}
                    height={'100%'}
                >
                    <Flex width='100%' height='100%' alignItems={'center'} justifyContent={'center'}>
                        <Text UNSAFE_style={{ fontSize: 'font-size-25' }}>{`${prefix} ${relation}`}</Text>
                    </Flex>
                </View>
            </Flex>
            <View minWidth={`${LABEL_ITEM_MENU_PLACEHOLDER_WIDTH}rem`} />
            {isEditable && (
                <LabelPresentationModeMenu
                    isHovered={isHovered}
                    deleteLabel={() => deleteGroup(group)}
                    addLabel={() => addChildHandler(group.id, LabelItemType.LABEL)}
                    setEditMode={setEditMode}
                />
            )}
        </Flex>
    );
};
