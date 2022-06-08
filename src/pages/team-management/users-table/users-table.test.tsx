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

import { screen } from '@testing-library/react';

import { gqlSetup } from '../../../test-utils';
import { UsersTable } from './users-table.component';

describe('Users table', () => {
    const sort = jest.fn();
    const sortBy = undefined;
    const sortDirection = undefined;
    const sorting = { sort, sortBy, sortDirection };
    it('should render without errors', async () => {
        await gqlSetup(<UsersTable usersData={[]} user={undefined} sorting={sorting} />);
        expect(screen.getByText('EMAIL ADDRESS')).toBeInTheDocument();
    });
});
