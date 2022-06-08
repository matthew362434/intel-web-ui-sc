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

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { AlertDialog, Button, DialogTrigger, Flex, Form, TextField } from '@adobe/react-spectrum';
import { useMutation, useQuery } from '@apollo/client';
import { View } from '@react-spectrum/view';

import { useHistoryBlock } from '../../hooks/use-history-block/use-history-block.hook';
import { NOTIFICATION_TYPE, useNotification } from '../../notification';
import { useMediaUpload } from '../../providers/media-upload-provider/media-upload-provider.component';
import { Loading, UnsavedChangesDialog, PageLayout } from '../../shared/components';
import { EDIT_USER, GET_USER } from '../../shared/users.gql';
import { UserQueryDTO } from '../team-management/users-table';
import { MAX_NUMBER_OF_CHARACTERS } from '../team-management/utils';
import { ChangePasswordPopup } from './change-password-popup';
import classes from './profile-page.module.scss';
import { UserPhotoContainer } from './user-photo-container';
import { fullNameValidator, isYupValidationError, signOutAction } from './utils';

export const ProfilePage = (): JSX.Element => {
    const { data, loading, error: queryError } = useQuery<UserQueryDTO>(GET_USER);
    const [editUser] = useMutation(EDIT_USER);
    const prevFullName = useRef<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [fullName, setFullName] = useState<string>('');
    const { addNotification } = useNotification();
    const { isUploadInProgress } = useMediaUpload();

    const conditionBlockHandler = useCallback((): boolean => prevFullName.current !== fullName, [fullName]);
    const [open, setOpen, onUnsavedAction] = useHistoryBlock(conditionBlockHandler);

    const handleChange = (value: string): void => {
        setFullName(value);
    };

    const onSubmit = useCallback(
        (event: FormEvent): void => {
            event.preventDefault();
            try {
                fullNameValidator.validateSync(fullName);
                if (data?.result.id) {
                    setDisabled(true);
                    editUser({
                        variables: { userInput: { id: data?.result.id, name: fullName } },
                    })
                        .then(() => {
                            prevFullName.current = fullName;
                        })
                        .catch((error) => {
                            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
                        })
                        .finally(() => setDisabled(false));
                }
            } catch (error: unknown) {
                if (isYupValidationError(error)) {
                    addNotification(error.message, NOTIFICATION_TYPE.ERROR);
                }
            }
        },
        [fullName, addNotification, editUser, data?.result]
    );

    useEffect(() => {
        if (data) {
            const { name } = data.result;
            prevFullName.current = name;
            setFullName(name);
        }
    }, [data]);

    if (queryError) {
        addNotification('Error while fetching current user data', NOTIFICATION_TYPE.ERROR);
        return <></>;
    }

    return (
        <PageLayout
            breadcrumbs={[{ id: 'profile-id', breadcrumb: 'Profile' }]}
            header={
                isUploadInProgress ? (
                    <DialogTrigger>
                        <Button variant='primary' id='sign-out-button-id'>
                            Sign out
                        </Button>
                        <AlertDialog
                            title='Upload media in progress'
                            variant='warning'
                            cancelLabel='Cancel'
                            primaryActionLabel='Confirm'
                            onPrimaryAction={signOutAction}
                        >
                            Some of your files are still uploading. All pending uploads will be canceled with this
                            action. Are you sure you want to sign out?
                        </AlertDialog>
                    </DialogTrigger>
                ) : (
                    <Button variant='primary' onPress={signOutAction} id='sign-out-button-id'>
                        Sign out
                    </Button>
                )
            }
        >
            <>
                <View position={'relative'} height={'100%'} UNSAFE_className={classes.profileContainer}>
                    {loading ? (
                        <Loading />
                    ) : (
                        data && (
                            <Form onSubmit={onSubmit} marginTop={'size-200'}>
                                <Flex direction='column'>
                                    <UserPhotoContainer
                                        name={data.result.name}
                                        userPhoto={data.result.avatar}
                                        backgroundColor={'var(--blue-steel)'}
                                    />
                                    <TextField
                                        type='text'
                                        id='email-id'
                                        label='Email address'
                                        value={data.result.email}
                                        isReadOnly
                                        UNSAFE_className={[classes.textFieldReadOnly, classes.textField].join(' ')}
                                        marginBottom='size-175'
                                    />
                                    <TextField
                                        type='text'
                                        id='fullname'
                                        name='fullname'
                                        label='Full name'
                                        marginBottom='size-550'
                                        UNSAFE_className={classes.textField}
                                        value={fullName}
                                        maxLength={MAX_NUMBER_OF_CHARACTERS}
                                        onChange={handleChange}
                                        isQuiet
                                    />
                                    <Button
                                        variant='cta'
                                        id='save-btn'
                                        alignSelf='flex-start'
                                        type='submit'
                                        marginBottom='size-550'
                                        isDisabled={disabled || prevFullName.current === fullName || !fullName}
                                    >
                                        Save
                                    </Button>
                                    <ChangePasswordPopup
                                        actionText='Change password'
                                        popupTitle='Change password'
                                        userId={data.result.id}
                                    />
                                </Flex>
                            </Form>
                        )
                    )}
                </View>
                <UnsavedChangesDialog open={open} setOpen={setOpen} onPrimaryAction={onUnsavedAction} />
            </>
        </PageLayout>
    );
};

export default ProfilePage;
