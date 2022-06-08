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
import { Label, LABEL_BEHAVIOUR, LabelDTO } from '../../core/labels';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeItem,
} from '../../pages/annotator/components/labels/label-tree-view';

const mockedLabel: Label = {
    id: 'label-1',
    name: 'label-1',
    group: 'group-1',
    color: 'blue',
    parentLabelId: null,
    hotkey: 'ctrl+1',
    behaviour: LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL,
};

export const getMockedLabel = (label?: Partial<Label> & { isExclusive?: boolean }): Label => {
    const behaviour = label?.behaviour ?? (label?.isExclusive ? LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.EXCLUSIVE : 0);

    return { ...mockedLabel, ...label, behaviour };
};

export const labels: Label[] = [
    getMockedLabel({
        id: 'card',
        color: '#00ff00',
        name: 'card',
        group: 'card-group',
        hotkey: 'ctrl+1',
    }),

    // Colors
    getMockedLabel({
        id: 'black',
        color: '#00ffff',
        name: 'black',
        group: 'color',
        parentLabelId: 'card',
        hotkey: 'ctrl+2',
    }),
    getMockedLabel({
        id: 'red',
        color: '#00ffff',
        name: 'red',
        group: 'color',
        parentLabelId: 'card',
        hotkey: 'ctrl+3',
    }),

    // Suits
    getMockedLabel({ id: '♥', color: '#00ffff', name: '♥', group: 'suit', parentLabelId: 'red', hotkey: 'ctrl+4' }),
    getMockedLabel({ id: '♦', color: '#00ffff', name: '♦', group: 'suit', parentLabelId: 'red', hotkey: 'ctrl+5' }),
    getMockedLabel({ id: '♠', color: '#00ffff', name: '♠', group: 'suit', parentLabelId: 'black', hotkey: 'ctrl+6' }),
    getMockedLabel({ id: '♣', color: '#00ffff', name: '♣', group: 'suit', parentLabelId: 'black', hotkey: 'ctrl+7' }),

    // Values
    getMockedLabel({ id: '1', color: '#000000', name: '1', group: 'value', parentLabelId: 'card', hotkey: 'ctrl+8' }),
    getMockedLabel({ id: '2', color: '#000000', name: '2', group: 'value', parentLabelId: 'card', hotkey: 'ctrl+9' }),
    getMockedLabel({ id: '3', color: '#000000', name: '3', group: 'value', parentLabelId: 'card', hotkey: 'alt+1' }),
    getMockedLabel({ id: '4', color: '#000000', name: '4', group: 'value', parentLabelId: 'card', hotkey: 'alt+2' }),
];

export const labelDTOs: LabelDTO[] = [
    {
        id: 'card',
        color: '#00ff00',
        name: 'card',
        group: 'card-group',
        parent_id: null,
        hotkey: 'ctrl+1',
        is_empty: false,
    },

    // Colors
    {
        id: 'black',
        color: '#00ffff',
        name: 'black',
        group: 'color',
        parent_id: 'card',
        hotkey: 'ctrl+2',
        is_empty: false,
    },
    { id: 'red', color: '#00ffff', name: 'red', group: 'color', parent_id: 'card', hotkey: 'ctrl+3', is_empty: false },

    // Suits
    { id: '♥', color: '#00ffff', name: '♥', group: 'suit', parent_id: 'red', hotkey: 'ctrl+4', is_empty: false },
    { id: '♦', color: '#00ffff', name: '♦', group: 'suit', parent_id: 'red', hotkey: 'ctrl+5', is_empty: false },
    { id: '♠', color: '#00ffff', name: '♠', group: 'suit', parent_id: 'black', hotkey: 'ctrl+6', is_empty: false },
    { id: '♣', color: '#00ffff', name: '♣', group: 'suit', parent_id: 'black', hotkey: 'ctrl+7', is_empty: false },

    // Values
    { id: '1', color: '#000000', name: '1', group: 'value', parent_id: 'card', hotkey: 'ctrl+8', is_empty: false },
    { id: '2', color: '#000000', name: '2', group: 'value', parent_id: 'card', hotkey: 'ctrl+9', is_empty: false },
    { id: '3', color: '#000000', name: '3', group: 'value', parent_id: 'card', hotkey: 'alt+1', is_empty: false },
    { id: '4', color: '#000000', name: '4', group: 'value', parent_id: 'card', hotkey: 'alt+2', is_empty: false },
];

export const getMockedLabels = (quantity: number): Label[] => {
    const mockedLabels = [];

    for (let i = 1; i <= quantity; ++i) {
        mockedLabels.push(getMockedLabel({ id: i.toString(), name: `test-${i}` }));
    }

    return mockedLabels;
};

export const getMockedTreeLabel = (label?: Partial<LabelTreeItem>): LabelTreeItem => {
    return getMockedTreeItem({ ...label, type: LabelItemType.LABEL });
};

export const getMockedTreeGroup = (label?: Partial<LabelTreeItem>): LabelTreeItem => {
    return getMockedTreeItem({ ...label, type: LabelItemType.GROUP });
};

export const getMockedTreeItem = (item?: Partial<LabelTreeItem>): LabelTreeItem => {
    return {
        ...mockedLabel,
        open: false,
        inEditMode: false,
        children: [],
        state: LabelItemEditionState.IDLE,
        ...item,
        id: item?.id || item?.name || mockedLabel.id,
    } as LabelTreeItem;
};

export const mockedLongLabels = [
    getMockedLabel({
        id: '1',
        name: 'test_test_test_test_test_test_test_test_test_test_test_test_test_test_test_test_test_test_test_test',
    }),
    getMockedLabel({
        id: '2',
        name: 'test test test test test test test test test test test test test test test test test test test test',
    }),
    getMockedLabel({
        id: '3',
        name:
            'test test test test test test test test test test test test test test test test test test test ' +
            'test test test test test test test test test test test test test test test test test test test test ' +
            'test test test test test test test test test',
    }),
];

export const MOCKED_HIERARCHY: LabelTreeItem[] = [
    getMockedTreeGroup({
        name: 'Animal',
        children: [
            getMockedTreeLabel({ name: 'Cat' }),
            getMockedTreeLabel({
                name: 'Dog',
                children: [
                    getMockedTreeGroup({
                        name: 'Color',
                        children: [
                            getMockedTreeLabel({ name: 'White' }),
                            getMockedTreeLabel({ name: 'Black' }),
                            getMockedTreeLabel({ name: 'Mixed' }),
                        ],
                    }),
                ],
            }),
            getMockedTreeLabel({ name: 'Hamster' }),
        ],
    }),
];
