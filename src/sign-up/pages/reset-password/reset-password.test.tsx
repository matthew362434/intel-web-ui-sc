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
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { confirmPasswordErrorMessage, newPasswordErrorMessage } from '../../../shared/utils';
import { applicationRender as render } from '../../../test-utils';
import { ResetPassword } from './reset-password.component';

// token consists of an email (test@gmail.com) and exp time

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(() => ({
        search: 'token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJleHAiOjE2NDc0MzM4MDJ9.ZOLAB63iBkK04RAibctGCEFfmp7kXQp8vSM1yQuHH8g',
    })),
}));

describe('Reset password', () => {
    const emailStoredInToken = 'test@gmail.com';
    const correctPassword = 'Test1234';
    const incorrectPassword = 'test1234';

    it("User's email should be shown", async () => {
        await render(<ResetPassword />);

        expect(screen.getByTestId('for-email-id')).toHaveTextContent(emailStoredInToken);
    });

    it('Submit new password button should be disabled when password fields are empty', async () => {
        await render(<ResetPassword />);

        expect(screen.getByRole('button', { name: /submit new password/i })).toBeDisabled();
    });

    it('Submit new password button should be enabled when password fields are not empty', async () => {
        await render(<ResetPassword />);

        userEvent.type(screen.getByLabelText('New password'), correctPassword);
        userEvent.type(screen.getByLabelText('Confirm new password'), correctPassword);

        expect(screen.getByRole('button', { name: /submit new password/i })).toBeEnabled();
    });

    it('Submit new password button should be disabled when any password does not meet reqs', async () => {
        await render(<ResetPassword />);

        const submitBtn = screen.getByRole('button', { name: /submit new password/i });

        userEvent.type(screen.getByLabelText('New password'), incorrectPassword);
        userEvent.type(screen.getByLabelText('Confirm new password'), correctPassword);
        userEvent.click(submitBtn);

        expect(submitBtn).toBeDisabled();
    });

    it('Error should be shown when password does not meet reqs', async () => {
        await render(<ResetPassword />);

        userEvent.type(screen.getByLabelText('New password'), incorrectPassword);
        userEvent.type(screen.getByLabelText('Confirm new password'), correctPassword);
        userEvent.click(screen.getByRole('button', { name: /submit new password/i }));

        expect(screen.getByTestId('new-password-error-msg')).toHaveTextContent(newPasswordErrorMessage);
    });

    it('Error should be shown when passwords do not match', async () => {
        await render(<ResetPassword />);

        userEvent.type(screen.getByLabelText('New password'), correctPassword);
        userEvent.type(screen.getByLabelText('Confirm new password'), correctPassword + '5');
        userEvent.click(screen.getByRole('button', { name: /submit new password/i }));

        expect(screen.getByTestId('confirm-new-password-error-msg')).toHaveTextContent(confirmPasswordErrorMessage);
    });
});
