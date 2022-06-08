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

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchRuleField } from '../media-filter.interface';
import { MediaFilterField } from './media-filter-field.component';

describe('MediaFilterField', () => {
    const onSelectionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows to select the Label and call onSelectionChange', async () => {
        await render(
            <Provider theme={defaultTheme}>
                <MediaFilterField value='' onSelectionChange={onSelectionChange} />
            </Provider>
        );

        userEvent.selectOptions(
            screen.getByRole('listbox', { hidden: true }),
            screen.getByRole('option', { hidden: true, name: 'Label' })
        );

        expect(onSelectionChange).toHaveBeenCalledWith(SearchRuleField.LabelId);
    });
});
