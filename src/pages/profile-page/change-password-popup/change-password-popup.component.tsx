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

import { FormEvent, useState } from 'react';

import { Button, ButtonGroup, Content, Dialog, DialogTrigger, Divider, Form } from '@adobe/react-spectrum';
import { useMutation } from '@apollo/client';
import { ActionButton } from '@react-spectrum/button';
import { Heading } from '@react-spectrum/text';
import { ValidationError } from 'yup';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { PasswordField } from '../../../shared/components';
import { encodeToBase64, ErrorBackendMessage, errorMessageMapping, extractErrorCode } from '../../../shared/utils';
import { PasswordState } from '../../team-management/add-member-popup';
import { CHANGE_PASSWORD } from './change-password-popup.gql';
import { ChangePasswordPopupProps } from './change-password-popup.interface';
import classes from './change-password-popup.module.scss';
import { defaultPassword, MAX_NUMBER_OF_PASSWORD_CHARACTERS, passwordSchema } from './utils';

enum ErrorPath {
    OLD_PASSWORD = 'oldPassword',
    NEW_PASSWORD = 'newPassword',
    CONFIRM_PASSWORD = 'confirmPassword',
}

export const ChangePasswordPopup = ({ actionText, popupTitle, userId }: ChangePasswordPopupProps): JSX.Element => {
    const [oldPassword, setOldPassword] = useState<PasswordState>(defaultPassword);
    const [newPassword, setNewPassword] = useState<PasswordState>(defaultPassword);
    const [confirmPassword, setConfirmPassword] = useState<PasswordState>(defaultPassword);
    const [changePassword] = useMutation(CHANGE_PASSWORD);
    const { addNotification } = useNotification();
    const [disabled, setDisabled] = useState<boolean>(false);
    const activeSaveButton =
        oldPassword.value &&
        newPassword.value &&
        confirmPassword.value &&
        !oldPassword.error &&
        !newPassword.error &&
        !confirmPassword.error;

    const handleOldPassword = (value: string): void => setOldPassword(() => ({ error: '', value }));

    const handleNewPassword = (value: string): void => {
        setNewPassword(() => ({ error: '', value }));
        if (confirmPassword.error) {
            setConfirmPassword((prevConfirmPassword) => ({ ...prevConfirmPassword, error: '' }));
        }
    };

    const handleConfirmPassword = (value: string): void => setConfirmPassword(() => ({ error: '', value }));

    const clearFields = (): void => {
        if (oldPassword.value || oldPassword.error) {
            setOldPassword(defaultPassword);
        }
        if (newPassword.value || newPassword.error) {
            setNewPassword(defaultPassword);
        }
        if (confirmPassword.value || newPassword.error) {
            setConfirmPassword(defaultPassword);
        }
    };

    const onSubmit = (close: () => void) => {
        return async (event: FormEvent): Promise<void> => {
            event.preventDefault();
            setDisabled(true);
            try {
                const result = passwordSchema.validateSync(
                    {
                        oldPassword: oldPassword.value,
                        newPassword: newPassword.value,
                        confirmPassword: confirmPassword.value,
                    },
                    { abortEarly: false }
                );
                changePassword({
                    variables: {
                        id: userId,
                        oldPassword: encodeToBase64(result.oldPassword),
                        newPassword: encodeToBase64(result.newPassword),
                    },
                })
                    .then(({ errors }) => {
                        if (errors?.length) {
                            errors.forEach((error) => {
                                const errorCode = extractErrorCode(error) as ErrorBackendMessage;
                                const errorMsg = errorMessageMapping(errorCode);
                                if (errorCode === ErrorBackendMessage.WRONG_OLD_PASSWORD) {
                                    setOldPassword((prev) => ({ ...prev, error: errorMsg }));
                                } else {
                                    setNewPassword((prev) => ({ ...prev, error: errorMsg }));
                                }
                            });
                        } else {
                            close();
                            clearFields();
                            addNotification('Password changed successfully', NOTIFICATION_TYPE.DEFAULT);
                        }
                    })
                    .finally(() => setDisabled(false));
            } catch (error) {
                const errorMsgs = {
                    oldPassword: new Array<string>(),
                    newPassword: new Array<string>(),
                    confirmPassword: new Array<string>(),
                };
                (error as ValidationError).inner.forEach(({ path, message }: ValidationError) => {
                    if (path === ErrorPath.OLD_PASSWORD) {
                        errorMsgs.oldPassword.push(message);
                    } else if (path === ErrorPath.NEW_PASSWORD) {
                        errorMsgs.newPassword.push(message);
                    } else {
                        errorMsgs.confirmPassword.push(message);
                    }
                });

                if (errorMsgs.oldPassword.length) {
                    setOldPassword((prev: PasswordState) => ({
                        ...prev,
                        error: errorMsgs.oldPassword[0],
                    }));
                }
                if (errorMsgs.newPassword.length) {
                    setNewPassword((prev: PasswordState) => ({
                        ...prev,
                        error: errorMsgs.newPassword[0],
                    }));
                }
                if (errorMsgs.confirmPassword.length) {
                    setConfirmPassword((prev: PasswordState) => ({
                        ...prev,
                        error: errorMsgs.confirmPassword[0],
                    }));
                }
                setDisabled(false);
            }
        };
    };

    return (
        <DialogTrigger>
            <ActionButton alignSelf='self-start' UNSAFE_className={classes.popupTrigger}>
                {actionText}
            </ActionButton>
            {(close) => (
                <Form onSubmit={onSubmit(close)}>
                    <Dialog UNSAFE_className={classes.popupBox} minHeight='size-5000'>
                        <Heading UNSAFE_className={classes.popupTitle}>{popupTitle}</Heading>
                        <Divider />
                        <Content>
                            <PasswordField
                                id='old-password'
                                label='Old password'
                                value={oldPassword.value}
                                error={oldPassword.error}
                                autoComplete='off'
                                onChange={handleOldPassword}
                                maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                            />
                            <PasswordField
                                id='new-password'
                                label='New password'
                                value={newPassword.value}
                                error={newPassword.error}
                                autoComplete='off'
                                onChange={handleNewPassword}
                                maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                                isNewPassword
                            />
                            <PasswordField
                                id='confirm-password'
                                label='Confirm new password'
                                value={confirmPassword.value}
                                error={confirmPassword.error}
                                autoComplete='off'
                                onChange={handleConfirmPassword}
                                maxLength={MAX_NUMBER_OF_PASSWORD_CHARACTERS}
                            />
                        </Content>
                        <ButtonGroup>
                            <Button
                                variant='secondary'
                                id='cancel-popup-btn'
                                onPress={() => {
                                    close();
                                    clearFields();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant='cta'
                                id='save-popup-btn'
                                type='submit'
                                isDisabled={disabled || !activeSaveButton}
                            >
                                Save
                            </Button>
                        </ButtonGroup>
                    </Dialog>
                </Form>
            )}
        </DialogTrigger>
    );
};
