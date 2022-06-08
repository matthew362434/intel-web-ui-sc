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
import { ToggleableChevron } from './label-tree-view-item.component';

describe('ToggleableChevron', () => {
    it('CVS-82930 - Cannot expand label hierarchy in label selection tool (top-left)', async () => {
        const toggleHandler = jest.fn();
        await render(<ToggleableChevron isOpen={false} toggle={toggleHandler} id={'test'} />);

        userEvent.click(screen.getByRole('button', { name: 'test-chevron-button' }));

        expect(toggleHandler).toHaveBeenCalled();
    });
});
