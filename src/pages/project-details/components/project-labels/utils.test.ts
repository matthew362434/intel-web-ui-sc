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
import { DOMAIN } from '../../../../core/projects';
import { getMockedLabel, getMockedTreeLabel, MOCKED_HIERARCHY } from '../../../../test-utils/mocked-items-factory';
import {
    LabelItemEditionState,
    LabelItemType,
    LabelTreeLabel,
} from '../../../annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../create-project/components/select-project-template/utils';
import { getFlattenedGroups, getFlattenedLabels, getLabelsWithState, getRelation } from './utils';

describe('Project labels utils', () => {
    describe('Flatten items', () => {
        it('Get flatten labels', () => {
            const flattenLabels = getFlattenedLabels(MOCKED_HIERARCHY);
            expect(flattenLabels.map(({ name }) => name)).toStrictEqual([
                'Cat',
                'Dog',
                'White',
                'Black',
                'Mixed',
                'Hamster',
            ]);
        });

        it('Get flatten groups', () => {
            const flattenGroups = getFlattenedGroups(MOCKED_HIERARCHY);
            expect(flattenGroups.map(({ name }) => name)).toStrictEqual(['Animal', 'Color']);
        });
    });

    describe('getLabelsWithState', () => {
        it('return labels which are new', () => {
            const labels = [
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
                getMockedTreeLabel({
                    state: LabelItemEditionState.IDLE,
                    type: LabelItemType.LABEL,
                }),
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
            ];

            const returnedLabels = getLabelsWithState(labels as LabelTreeLabel[], [LabelItemEditionState.NEW]);
            expect(returnedLabels).toHaveLength(2);
        });

        it('return labels which are idle or removed', () => {
            const labels = [
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
                getMockedTreeLabel({
                    state: LabelItemEditionState.IDLE,
                    type: LabelItemType.LABEL,
                }),
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
                getMockedTreeLabel({ state: LabelItemEditionState.REMOVED, type: LabelItemType.LABEL }),
                getMockedTreeLabel({ state: LabelItemEditionState.REMOVED, type: LabelItemType.LABEL }),
            ];

            const returnedLabels = getLabelsWithState(labels as LabelTreeLabel[], [
                LabelItemEditionState.IDLE,
                LabelItemEditionState.REMOVED,
            ]);
            expect(returnedLabels).toHaveLength(3);
        });

        it('getLabelsWithState with no state', () => {
            const labels = [
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
                getMockedTreeLabel({
                    state: LabelItemEditionState.IDLE,
                    type: LabelItemType.LABEL,
                }),
                getMockedTreeLabel({ state: LabelItemEditionState.NEW, type: LabelItemType.LABEL }),
                getMockedTreeLabel({ state: LabelItemEditionState.REMOVED, type: LabelItemType.LABEL }),
                getMockedTreeLabel({ state: LabelItemEditionState.REMOVED, type: LabelItemType.LABEL }),
            ];

            const returnedLabels = getLabelsWithState(labels as LabelTreeLabel[], []);
            expect(returnedLabels).toHaveLength(0);
        });
    });
});

describe('getRelation function', () => {
    it('Project is task chain - MIXED', () => {
        expect(getRelation([], [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION])).toBe(LabelsRelationType.MIXED);
    });

    it('Project is Detection - SINGLE SELECTION', () => {
        expect(getRelation([], [DOMAIN.DETECTION])).toBe(LabelsRelationType.SINGLE_SELECTION);
    });

    it('Project is Segmentation - SINGLE SELECTION', () => {
        expect(getRelation([], [DOMAIN.SEGMENTATION])).toBe(LabelsRelationType.SINGLE_SELECTION);
    });

    it('Project is Classification - all labels in the same group - SINGLE SELECTION', () => {
        expect(
            getRelation(
                [
                    getMockedLabel({ name: 'test1', group: 'Default' }),
                    getMockedLabel({ name: 'test2', group: 'Default' }),
                    getMockedLabel({ name: 'test3', group: 'Default' }),
                ],
                [DOMAIN.CLASSIFICATION]
            )
        ).toBe(LabelsRelationType.SINGLE_SELECTION);
    });

    it('Project is Classification - all labels in different group - MULTIPLE SELECTION', () => {
        expect(
            getRelation(
                [
                    getMockedLabel({ name: 'test1', group: 'test1' }),
                    getMockedLabel({ name: 'test2', group: 'test2' }),
                    getMockedLabel({ name: 'test3', group: 'test3' }),
                ],
                [DOMAIN.CLASSIFICATION]
            )
        ).toBe(LabelsRelationType.MULTI_SELECTION);
    });

    it('Project is Classification - some in the same group some in different - MIXED', () => {
        expect(
            getRelation(
                [
                    getMockedLabel({ name: 'test1', group: 'root' }),
                    getMockedLabel({ name: 'test2', group: 'root' }),
                    getMockedLabel({ name: 'test3', group: 'root_test' }),
                    getMockedLabel({ name: 'test4', group: 'root_test' }),
                    getMockedLabel({ name: 'test5', group: 'root_test_subgroup' }),
                ],
                [DOMAIN.CLASSIFICATION]
            )
        ).toBe(LabelsRelationType.MIXED);
    });
});
