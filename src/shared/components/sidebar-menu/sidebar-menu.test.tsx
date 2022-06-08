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
import { fireEvent, queryByAttribute, render } from '@testing-library/react';

import { getById } from '../../../test-utils';
import { MenuOption } from '../menu-option.interface';
import { SidebarMenu } from './sidebar-menu.component';

let currentPath = '';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '/sidebar-menu/test2',
    }),
    useHistory: () => ({
        push: (path: string) => {
            currentPath = path;
        },
    }),
}));

beforeEach(() => {
    currentPath = '';
});

describe('Sidebar menu', () => {
    const options: MenuOption[] = [
        {
            id: 'test1',
            name: 'Test 1',
            url: '/sidebar-menu/test1',
            ariaLabel: 'side bar menu test 1',
        },
        {
            id: 'test2',
            name: 'Test 2',
            url: '/sidebar-menu/test2',
            ariaLabel: 'side bar menu test 2',
        },
    ];

    it('Check if there are proper options displayed', () => {
        const { container } = render(<SidebarMenu options={[options]} id={'test'} />);
        expect(getById(container, 'sidebar-menu-test1')).toBeInTheDocument();
        expect(getById(container, 'sidebar-menu-test2')).toBeInTheDocument();
    });

    it('Check if test2 option is selected if there is matching path', () => {
        const { container } = render(<SidebarMenu options={[options]} id={'test'} />);
        const test1 = queryByAttribute('data-key', container, 'test1');
        const test2 = queryByAttribute('data-key', container, 'test2');

        expect(test1?.getAttribute('aria-checked')).toBe('false');
        expect(test2?.getAttribute('aria-checked')).toBe('true');
    });

    it('Check if test1 is disabled', () => {
        const { container } = render(<SidebarMenu options={[options]} disabledOptions={['test1']} id={'test'} />);
        const test1 = queryByAttribute('data-key', container, 'test1');
        const test2 = queryByAttribute('data-key', container, 'test2');

        expect(test1?.getAttribute('aria-disabled')).toBe('true');
        expect(test2?.getAttribute('aria-disabled')).toBe('false');
    });

    it('select first option and check if selected', () => {
        const { container } = render(<SidebarMenu options={[options]} id={'test'} />);
        const test1 = queryByAttribute('data-key', container, 'test1');
        test1 && fireEvent.click(test1);

        expect(currentPath).toBe('url' in options[0] ? options[0].url : undefined);
    });

    it('select disabled option and check not selected', () => {
        const { container } = render(<SidebarMenu options={[options]} disabledOptions={['test1']} id={'test'} />);
        const test1 = queryByAttribute('data-key', container, 'test1');
        test1 && fireEvent.click(test1);

        expect(currentPath).toBe('');
    });
});
