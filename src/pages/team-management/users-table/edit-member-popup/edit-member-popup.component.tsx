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

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Flex,
    Form,
    TextField,
    Heading,
} from '@adobe/react-spectrum';
import { useMutation } from '@apollo/client';

import { Email } from '../../../../assets/icons';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { SortingParams } from '../../../../shared/components';
import { EDIT_USER } from '../../../../shared/users.gql';
import { useTeamManagement } from '../../team-management-provider.component';
import { editUser } from '../reducer';
import { RegistrationCell } from '../registration-cell';
import { UserProps } from '../users-table.interface';
import classes from './edit-member-popup.module.scss';

interface EditMemberPopupProps {
    setSelectedUser: Dispatch<SetStateAction<UserProps | null>>;
    user: UserProps | null;
    sorting: SortingParams;
}

export const EditMemberPopup = ({ user, setSelectedUser, sorting }: EditMemberPopupProps): JSX.Element => {
    const [fullName, setFullName] = useState<string>(user?.fullName || '');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [editMember] = useMutation(EDIT_USER);
    const { addNotification } = useNotification();
    const { usersDispatch } = useTeamManagement();

    const handleChange = (value: string): void => {
        setFullName(value);
    };

    const handleOnSubmit = async (): Promise<void> => {
        if (user) {
            setDisabled(true);
            editMember({
                variables: { userInput: { id: user.id, name: fullName } },
            })
                .then(({ errors }) => {
                    if (errors?.length) {
                        const [errorMsg] = errors[0].message.split('::');
                        addNotification(errorMsg, NOTIFICATION_TYPE.ERROR);
                    } else {
                        usersDispatch(editUser({ id: user.id, fullName }));
                        const { sort, sortBy, sortDirection } = sorting;
                        if (sortBy && sortDirection) {
                            sort({ sortBy, sortDirection });
                        }
                        setSelectedUser(null);
                    }
                })
                .finally(() => setDisabled(false));
        }
    };

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
        }
    }, [user]);
    return (
        <DialogContainer onDismiss={() => setSelectedUser(null)}>
            {user && (
                <Dialog minHeight='size-3600'>
                    <Heading UNSAFE_className={classes.editMemberTitle} id='edit-member-title'>
                        Edit member
                    </Heading>
                    <Divider />
                    <Content>
                        <Flex
                            alignItems='center'
                            justifyContent='space-between'
                            UNSAFE_className={classes.editMemberUserInfo}
                            marginTop='size-160'
                            marginBottom='size-115'
                        >
                            <Flex
                                minWidth={0}
                                alignItems='center'
                                gap='size-130'
                                UNSAFE_className={classes.editMemberEmail}
                            >
                                <Email id='email-icon' />
                                <span
                                    id='member-email'
                                    title={user.email}
                                    className={[classes.editMemberEmail, 'textOverflow'].join(' ')}
                                >
                                    {user.email}
                                </span>
                            </Flex>
                            <RegistrationCell
                                cellData={user.registrationStatus}
                                dataKey='registration'
                                rowData={{ id: user.email }}
                            />
                        </Flex>
                        <Form>
                            <TextField
                                label='Full name'
                                id='edit-full-name'
                                width='100%'
                                value={fullName}
                                onChange={handleChange}
                            />
                        </Form>
                    </Content>
                    <ButtonGroup>
                        <Button variant='secondary' onPress={() => setSelectedUser(null)} id='cancel-edit-member'>
                            Cancel
                        </Button>
                        <Button
                            variant='cta'
                            isDisabled={disabled || fullName === user.fullName || !fullName.length}
                            onPress={handleOnSubmit}
                            id='save-edit-member'
                        >
                            Save
                        </Button>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogContainer>
    );
};
