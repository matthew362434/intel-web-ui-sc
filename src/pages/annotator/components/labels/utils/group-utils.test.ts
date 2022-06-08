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
import { Label } from '../../../../../core/labels';
import { getMockedLabel } from '../../../../../test-utils/mocked-items-factory';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import { getGroupRelation } from './group-utils';

describe('getGroupRelation', () => {
    const labels: ReadonlyArray<Label> = [
        getMockedLabel({ name: 'label1', group: 'group' }),
        getMockedLabel({ name: 'label3', group: 'group1' }),
        getMockedLabel({ name: 'label4', group: 'group1' }),
        getMockedLabel({ name: 'label2', group: 'group___child' }),
    ];

    it('Check if labels with groups: group>child, group1 return multi selection in group', () => {
        expect(getGroupRelation(labels, 'group')).toBe(LabelsRelationType.MULTI_SELECTION);
    });
    it('Check if labels with groups: group>child, group1 return single selection in group1', () => {
        expect(getGroupRelation(labels, 'group1')).toBe(LabelsRelationType.SINGLE_SELECTION);
    });
});
