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

import { TruncatedText } from '../../../../../../../shared/components/truncated-text';
import { idMatchingFormat } from '../../../../../../../test-utils';
import { LabelColorThumb } from '../../../label-color-thumb/label-color-thumb.component';
import { getLabelId, GROUP_SEPARATOR } from '../../../utils';
import { LabelItemType, LabelTreeItem, LabelTreeLabel } from '../../label-tree-view.interface';
import { ItemEditionState } from '../item-edition-state/item-edition-state.component';
import { LabelPresentationModeMenu } from './label-presentation-mode-menu/label-presentation-mode-menu.component';

interface LabelPresentationModeProps {
    label: LabelTreeLabel;
    isHovered: boolean;
    isEditable: boolean;
    setEditMode: () => void;
    deleteLabel: (deleteLabel: LabelTreeItem) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    newTree: boolean;
    isMixedRelation: boolean;
}

const attrs = {
    itemLabel: { classes: 'spectrum-TreeView-itemLabel' },
};

export const LabelPresentationMode = ({
    label,
    isHovered,
    isEditable,
    setEditMode,
    deleteLabel,
    addChild,
    newTree,
    isMixedRelation,
}: LabelPresentationModeProps): JSX.Element => {
    const { name, hotkey, state, group } = label;

    const addChildHandler = (parentId: string, type: LabelItemType) => {
        let newItemGroup = group;
        if (type === LabelItemType.LABEL) {
            newItemGroup = `${group}${GROUP_SEPARATOR}child`;
        }
        addChild(parentId, newItemGroup, type);
    };

    const addGroupHandler = () => {
        addChildHandler(label.id, LabelItemType.GROUP);
    };

    const deleteHandler = () => {
        deleteLabel(label);
    };

    return (
        <Flex
            alignItems='center'
            gap='size-100'
            width={'100%'}
            marginStart={label.children.length === 0 ? 'size-100' : undefined}
        >
            <LabelColorThumb label={label} id={`${getLabelId('tree', label)}-color`} />
            <Flex alignItems={'center'} justifyContent={'space-between'} minWidth={0} width={'100%'} gap={'size-100'}>
                <Flex gap={'size-100'} alignItems={'center'}>
                    <TruncatedText width={'inherit'} id={getLabelId('tree', label)} {...attrs.itemLabel}>
                        {name}
                    </TruncatedText>
                    {!newTree && <ItemEditionState state={state} idSuffix={idMatchingFormat(name)} />}
                </Flex>

                <Flex alignItems={'center'} justifyContent={'space-between'} gap={'size-600'}>
                    {hotkey ? (
                        <Flex gap={'size-100'} alignItems={'center'} UNSAFE_style={{ fontSize: '11px' }}>
                            <Flex direction={'column'} alignItems={'center'} justifyContent={'center'}>
                                <Text>Keyboard</Text>
                                <Text>shortcut</Text>
                            </Flex>
                            <View
                                backgroundColor={'gray-200'}
                                borderRadius={'large'}
                                width={'size-900'}
                                UNSAFE_style={{ textAlign: 'center' }}
                                padding={'size-25s'}
                            >
                                <Text id={`label-hotkey-${name}`}>{hotkey.toUpperCase()}</Text>
                            </View>
                        </Flex>
                    ) : (
                        <></>
                    )}

                    {isEditable && (
                        <LabelPresentationModeMenu
                            isHovered={isHovered}
                            deleteLabel={deleteHandler}
                            addGroup={isMixedRelation ? addGroupHandler : undefined}
                            setEditMode={setEditMode}
                        />
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
