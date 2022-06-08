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
import { getMockedTreeLabel } from '../../../../../test-utils/mocked-items-factory';
import { DISTINCT_COLORS } from '../../../../create-project';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import { LabelItemEditionState, LabelTreeItem, LabelTreeLabel } from './label-tree-view.interface';
import { getLabelsWithUpdatedItem, getNextColor } from './utils';

describe('labelTreeView utils', () => {
    it('getLabelsWithEdited - should filter out NEW_EMPTY ', () => {
        const labels = [
            getMockedTreeLabel({ state: LabelItemEditionState.REMOVED, id: '1' }),
            getMockedTreeLabel({ state: LabelItemEditionState.NEW_EMPTY, id: '2' }),
            getMockedTreeLabel({ state: LabelItemEditionState.NEW, id: '3' }),
            getMockedTreeLabel({ state: LabelItemEditionState.IDLE, id: '4' }),
            getMockedTreeLabel({ state: LabelItemEditionState.IDLE, id: '5' }),
        ];

        const result = getLabelsWithUpdatedItem(labels);
        expect(result).toHaveLength(4);
    });

    it('getNextColor - one color is not used - function returns that color', () => {
        const result = getNextColor([
            getMockedTreeLabel({ color: DISTINCT_COLORS[0] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[1] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[2] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[3] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[4] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[5] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[6] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[7] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[8] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[9] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[10] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[11] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[12] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[13] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[14] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[15] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[16] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[17] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[18] }),
            getMockedTreeLabel({ color: DISTINCT_COLORS[19] }),
        ]);
        expect(DISTINCT_COLORS).toHaveLength(21);
        expect(result).toBe(DISTINCT_COLORS[20]);
    });

    it('getNextColor - one color is used - function returns other color among DISTINCT_COLORS', () => {
        const result = getNextColor([getMockedTreeLabel({ color: DISTINCT_COLORS[10] })]);
        expect(DISTINCT_COLORS.includes(result)).toBeTruthy();
        expect(result).not.toBe(DISTINCT_COLORS[10]);
    });
});

describe('getLabelWithEdited function', () => {
    it('Change name of single selection project label', () => {
        const label: LabelTreeItem = getMockedTreeLabel({
            name: 'cat',
            group: 'default',
            relation: LabelsRelationType.SINGLE_SELECTION,
        });
        const label2: LabelTreeItem = getMockedTreeLabel({
            name: 'dog',
            group: 'default',
            relation: LabelsRelationType.SINGLE_SELECTION,
        });
        const labelsTree = [label, label2];
        const result = getLabelsWithUpdatedItem(labelsTree, label.id, {
            ...label,
            name: 'changed name',
            state: LabelItemEditionState.CHANGED,
        });

        expect(result).toHaveLength(2);
        expect((result[0] as LabelTreeLabel).group).toBe('default');
        expect(result[0].name).toBe('changed name');
        expect(result[1]).toStrictEqual(label2);
    });

    it('Change name of multi selection project label', () => {
        const label: LabelTreeItem = getMockedTreeLabel({
            name: 'cat',
            group: 'cat',
            relation: LabelsRelationType.MULTI_SELECTION,
        });
        const label2: LabelTreeItem = getMockedTreeLabel({
            name: 'dog',
            group: 'dog',
            relation: LabelsRelationType.MULTI_SELECTION,
        });
        const label3: LabelTreeItem = getMockedTreeLabel({
            name: 'hamster',
            group: 'hamster',
            relation: LabelsRelationType.MULTI_SELECTION,
        });
        const labelsTree = [label, label2, label3];
        const result = getLabelsWithUpdatedItem(labelsTree, label2.id, {
            ...label2,
            name: 'changed name',
            state: LabelItemEditionState.CHANGED,
        });

        expect(result).toHaveLength(3);
        expect((result[1] as LabelTreeLabel).group).toBe('dog');
        expect(result[1].name).toBe('changed name');
        expect(result[0]).toStrictEqual(label);
        expect(result[2]).toStrictEqual(label3);
    });
});
