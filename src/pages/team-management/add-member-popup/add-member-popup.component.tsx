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

import { Key, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Form,
    Item,
    Picker,
    TextField,
} from '@adobe/react-spectrum';
import { useMutation } from '@apollo/client';
import { Heading } from '@react-spectrum/text';
import { ValidationError } from 'yup';

import { ButtonWithLoading, PasswordField } from '../../../shared/components';
import {
    capitalize,
    confirmPasswordErrorMessage,
    encodeToBase64,
    ErrorBackendMessage,
    errorMessageMapping,
    extractErrorCode,
} from '../../../shared/utils';
import { MAX_NUMBER_OF_PASSWORD_CHARACTERS } from '../../profile-page/change-password-popup';
import { isYupValidationError } from '../../profile-page/utils';
import { useTeamManagement } from '../team-management-provider.component';
import { RegistrationStatus, Roles, UserQueryDTO } from '../users-table';
import { createUser } from '../users-table/reducer';
import {
    defaultPasswordState,
    MAX_NUMBER_OF_CHARACTERS,
    randomizeColor,
    validateEmail,
    validatePasswordsSchema,
} from '../utils';
import { AddMemberPopupProps, PasswordState } from './add-member-popup.interface';
import classes from './add-member-popup.module.scss';
import { CREATE_USER } from './add-member.gql';
import { ErrorMessage } from './error-message';

export const AddMemberPopup = ({ addOpen, setAddOpen, sorting }: AddMemberPopupProps): JSX.Element => {
    const items = [{ role: capitalize(Roles.USER) }];
    const [selectedRole, setSelectedRole] = useState<Key>(items[0].role);
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [password, setPassword] = useState<PasswordState>(defaultPasswordState);
    const [confirmPassword, setConfirmPassword] = useState<PasswordState>(defaultPasswordState);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [errorCreationMessage, setErrorCreationMessage] = useState<string>('');
    const [addMember, { loading: isLoading }] = useMutation<UserQueryDTO>(CREATE_USER);
    const { usersDispatch } = useTeamManagement();
    const isValidEmail = validateEmail.isValidSync(email);
    const activeSaveButton =
        email &&
        isValidEmail &&
        fullName &&
        password.value &&
        confirmPassword.value &&
        !password.error &&
        !confirmPassword.error;

    const handlePassword = (value: string): void => setPassword(() => ({ error: '', value }));

    const handleConfirmPassword = (value: string): void => setConfirmPassword(() => ({ error: '', value }));

    const handleOnDismiss = (): void => {
        setAddOpen(false);
        setEmail('');
        setFullName('');
        setPassword(defaultPasswordState);
        setConfirmPassword(defaultPasswordState);
        setDisabled(false);
        setErrorCreationMessage('');
    };

    const handleOnSubmit = async (): Promise<void> => {
        try {
            setDisabled(true);

            if (errorCreationMessage) {
                setErrorCreationMessage('');
            }

            const result = validatePasswordsSchema.validateSync(
                {
                    password: password.value,
                    confirmPassword: confirmPassword.value,
                },
                { abortEarly: false }
            );

            const userInput = {
                id: email,
                email,
                name: fullName,
                password: encodeToBase64(result.password),
                roles: [],
            };

            addMember({
                variables: { userInput },
            })
                .then(({ errors, data }) => {
                    if (errors?.length) {
                        errors.forEach((error) => {
                            const errorCode = extractErrorCode(error) as ErrorBackendMessage;

                            setErrorCreationMessage(errorMessageMapping(errorCode));
                        });
                    } else {
                        if (data?.result) {
                            const backgroundColor = randomizeColor();
                            usersDispatch(
                                createUser({
                                    id: email,
                                    email,
                                    fullName,
                                    role: Roles.USER,
                                    registrationStatus: data.result.registered
                                        ? RegistrationStatus.COMPLETED
                                        : RegistrationStatus.PENDING,
                                    userPhoto: null,
                                    backgroundColor,
                                })
                            );

                            const { sortBy, sortDirection, sort } = sorting;

                            if (sortBy && sortDirection) {
                                sort({ sortBy, sortDirection });
                            }

                            handleOnDismiss();
                        }
                    }
                })
                .finally(() => setDisabled(false));
        } catch (error) {
            if (isYupValidationError(error)) {
                const errorMsgs = {
                    password: new Array<string>(),
                    confirmPassword: new Array<string>(),
                };

                error.inner.forEach(({ path, message }: ValidationError) => {
                    if (path === 'password') {
                        errorMsgs.password.push(message);
                    } else if (path === 'confirmPassword') {
                        errorMsgs.confirmPassword.push(confirmPasswordErrorMessage);
                    }
                });

                if (errorMsgs.password.length) {
                    const [errorMsg] = errorMsgs.password;

                    setPassword((prev: PasswordState) => ({ ...prev, error: errorMsg }));
                }
                if (errorMsgs.confirmPassword.length) {
                    const [errorMsg] = errorMsgs.confirmPassword;

                    setConfirmPassword((prev: PasswordState) => ({
                        ...prev,
                        error: errorMsg,
                    }));
                }

                setDisabled(false);
            }
        }
    };

    return (
        <DialogContainer onDismiss={handleOnDismiss}>
            {addOpen && (
                <Dialog>
                    <Heading UNSAFE_className={classes.addMemberTitle} id='add-member-title'>
                        Add member
                    </Heading>
                    <Divider />
                    <Content UNSAFE_className={classes.addMemberContent}>
                        <Form>
                            <TextField
                                label='Email address'
                                id='email-address-add-member'
                                type='email'
                                autoComplete='email'
                                value={email}
                                onChange={setEmail}
                                maxLength={MAX_NUMBER_OF_CHARACTERS}
                                validationState={!isValidEmail ? 'invalid' : undefined}
                            />
                            <TextField
                                label='Full name'
                                id='full-name-add-member'
                                autoComplete='username'
                                value={fullName}
                                onChange={setFullName}
                                maxLength={MAX_NUMBER_OF_CHARACTERS}
                            />
                            <Picker
                                label='Role'
                                items={items}
                                onSelectionChange={setSelectedRole}
                                selectedKey={selectedRole}
                                id='roles-add-member'
                            >
                                {(item) => (
                                    <Item key={item.role} textValue={item.role}>
                                        {capitalize(item.role)}
                                    </Item>
                                )}
                            </Picker>
                            <PasswordField
                                error={password.error}
                                label='Password'
                                isNewPassword
                                id='password-add-member'
                                autoComplete='off'
                                value={password.value}
                                onChange={handlePassword}
                                maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                            />
                            <PasswordField
                                error={confirmPassword.error}
                                label='Confirm password'
                                id='confirm-password-add-member'
                                autoComplete='off'
                                value={confirmPassword.value}
                                onChange={handleConfirmPassword}
                                maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                            />
                            <ErrorMessage message={errorCreationMessage} id={'creation'} />
                        </Form>
                    </Content>
                    <ButtonGroup>
                        <Button variant='secondary' onPress={handleOnDismiss} id='cancel-add-member'>
                            Cancel
                        </Button>
                        <ButtonWithLoading
                            isLoading={isLoading}
                            variant='cta'
                            id='save-add-member'
                            isDisabled={disabled || !activeSaveButton}
                            onPress={handleOnSubmit}
                        >
                            Save
                        </ButtonWithLoading>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogContainer>
    );
};
