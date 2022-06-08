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
import { Flex, Text } from '@adobe/react-spectrum';
import userEvent from '@testing-library/user-event';

import { applicationRender as render, MORE_THAN_100_CHARS_NAME, screen } from '../../../../../../../test-utils';
import { getMockedTreeGroup } from '../../../../../../../test-utils/mocked-items-factory';
import { REQUIRED_NAME_VALIDATION_MESSAGE } from '../../../../../../create-project';
import { LabelTreeGroup } from '../../label-tree-view.interface';
import { GroupEditionMode } from './group-edition-mode.component';

describe('Group edition mode', () => {
    it('check if group is limited to 100 chars in label edition', async () => {
        await render(<GroupEditionMode projectGroups={[]} save={jest.fn()} finishEdition={jest.fn()} />);
        const groupField = screen.getByPlaceholderText('Group name');

        userEvent.clear(groupField);
        userEvent.type(groupField, MORE_THAN_100_CHARS_NAME);
        expect(groupField).toHaveValue(MORE_THAN_100_CHARS_NAME.substring(0, 100));
    });

    it('Check if switching multi label mode will enable saving button', async () => {
        const saveMock = jest.fn();
        await render(
            <GroupEditionMode
                group={getMockedTreeGroup({ name: 'test' }) as LabelTreeGroup}
                projectGroups={[]}
                save={saveMock}
                finishEdition={jest.fn()}
            />
        );
        const saveButton = screen.getByRole('button', { name: 'save changes' });
        expect(saveButton).toBeDisabled();
        const multiLabelSwitch = screen.getByRole('switch');
        userEvent.click(multiLabelSwitch);
        expect(saveButton).toBeEnabled();
        userEvent.click(saveButton);
        expect(saveMock).toHaveBeenCalled();
    });

    it('Validation name error is not visible when name is not dirty and mode was changed', async () => {
        await render(<GroupEditionMode projectGroups={[]} save={jest.fn()} finishEdition={jest.fn()} />);
        const multiLabelSwitch = screen.getByRole('switch');
        userEvent.click(multiLabelSwitch);
        expect(screen.queryByText(REQUIRED_NAME_VALIDATION_MESSAGE)).not.toBeInTheDocument();
    });

    it('Validation name error is visible when name is cleared', async () => {
        await render(
            <GroupEditionMode
                group={getMockedTreeGroup({ name: 'test' }) as LabelTreeGroup}
                projectGroups={[]}
                save={jest.fn()}
                finishEdition={jest.fn()}
            />
        );
        const groupField = screen.getByPlaceholderText('Group name');
        userEvent.clear(groupField);
        expect(screen.getByText(REQUIRED_NAME_VALIDATION_MESSAGE)).toBeInTheDocument();
    });

    it('Clicking outside of component should save group when there is no error', async () => {
        const finishEditionMock = jest.fn();
        const saveMock = jest.fn();
        await render(
            <Flex>
                <Text>Title</Text>
                <GroupEditionMode
                    group={getMockedTreeGroup({ name: 'test' }) as LabelTreeGroup}
                    projectGroups={[]}
                    save={saveMock}
                    finishEdition={finishEditionMock}
                />
            </Flex>
        );
        const groupField = screen.getByPlaceholderText('Group name');
        userEvent.type(groupField, '123');
        userEvent.click(screen.getByText('Title'));
        expect(saveMock).toHaveBeenCalled();
        expect(finishEditionMock).toHaveBeenCalled();
        expect(groupField).toHaveValue('');
        const saveButton = screen.getByRole('button', { name: 'save changes' });
        expect(saveButton).toBeDisabled();
    });

    it('Clicking outside of component should not save group when there is an error', async () => {
        const finishEditionMock = jest.fn();
        const saveMock = jest.fn();
        await render(
            <Flex>
                <Text>Title</Text>
                <GroupEditionMode
                    group={getMockedTreeGroup({ name: 'test' }) as LabelTreeGroup}
                    projectGroups={[]}
                    save={saveMock}
                    finishEdition={finishEditionMock}
                />
            </Flex>
        );
        const groupField = screen.getByPlaceholderText('Group name');
        userEvent.clear(groupField);
        userEvent.click(screen.getByText('Title'));
        expect(saveMock).toHaveBeenCalledWith();
        expect(finishEditionMock).toHaveBeenCalled();
    });

    it('Empty group - cancel deletes it', async () => {
        const finishEditionMock = jest.fn();
        const saveMock = jest.fn();
        await render(<GroupEditionMode projectGroups={[]} save={saveMock} finishEdition={finishEditionMock} />);

        userEvent.click(screen.getByRole('button', { name: 'discard changes' }));
        expect(saveMock).toHaveBeenCalledWith();
        expect(finishEditionMock).toHaveBeenCalled();
    });

    it('Cancel group edition', async () => {
        const finishEditionMock = jest.fn();
        const saveMock = jest.fn();
        const group = getMockedTreeGroup({ name: 'test' }) as LabelTreeGroup;
        await render(
            <GroupEditionMode group={group} projectGroups={[]} save={saveMock} finishEdition={finishEditionMock} />
        );
        userEvent.type(screen.getByPlaceholderText('Group name'), '123');

        userEvent.click(screen.getByRole('button', { name: 'discard changes' }));
        expect(saveMock).toHaveBeenCalledWith();
        expect(finishEditionMock).toHaveBeenCalled();
    });
});
