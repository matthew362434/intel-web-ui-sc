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
import { MockedProvider } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createInMemoryMediaService } from '../../core/media/services';
import { MediaUploadProvider } from '../../providers/media-upload-provider/media-upload-provider.component';
import { EDIT_USER_MOCK, GET_USER_MOCK, gqlSetup } from '../../test-utils';
import { ProfilePage } from './profile-page.component';

const mediaService = createInMemoryMediaService();

describe('Profile Page', () => {
    const userInput = {
        email: 'test@email.com',
        name: 'test',
    };
    const profilePageRender = async () => {
        return await gqlSetup(
            <MockedProvider mocks={[GET_USER_MOCK, EDIT_USER_MOCK(userInput)]}>
                <MediaUploadProvider mediaService={mediaService}>
                    <ProfilePage />
                </MediaUploadProvider>
            </MockedProvider>
        );
    };

    it('Full name and email should be displayed properly', async () => {
        await profilePageRender();
        const fullNameField = screen.getByLabelText('Full name');
        const emailField = screen.getByLabelText('Email address');
        expect(emailField).toHaveValue(userInput.email);
        expect(fullNameField).toHaveValue(userInput.name);
    });

    it('Save button should be disabled when full name has not changed', async () => {
        await profilePageRender();
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('Save button should be enabled when full name has changed', async () => {
        await profilePageRender();
        const fullNameField = screen.getByLabelText('Full name');
        userEvent.type(fullNameField, 'new-user-name');
        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('Save button should be disabled when full name is empty', async () => {
        await profilePageRender();
        const fullNameField = screen.getByLabelText('Full name');
        userEvent.type(fullNameField, '');
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
});
