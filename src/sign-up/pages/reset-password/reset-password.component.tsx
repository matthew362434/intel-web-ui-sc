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
import { FormEvent, useState } from 'react';

import { Form, Heading, Text } from '@adobe/react-spectrum';
import { ValidationError } from 'yup';

import { useResetPassword } from '../../../core/user/hooks';
import { MAX_NUMBER_OF_PASSWORD_CHARACTERS } from '../../../pages/profile-page/change-password-popup';
import { isYupValidationError } from '../../../pages/profile-page/utils';
import {
    defaultPasswordState,
    PasswordState,
    validatePasswordsSchema,
} from '../../../pages/team-management/add-member-popup';
import { ButtonWithLoading, PasswordField } from '../../../shared/components';
import sharedClasses from '../../../shared/shared.module.scss';
import { confirmPasswordErrorMessage, encodeToBase64 } from '../../../shared/utils';
import { useEmailToken } from '../../hooks';
import { BackgroundLayout, PrivacyTermsOfUseFooter } from '../../shared';
import { handleErrorMessageState } from '../registration/utils';
import classes from './reset-password.module.scss';

export const ResetPassword = (): JSX.Element => {
    const { email, token } = useEmailToken();
    const [password, setPassword] = useState<PasswordState>(defaultPasswordState);
    const [confirmPassword, setConfirmPassword] = useState<PasswordState>(defaultPasswordState);
    const { resetPassword } = useResetPassword();
    const isBtnDisabled =
        resetPassword.isLoading ||
        !confirmPassword.value ||
        !password.value ||
        !!confirmPassword.error ||
        !!password.error;

    const handlePasswordChange = (value: string): void => {
        setPassword(() => ({ error: '', value }));
    };

    const handleConfirmPasswordChange = (value: string): void => {
        setConfirmPassword(() => ({ error: '', value }));
    };

    const handleResetPassword = (event: FormEvent): void => {
        event.preventDefault();

        try {
            validatePasswordsSchema.validateSync(
                { password: password.value, confirmPassword: confirmPassword.value },
                { abortEarly: false }
            );

            resetPassword.mutate({ token, password: encodeToBase64(password.value) });
        } catch (error: unknown) {
            if (isYupValidationError(error)) {
                error.inner.forEach(({ path, message }: ValidationError) => {
                    if (path === 'password') {
                        setPassword(handleErrorMessageState(message));
                    } else if (path === 'confirmPassword') {
                        setConfirmPassword(handleErrorMessageState(confirmPasswordErrorMessage));
                    }
                });
            }
        }
    };

    return (
        <BackgroundLayout className={resetPassword.isLoading ? sharedClasses.contentDisabled : ''}>
            <Heading
                level={1}
                margin={0}
                marginBottom={'size-100'}
                UNSAFE_className={classes.title}
                id={'reset-password-id'}
            >
                Create new password
            </Heading>
            <Text data-testid={'for-email-id'} UNSAFE_className={classes.createPasswordEmail}>
                for {email}
            </Text>
            <Form marginTop={'size-400'} onSubmit={handleResetPassword}>
                <PasswordField
                    label={'New password'}
                    value={password.value}
                    error={password.error}
                    onChange={handlePasswordChange}
                    maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                    autoComplete='off'
                    isNewPassword
                    isQuiet
                />
                <PasswordField
                    label={'Confirm new password'}
                    value={confirmPassword.value}
                    error={confirmPassword.error}
                    onChange={handleConfirmPasswordChange}
                    maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                    autoComplete='off'
                    isQuiet
                />
                <ButtonWithLoading
                    type={'submit'}
                    isLoading={resetPassword.isLoading}
                    isDisabled={isBtnDisabled}
                    UNSAFE_className={classes.submitBtn}
                >
                    Submit new password
                </ButtonWithLoading>
            </Form>
            <PrivacyTermsOfUseFooter />
        </BackgroundLayout>
    );
};
