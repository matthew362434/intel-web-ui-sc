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

import { applicationRender as render, screen } from '../../../../../../test-utils';
import { getMockedTreeGroup, getMockedTreeLabel } from '../../../../../../test-utils/mocked-items-factory';
import { LabelItemEditionState } from '../label-tree-view.interface';
import { LabelTreeViewItem } from './label-tree-view-item.component';

describe('LabelTreeViewItem', () => {
    it('Label has 3 actions: to add group and to edit or delete label', async () => {
        const mockedLabel = getMockedTreeLabel({ name: 'Test label' });
        await render(
            <LabelTreeViewItem
                item={mockedLabel}
                clickHandler={jest.fn()}
                isEditable
                save={jest.fn()}
                addChild={jest.fn()}
                projectLabels={[]}
                isMixedRelation
            />
        );

        userEvent.hover(screen.getByText('Test label'));
        expect(screen.getByRole('button', { name: 'add-child-group-button' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'edit-label-button' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('Group has 3 actions: to add label, delete or to edit group', async () => {
        const mockedGroup = getMockedTreeGroup({ name: 'Test group' });
        await render(
            <LabelTreeViewItem
                item={mockedGroup}
                clickHandler={jest.fn()}
                isEditable
                save={jest.fn()}
                addChild={jest.fn()}
                projectLabels={[]}
                isMixedRelation
            />
        );

        userEvent.hover(screen.getByText('Test group'));

        const iconButton = screen.getByRole('button', { name: 'folder.svg' });
        expect(screen.getByRole('button', { name: 'add-child-label-button' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'edit-label-button' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
        expect(screen.getAllByRole('button').filter((button) => button !== iconButton)).toHaveLength(3);
    });
});

describe('Delete group', () => {
    it('Remove group from new tree', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeGroup({ name: 'test', state: LabelItemEditionState.IDLE });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={true}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.NEW_EMPTY }, item.id);
    });

    it('Remove new group', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeGroup({ name: 'test', state: LabelItemEditionState.NEW });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={false}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.NEW_EMPTY }, item.id);
    });

    it('Remove group', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeGroup({ name: 'test', state: LabelItemEditionState.IDLE });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={false}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.IDLE }, item.id);
    });

    it('Remove group with children', async () => {
        const saveHandler = jest.fn();
        const children = [getMockedTreeLabel({ name: 'child 1' })];
        const item = getMockedTreeGroup({ name: 'test', state: LabelItemEditionState.IDLE, children });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={false}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith(
            { ...item, children: children.map((child) => ({ ...child, state: LabelItemEditionState.REMOVED })) },
            item.id
        );
    });
});

describe('Delete labels', () => {
    it('Remove label from new tree', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeLabel({ name: 'test' });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={true}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.NEW_EMPTY }, item.id);
    });

    it('Remove new label', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeLabel({ name: 'test', state: LabelItemEditionState.NEW });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={false}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.NEW_EMPTY }, item.id);
    });

    it('Remove label', async () => {
        const saveHandler = jest.fn();
        const item = getMockedTreeLabel({ name: 'test', state: LabelItemEditionState.IDLE });

        await render(
            <LabelTreeViewItem
                item={item}
                clickHandler={jest.fn()}
                isEditable={true}
                light={true}
                save={saveHandler}
                addChild={jest.fn()}
                projectLabels={[]}
                newTree={false}
                isMixedRelation={false}
            />
        );

        const itemElement = screen.getByText('test');
        userEvent.hover(itemElement);

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(saveHandler).toHaveBeenCalledWith({ ...item, state: LabelItemEditionState.REMOVED }, item.id);
    });
});
