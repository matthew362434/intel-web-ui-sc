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
import { applicationRender as render, screen } from '../../../../../../test-utils';
import { mockedLongLabels } from '../../../../../../test-utils/mocked-items-factory';
import { LabelShortcuts } from '../label-shortcuts.component';

describe('label shortcut item', () => {
    it('Check if long label is displayed properly', async () => {
        await render(
            <LabelShortcuts addLabel={jest.fn()} removeLabels={jest.fn()} labels={mockedLongLabels} annotations={[]} />
        );

        expect(screen.getByText(mockedLongLabels[0].name)).toHaveStyle('text-overflow: ellipsis; maxWidth: 200px');
        expect(screen.getByText(mockedLongLabels[1].name)).toHaveStyle('text-overflow: ellipsis; maxWidth: 200px');
        expect(screen.getByText(mockedLongLabels[2].name)).toHaveStyle('text-overflow: ellipsis; maxWidth: 200px');
    });
});
