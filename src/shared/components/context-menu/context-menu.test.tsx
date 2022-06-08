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

import { Text } from '@adobe/react-spectrum';
import { fireEvent, render, screen } from '@testing-library/react';

import { ContextMenu } from './contex-menu.component';

const renderAndOpen = (menu: React.ReactNode) => {
    const { container } = render(
        <div>
            <button>Open menu</button>
            {menu}
        </div>
    );

    const pointToRemove = screen.getByText('Open menu');

    fireEvent.contextMenu(pointToRemove);
    return container;
};

describe('ContextMenu', () => {
    const openMenuMatcher = jest.fn((element: HTMLElement) => element.textContent === 'Open menu');

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('is wrapped with a "foreignObject" when isSvgParent is true', async () => {
        const container = renderAndOpen(
            <ContextMenu roi={{ width: 200, height: 200 }} matcher={openMenuMatcher} isSvgParent>
                <ContextMenu.Option label={'test1'} onPress={jest.fn()}>
                    <Text>Test</Text>
                </ContextMenu.Option>
            </ContextMenu>
        );
        const foreignobject = container.querySelector('foreignobject');
        expect(foreignobject).toBeInTheDocument();
    });

    it('not renders the menu when the clicked element do not matches the macher validation', async () => {
        render(
            <>
                <button>Open menu</button>
                <button>Secondary</button>
                <ContextMenu roi={{ width: 200, height: 200 }} matcher={openMenuMatcher}>
                    <ContextMenu.Option label={'test1'} onPress={jest.fn()}>
                        <Text>Test1</Text>
                    </ContextMenu.Option>
                </ContextMenu>
            </>
        );

        const pointToRemove = screen.getByText('Secondary');
        fireEvent.contextMenu(pointToRemove);

        expect(openMenuMatcher).toHaveBeenCalled();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('render multiple option', async () => {
        const container = renderAndOpen(
            <ContextMenu roi={{ width: 200, height: 200 }} matcher={openMenuMatcher}>
                <ContextMenu.Option label={'test1'} onPress={jest.fn()}>
                    <Text>Test1</Text>
                </ContextMenu.Option>
                <ContextMenu.Option label={'test2'} onPress={jest.fn()}>
                    <Text>Test2</Text>
                </ContextMenu.Option>
                <ContextMenu.Option label={'test3'} onPress={jest.fn()}>
                    <Text>Test3</Text>
                </ContextMenu.Option>
            </ContextMenu>
        );

        const options = container.querySelectorAll('[role="menu"] > button');
        expect(options).toHaveLength(3);
    });

    it('applies the "formatter" and close the menu', async () => {
        const pressOne = jest.fn();
        const formatterTwo = jest.fn((element: HTMLElement) => element.textContent);

        renderAndOpen(
            <ContextMenu roi={{ width: 200, height: 200 }} matcher={openMenuMatcher}>
                <ContextMenu.Option label={'test1'} onPress={pressOne} dataTransformer={formatterTwo}>
                    <Text>Test</Text>
                </ContextMenu.Option>
            </ContextMenu>
        );

        expect(screen.queryByRole('menu')).toBeInTheDocument();
        const openButton = screen.getByText('Open menu');
        const buttonOne = screen.getByLabelText('test1');
        fireEvent.click(buttonOne);

        expect(formatterTwo).toHaveBeenCalledWith(openButton);
        expect(pressOne).toHaveBeenCalledWith(openButton.textContent);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('returns the clicked element when there is not "formatter"', async () => {
        const pressOne = jest.fn();

        renderAndOpen(
            <ContextMenu roi={{ width: 200, height: 200 }} matcher={openMenuMatcher}>
                <ContextMenu.Option label={'test1'} onPress={pressOne}>
                    <Text>Test</Text>
                </ContextMenu.Option>
            </ContextMenu>
        );

        expect(screen.queryByRole('menu')).toBeInTheDocument();
        const openButton = screen.getByText('Open menu');
        const buttonOne = screen.getByLabelText('test1');
        fireEvent.click(buttonOne);

        expect(pressOne).toHaveBeenCalledWith(openButton);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
