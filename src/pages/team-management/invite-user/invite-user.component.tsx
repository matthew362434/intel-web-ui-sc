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

import { Key, useEffect, useRef, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Form,
    Heading,
    Item,
    Picker,
    TextField,
} from '@adobe/react-spectrum';
import { useMutation } from '@apollo/client';
import { TextFieldRef } from '@react-types/textfield';
import axios from 'axios';
import { GraphQLError } from 'graphql';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { ButtonWithLoading, SortingParams } from '../../../shared/components';
import { capitalize, ErrorBackendMessage, errorMessageMapping, extractErrorCode } from '../../../shared/utils';
import { ErrorMessage } from '../add-member-popup/error-message';
import { useTeamManagement } from '../team-management-provider.component';
import { RegistrationStatus, Roles, UserQueryDTO } from '../users-table';
import { createUser } from '../users-table/reducer';
import { MAX_NUMBER_OF_CHARACTERS, randomizeColor, validateEmail } from '../utils';
import { INVITE_USER } from './invite-user.gql';

interface InviteUserProps {
    sorting: SortingParams;
}

export const InviteUser = ({ sorting }: InviteUserProps): JSX.Element => {
    const items = [{ role: Roles.USER }];

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<Key>(items[0].role);
    const { addNotification } = useNotification();
    const { usersDispatch } = useTeamManagement();
    const [inviteUser, { loading: isLoading }] = useMutation<UserQueryDTO>(INVITE_USER);
    const inputRef = useRef<TextFieldRef>(null);

    const isValidEmail = validateEmail.isValidSync(email);
    const isBtnDisabled = !isValidEmail || !email || !!errorMsg || isLoading;

    const handleOpen = (): void => {
        setIsOpen(true);
    };

    const handleChange = (value: string): void => {
        errorMsg && setErrorMsg('');
        setEmail(value);
    };

    const handleDismiss = (): void => {
        setIsOpen(false);
        email && setEmail('');
        errorMsg && setErrorMsg('');
    };

    const handleInviteUserPromise = (
        errors: readonly GraphQLError[] | undefined,
        data: UserQueryDTO | undefined | null
    ) => {
        if (errors?.length) {
            errors.forEach((error) => {
                const errorCode = extractErrorCode(error) as ErrorBackendMessage;
                setErrorMsg(errorMessageMapping(errorCode));
            });
        } else {
            if (data?.result) {
                const { id, email: emailDTO, name: fullName, avatar, registered } = data.result;

                const backgroundColor = randomizeColor();

                usersDispatch(
                    createUser({
                        id,
                        email: emailDTO,
                        fullName,
                        role: selectedRole as string,
                        registrationStatus: registered ? RegistrationStatus.COMPLETED : RegistrationStatus.PENDING,
                        userPhoto: avatar,
                        backgroundColor,
                    })
                );
                const { sortBy, sortDirection, sort } = sorting;
                if (sortBy && sortDirection) {
                    sort({ sortBy, sortDirection });
                }
                handleDismiss();
                addNotification(`The invite has been sent to: ${emailDTO}`, NOTIFICATION_TYPE.DEFAULT);
            }
        }
    };

    const handleSubmit = (): void => {
        // if selected role is USER, send empty array because gateway does not support USER, it only supports ADMIN
        const userInput = {
            roles: selectedRole === Roles.USER ? [] : [Roles.ADMIN],
            email,
        };

        inviteUser({ variables: { userInput } })
            .then(({ errors, data }) => handleInviteUserPromise(errors, data))
            .catch((error: unknown) => {
                if (axios.isAxiosError(error)) {
                    addNotification(error.message, NOTIFICATION_TYPE.ERROR);
                }
            });
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <>
            <Button variant={'cta'} onPress={handleOpen} id={'send-invite-btn-id'}>
                Send invite
            </Button>
            <DialogContainer onDismiss={handleDismiss}>
                {isOpen && (
                    <Dialog>
                        <Heading>Send invite</Heading>
                        <Divider size={'S'} />
                        <Content UNSAFE_style={{ overflow: 'hidden' }}>
                            <Form>
                                <TextField
                                    ref={inputRef}
                                    id={'email-address-id'}
                                    type={'email'}
                                    label={'Email address'}
                                    autoComplete={'email'}
                                    value={email}
                                    onChange={handleChange}
                                    maxLength={MAX_NUMBER_OF_CHARACTERS}
                                    validationState={!isValidEmail ? 'invalid' : undefined}
                                />
                                <Picker
                                    label='Role'
                                    items={items}
                                    onSelectionChange={setSelectedRole}
                                    selectedKey={selectedRole}
                                    id='roles-id'
                                >
                                    {(item) => (
                                        <Item key={item.role} textValue={item.role}>
                                            {capitalize(item.role)}
                                        </Item>
                                    )}
                                </Picker>
                                <ErrorMessage marginTop={'size-150'} message={errorMsg} id={'invite'} />
                            </Form>
                        </Content>
                        <ButtonGroup>
                            <Button variant={'secondary'} onPress={handleDismiss} id={'cancel-btn-id'}>
                                Cancel
                            </Button>
                            <ButtonWithLoading
                                isLoading={isLoading}
                                isDisabled={isBtnDisabled}
                                id={'send-btn-id'}
                                onPress={handleSubmit}
                            >
                                Send
                            </ButtonWithLoading>
                        </ButtonGroup>
                    </Dialog>
                )}
            </DialogContainer>
        </>
    );
};
