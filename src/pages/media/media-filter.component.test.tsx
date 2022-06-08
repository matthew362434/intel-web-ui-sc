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
import { render } from '@testing-library/react';

import { MediaFilter } from './media-filter.component';

describe('MediaFilter', () => {
    const onSetFilterOptions = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('render MediaFilter', async () => {
        await render(
            <Provider theme={defaultTheme}>
                <MediaFilter filterOptions={{}} onSetFilterOptions={onSetFilterOptions} />
            </Provider>
        );

        expect(onSetFilterOptions).not.toHaveBeenCalled();
    });
});
