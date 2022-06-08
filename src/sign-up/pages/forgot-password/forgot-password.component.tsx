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

import { Form, Heading, TextField, Text, View } from '@adobe/react-spectrum';

import { ROUTER_PATHS } from '../../../core/services';
import { useForgotPassword } from '../../../core/user/hooks';
import { MAX_NUMBER_OF_CHARACTERS, validateEmail } from '../../../pages/team-management/utils';
import { ButtonWithLoading } from '../../../shared/components';
import sharedClasses from '../../../shared/shared.module.scss';
import { BackgroundLayout } from '../../shared';
import classes from './forgot-password.module.scss';

export const ForgotPassword = (): JSX.Element => {
    const [email, setEmail] = useState<string>('');
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState<boolean>(true);
    const { forgotPassword } = useForgotPassword();
    const { isLoading } = forgotPassword;
    const isValidEmail = validateEmail.isValidSync(email);
    const isBtnDisabled = !email || !isValidEmail || isLoading;

    const handleForgotPassword = (event: FormEvent): void => {
        event.preventDefault();
        forgotPassword.mutate(
            { email },
            {
                onSuccess: () => {
                    setShowForgotPasswordForm(false);
                },
            }
        );
    };

    return (
        <BackgroundLayout height={'62rem'} className={isLoading ? sharedClasses.contentDisabled : ''}>
            <Heading
                level={1}
                margin={0}
                marginBottom={'size-500'}
                UNSAFE_className={classes.title}
                id={'forgot-password-title-id'}
            >
                Password recovery
            </Heading>
            {showForgotPasswordForm ? (
                <Form onSubmit={handleForgotPassword}>
                    <TextField
                        label={'Email address'}
                        marginBottom={'size-450'}
                        width={'100%'}
                        value={email}
                        onChange={setEmail}
                        validationState={!isValidEmail ? 'invalid' : undefined}
                        maxLength={MAX_NUMBER_OF_CHARACTERS}
                        isQuiet
                    />
                    <ButtonWithLoading
                        variant={'cta'}
                        type={'submit'}
                        UNSAFE_className={classes.submitBtn}
                        isDisabled={isBtnDisabled}
                        isLoading={isLoading}
                    >
                        Reset
                    </ButtonWithLoading>
                </Form>
            ) : (
                <Text data-testid={'recovery-msg-id'} UNSAFE_className={classes.passwordRecoveryConfirmation}>
                    A message has been sent to Your email with further instructions.
                </Text>
            )}
            <View position={'absolute'} bottom={'size-400'}>
                <Text UNSAFE_className={classes.backSignIn}>
                    Back to{' '}
                    <a href={ROUTER_PATHS.HOME} className={classes.signInLink}>
                        Sign in
                    </a>
                </Text>
            </View>
        </BackgroundLayout>
    );
};
