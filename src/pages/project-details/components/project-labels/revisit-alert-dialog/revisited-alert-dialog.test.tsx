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
import userEvent from '@testing-library/user-event';

import { applicationRender as render, screen } from '../../../../../test-utils';
import { getMockedTreeLabel } from '../../../../../test-utils/mocked-items-factory';
import { LabelTreeLabel } from '../../../../annotator/components/labels/label-tree-view';
import { RevisitAlertDialog } from './revisit-alert-dialog.component';

describe('revisitedAlertDialog', () => {
    it('Check if in dialog there is proper message and if save is called on buttons', async () => {
        const PROMPT_TEXT =
            'There might be media with objects that match labels "Dog", "Cat", "Bird". ' +
            'Please assign "revisit" status to differentiate these media and allow to make adjustments.';

        const mockSave = jest.fn();

        const labels = [
            getMockedTreeLabel({ name: 'Dog' }),
            getMockedTreeLabel({ name: 'Cat' }),
            getMockedTreeLabel({ name: 'Bird' }),
        ];

        await render(<RevisitAlertDialog flattenNewLabels={labels as LabelTreeLabel[]} save={mockSave} />);

        expect(screen.getByText(PROMPT_TEXT)).toBeInTheDocument();

        const assignButton = screen.getByRole('button', { name: 'Assign' });

        userEvent.click(assignButton);
        expect(mockSave).toBeCalledWith(true);
        const dontAssignButton = screen.getByRole('button', { name: "Don't assign" });
        userEvent.click(dontAssignButton);
        expect(mockSave).toBeCalledWith(false);
    });
});
