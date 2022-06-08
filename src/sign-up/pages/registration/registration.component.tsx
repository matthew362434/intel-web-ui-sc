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
import { useState } from 'react';

import { Heading, View, Text, TextField, Flex, Form } from '@adobe/react-spectrum';
import { ValidationError } from 'yup';

import { ROUTER_PATHS } from '../../../core/services';
import { useUserRegister } from '../../../core/user/hooks';
import { MAX_NUMBER_OF_PASSWORD_CHARACTERS } from '../../../pages/profile-page/change-password-popup';
import { isYupValidationError } from '../../../pages/profile-page/utils';
import { PasswordState } from '../../../pages/team-management/add-member-popup';
import {
    MAX_NUMBER_OF_CHARACTERS,
    defaultPasswordState,
    validatePasswordsSchema,
} from '../../../pages/team-management/utils';
import { ButtonWithLoading, PasswordField } from '../../../shared/components';
import { encodeToBase64 } from '../../../shared/utils';
import { useEmailToken } from '../../hooks';
import { BackgroundLayout, PrivacyTermsOfUseFooter } from '../../shared';
import classes from './registration.module.scss';
import { handleErrorMessageState } from './utils';

export const Registration = (): JSX.Element => {
    const { email, token } = useEmailToken();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [password, setPassword] = useState<PasswordState>(defaultPasswordState);
    const [confirmPassword, setConfirmPassword] = useState<PasswordState>(defaultPasswordState);
    const { registerUser } = useUserRegister();

    const isBtnDisabled: boolean =
        !firstName ||
        !lastName ||
        !password.value ||
        !!password.error ||
        !confirmPassword.value ||
        !!confirmPassword.error ||
        registerUser.isLoading;

    const handlePassword = (value: string): void => {
        setPassword(() => ({
            error: '',
            value,
        }));
    };

    const handleConfirmPassword = (value: string): void => {
        setConfirmPassword(() => ({
            error: '',
            value,
        }));
    };

    const handleSubmit = (): void => {
        try {
            validatePasswordsSchema.validateSync(
                {
                    password: password.value,
                    confirmPassword: confirmPassword.value,
                },
                { abortEarly: false }
            );

            registerUser.mutate({ token, name: `${firstName} ${lastName}`, password: encodeToBase64(password.value) });
        } catch (error: unknown) {
            if (isYupValidationError(error)) {
                error.inner.forEach(({ path, message }: ValidationError) => {
                    if (path === 'password') {
                        setPassword(handleErrorMessageState(message));
                    } else if (path === 'confirmPassword') {
                        setConfirmPassword(handleErrorMessageState(message));
                    }
                });
            }
        }
    };

    return (
        <BackgroundLayout className={classes.registerBox}>
            <Heading level={1} margin={0} UNSAFE_className={classes.title} id={'sign-up-title-id'}>
                Sign up
            </Heading>
            <Text UNSAFE_className={classes.registerAlreadyAccount}>
                Already have an account?{' '}
                <a href={ROUTER_PATHS.HOME} className={classes.signInLink} id={'sign-in-link-id'}>
                    Sign in
                </a>
            </Text>
            <View marginTop={'size-500'} UNSAFE_className={classes.registerContent}>
                <Form>
                    <TextField
                        id={'email-address-id'}
                        label={'Email address'}
                        type={'email'}
                        width={'100%'}
                        value={email}
                        UNSAFE_className={classes.textFieldReadOnly}
                        isQuiet
                        isReadOnly
                    />
                    <Flex alignItems={'center'} marginTop={'size-200'} gap={'size-200'}>
                        <TextField
                            id={'first-name-id'}
                            label={'First name'}
                            value={firstName}
                            onChange={setFirstName}
                            maxLength={MAX_NUMBER_OF_CHARACTERS}
                            autoComplete={'username'}
                            isQuiet
                        />
                        <TextField
                            id={'last-name-id'}
                            label={'Last name'}
                            value={lastName}
                            onChange={setLastName}
                            maxLength={MAX_NUMBER_OF_CHARACTERS}
                            autoComplete={'username'}
                            isQuiet
                        />
                    </Flex>
                    <PasswordField
                        id={'password-id'}
                        error={password.error}
                        label={'Password'}
                        marginTop={'size-200'}
                        value={password.value}
                        onChange={handlePassword}
                        autoComplete='off'
                        maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                        isQuiet
                        isNewPassword
                    />
                    <PasswordField
                        id={'confirm-password-id'}
                        error={confirmPassword.error}
                        label={'Confirm password'}
                        value={confirmPassword.value}
                        onChange={handleConfirmPassword}
                        autoComplete='off'
                        maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                        isQuiet
                    />
                    <ButtonWithLoading
                        id={'sign-up-btn-id'}
                        variant={'cta'}
                        width={'100%'}
                        marginTop={'size-200'}
                        UNSAFE_className={classes.submitBtn}
                        isDisabled={isBtnDisabled}
                        onPress={handleSubmit}
                        isLoading={registerUser.isLoading}
                    >
                        Sign up
                    </ButtonWithLoading>
                </Form>
                <PrivacyTermsOfUseFooter />
            </View>
        </BackgroundLayout>
    );
};
