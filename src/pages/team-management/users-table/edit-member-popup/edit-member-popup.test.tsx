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

import { ReactNode } from 'react';

import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, screen } from '@testing-library/react';

import { capitalize } from '../../../../shared/utils';
import { EDIT_USER_MOCK, gqlSetup, users } from '../../../../test-utils';
import { RegistrationStatus } from '../users-table.interface';
import { EditMemberPopup } from './index';

describe('Edit member popup', () => {
    const setSelectedUser = jest.fn(() => Promise.resolve());
    const sorting = {
        sort: jest.fn(),
        sortBy: undefined,
        sortDirection: undefined,
    };
    const userInput = {
        id: users[0].id,
        name: 'new-test-user',
    };

    const MockedGqlProvider = ({ children }: { children: ReactNode }): JSX.Element => (
        <MockedProvider mocks={[EDIT_USER_MOCK(userInput)]}>{children}</MockedProvider>
    );

    it('should render without error', async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[0]} sorting={sorting} />
            </MockedGqlProvider>
        );

        expect(screen.getByText('Edit member')).toBeInTheDocument();
    });

    it("should save button be disabled when name hasn't been changed", async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[0]} sorting={sorting} />
            </MockedGqlProvider>
        );

        const saveButton = screen.getByText('Save').closest('button');
        expect(saveButton).toBeDisabled();
    });

    it('should save button be enabled when full name has been changed with no empty value', async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[0]} sorting={sorting} />
            </MockedGqlProvider>
        );

        const textField = screen.getByLabelText('Full name');
        fireEvent.change(textField, { target: { value: userInput.name } });
        expect(textField).toHaveValue(userInput.name);

        const saveButton = screen.getByText('Save').closest('button');
        expect(saveButton).toBeEnabled();
    });

    it('should save button be disabled when full name has been changed with empty value', async () => {
        userInput.name = '';

        await gqlSetup(
            <MockedProvider mocks={[EDIT_USER_MOCK(userInput)]}>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[0]} sorting={sorting} />
            </MockedProvider>
        );

        const textField = screen.getByLabelText('Full name');
        fireEvent.change(textField, { target: { value: userInput.name } });
        expect(textField).toHaveValue(userInput.name);

        const saveButton = screen.getByText('Save').closest('button');
        expect(saveButton).toBeDisabled();
    });

    it('should show "Pending" status when user is not fully registered', async () => {
        await gqlSetup(
            <MockedProvider mocks={[EDIT_USER_MOCK({ ...userInput, id: users[1].id })]}>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[1]} sorting={sorting} />
            </MockedProvider>
        );

        expect(screen.getByTestId('pending-registration-icon-id')).toBeInTheDocument();
        expect(screen.getByText(capitalize(RegistrationStatus.PENDING))).toBeInTheDocument();
    });

    it('should show "Completed" status when user is not fully registered', async () => {
        await gqlSetup(
            <MockedProvider mocks={[EDIT_USER_MOCK(userInput)]}>
                <EditMemberPopup setSelectedUser={setSelectedUser} user={users[0]} sorting={sorting} />
            </MockedProvider>
        );

        expect(screen.getByTestId('completed-registration-icon-id')).toBeInTheDocument();
        expect(screen.getByText(capitalize(RegistrationStatus.COMPLETED))).toBeInTheDocument();
    });
});
