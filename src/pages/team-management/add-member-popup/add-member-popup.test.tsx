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
import { fireEvent, screen, within } from '@testing-library/react';

import { capitalize, confirmPasswordErrorMessage, newPasswordErrorMessage } from '../../../shared/utils';
import { CREATE_USER_MOCK, gqlSetup } from '../../../test-utils';
import { Roles } from '../users-table';
import { AddMemberPopup } from './index';

describe('Add member popup', () => {
    const sorting = {
        sort: jest.fn(),
        sortBy: undefined,
        sortDirection: undefined,
    };
    const addOpen = true;
    const setAddOpen = jest.fn(() => Promise.resolve());
    const userInput = {
        id: 'test@email.com',
        name: 'test',
        email: 'test@email.com',
        password: 'dGVzdDEyMzQ=',
        roles: [capitalize(Roles.USER) as Roles],
    };

    const MockedGqlProvider = ({ children }: { children: ReactNode }): JSX.Element => (
        <MockedProvider mocks={[CREATE_USER_MOCK(userInput)]}>{children}</MockedProvider>
    );

    const getAllFields = async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <AddMemberPopup addOpen={addOpen} setAddOpen={setAddOpen} sorting={sorting} />
            </MockedGqlProvider>
        );

        const { getByLabelText, getByRole } = screen;
        const emailField = getByLabelText('Email address');
        const fullNameField = getByLabelText('Full name');
        const passwordField = getByLabelText('Password');
        const confirmField = getByLabelText('Confirm password');
        const saveButton = getByRole('button', { name: 'Save' });

        return { emailField, fullNameField, passwordField, confirmField, saveButton };
    };

    it('should render without error', async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <AddMemberPopup addOpen={addOpen} setAddOpen={setAddOpen} sorting={sorting} />
            </MockedGqlProvider>
        );

        expect(screen.getByText('Add member')).toBeInTheDocument();
    });

    it('should has only one User role', async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <AddMemberPopup addOpen={addOpen} setAddOpen={setAddOpen} sorting={sorting} />
            </MockedGqlProvider>
        );

        const rolesPicker = screen.getByRole('button', { expanded: false });
        const defaultValue = within(rolesPicker).getByText(userInput.roles[0]);

        expect(defaultValue).toBeInTheDocument();
    });

    it('save button should be disabled initially', async () => {
        await gqlSetup(
            <MockedGqlProvider>
                <AddMemberPopup addOpen={addOpen} setAddOpen={setAddOpen} sorting={sorting} />
            </MockedGqlProvider>
        );

        const saveButton = screen.getByText('Save').closest('button');

        expect(saveButton).toBeDisabled();
    });

    it('save button should be disabled when any of the fields is empty, enabled when all fields are filled', async () => {
        const { emailField, fullNameField, passwordField, confirmField, saveButton } = await getAllFields();
        const { email, name } = userInput;

        fireEvent.change(emailField, { target: { value: email } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(fullNameField, { target: { value: name } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(passwordField, { target: { value: 'Test1234' } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(confirmField, { target: { value: 'Test1234' } });
        expect(saveButton).toBeEnabled();
    });

    it('save button should be disabled when email is incorrect', async () => {
        const { emailField, fullNameField, passwordField, confirmField, saveButton } = await getAllFields();
        const { name } = userInput;

        fireEvent.change(emailField, { target: { value: name } });
        fireEvent.change(fullNameField, { target: { value: name } });
        fireEvent.change(passwordField, { target: { value: 'Test1234' } });
        fireEvent.change(confirmField, { target: { value: 'Test1234' } });

        expect(saveButton).toBeDisabled();
    });

    it('should show the error message when passwords do not match', async () => {
        const { emailField, fullNameField, passwordField, confirmField, saveButton } = await getAllFields();
        const { email, name } = userInput;

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.change(fullNameField, { target: { value: name } });
        fireEvent.change(passwordField, { target: { value: 'Test1234' } });
        fireEvent.change(confirmField, { target: { value: '4321Test' } });

        fireEvent.click(saveButton);

        const errorMsg = screen.getByText(confirmPasswordErrorMessage);

        expect(errorMsg).toBeInTheDocument();
    });

    it('save button should be disabled when password does not fit password rules', async () => {
        const { emailField, fullNameField, passwordField, confirmField, saveButton } = await getAllFields();
        const { email, name } = userInput;

        fireEvent.change(emailField, { target: { value: email } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(fullNameField, { target: { value: name } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(passwordField, { target: { value: 'test1234' } });
        expect(saveButton).toBeDisabled();

        fireEvent.change(confirmField, { target: { value: 'test1234' } });
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);

        expect(saveButton).toBeDisabled();

        const errorMsg = screen.getByText(newPasswordErrorMessage);

        expect(errorMsg).toBeInTheDocument();
    });
});
