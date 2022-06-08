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

import { render } from '@testing-library/react';

import { CasualCell } from './components/casual-cell';
import { ColumnProps, Table } from './index';

describe('Table', () => {
    const mockedActiveUser = {
        email: 'test-user@test.com',
        name: 'test-user',
    };
    const columns: ColumnProps[] = [
        {
            label: 'EMAIL',
            dataKey: 'email',
            width: 300,
            sortable: true,
            component: CasualCell,
        },
        {
            label: 'FULL NAME',
            dataKey: 'name',
            width: 250,
            sortable: false,
            component: CasualCell,
        },
    ];
    const height = '800px';
    const sorting = {
        sortDirection: undefined,
        sortBy: undefined,
        sort: jest.fn(),
    };

    /* MOCK AUTO SIZER */

    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 200 });
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 200 });
    });

    afterAll(() => {
        originalOffsetHeight && Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
        originalOffsetWidth && Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    });

    it('should not render any data in the table, only row with columns', async () => {
        const component = render(<Table data={[]} columns={columns} height={height} />);
        const rows = component.getAllByRole('row');
        expect(rows).toHaveLength(1);
    });

    it('should email column be sortable', async () => {
        const component = render(<Table data={[]} columns={columns} height={height} sorting={sorting} />);
        const emailColumn = component.getByLabelText('EMAIL');
        expect(emailColumn.classList).toHaveLength(2);
        expect(emailColumn.classList.contains('ReactVirtualized__Table__sortableHeaderColumn')).toBe(true);
    });

    it('should render test-user in the table', async () => {
        const component = render(<Table data={[mockedActiveUser]} columns={columns} height={height} />);
        const user = component.getByText('test-user');
        expect(user).toBeInTheDocument();
    });
});
