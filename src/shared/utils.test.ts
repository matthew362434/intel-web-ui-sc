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
import { Label } from '../core/labels';
import { getMockedLabel } from '../test-utils/mocked-items-factory';
import { filterOutExclusiveLabel } from './utils';

const getLabel = (name: string, id: string, isExclusive = false): Label => {
    return getMockedLabel({
        name,
        id,
        parentLabelId: null,
        isExclusive,
    });
};

describe('filter out exclusive labels', () => {
    it('there is one exclusive label and two not empty - should leave two of them', () => {
        const labels: Label[] = [
            getLabel('Exclusive Detection task label', '1', true),
            getLabel('cat', '2'),
            getLabel('dog', '3'),
        ];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(2);
    });

    it('there is two exclusive labels and one not empty - should leave one', () => {
        const labels: Label[] = [
            getLabel('Exclusive Detection task label', '1', true),
            getLabel('Exclusive Segmentation task label', '2', true),
            getLabel('dog', '3'),
        ];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(1);
    });

    it('there is 6 labels and exclusive is in a middle - should leave 5', () => {
        const labels: Label[] = [
            getLabel('hamster', '1'),
            getLabel('bird', '2'),
            getLabel('dog', '3'),
            getLabel('mouse', '4'),
            getLabel('Exclusive Detection task label', '5', true),
            getLabel('cat', '6'),
        ];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(5);
    });

    it('there is one not exclusive label - should leave one', () => {
        const labels: Label[] = [getLabel('dog', '1')];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(1);
    });

    it('there is one exclusive label - should leave none', () => {
        const labels: Label[] = [getLabel('Exclusive Segmentation task label', '1', true)];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(0);
    });

    it('there is no labels - should return exclusive array', () => {
        const labels: Label[] = [];

        expect(filterOutExclusiveLabel(labels)).toHaveLength(0);
    });
});
