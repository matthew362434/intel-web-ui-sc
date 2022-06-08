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

import { render, screen } from '@testing-library/react';

import { getMockedLabel } from '../../../../test-utils/mocked-items-factory';
import { MediaFilterLabelNormalAnomalous } from './media-filter-label-normal-anomalous.component';

const mockedLabel = getMockedLabel({ name: 'label-1', id: 'label-1' });

describe('MediaFilterLabelNormalAnomalous', () => {
    const onSelectionChange = jest.fn();
    const ariaLabel = 'media-filter-label-normal-anomalous';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('render label name disable', async () => {
        await render(
            <MediaFilterLabelNormalAnomalous onSelectionChange={onSelectionChange} anomalyLabel={mockedLabel} />
        );

        const input = screen.getByLabelText(ariaLabel) as HTMLInputElement;

        expect(input.value).toBe(mockedLabel.name);
        expect(input.disabled).toBe(true);
        expect(onSelectionChange).toHaveBeenNthCalledWith(1, [mockedLabel.id]);
    });
});
