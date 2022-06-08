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

import { ChangeEvent, useRef, useState } from 'react';

import { View } from '@adobe/react-spectrum';
import { useMutation } from '@apollo/client';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import {
    mediaExtensionHandler,
    VALID_IMAGE_TYPES,
} from '../../../providers/media-upload-provider/media-upload.validator';
import { ErrorBackendMessage, errorMessageMapping, extractErrorCode } from '../../../shared/utils';
import { UserPhoto } from './user-photo';
import { UserPhotoPlaceholder } from './user-photo-placeholder';
import { UPLOAD_USER_PHOTO, UploadUserPhotoResult } from './user-photo-upload.gql';

interface UserPhotoContainerProps {
    name: string;
    userPhoto: string | null;
    backgroundColor: string;
}

export const UserPhotoContainer = ({ name, userPhoto, backgroundColor }: UserPhotoContainerProps): JSX.Element => {
    const uploadRef = useRef<HTMLInputElement>(null);
    const [userPhotoState, setUserPhotoState] = useState<string | null>(userPhoto);
    const [uploadUserPhotoMutation, { loading: isLoading }] = useMutation<UploadUserPhotoResult>(UPLOAD_USER_PHOTO);
    const { addNotification } = useNotification();

    const uploadUserPhoto = async (file: File) => {
        uploadUserPhotoMutation({
            variables: {
                image: file,
            },
        }).then(({ errors, data }) => {
            if (errors?.length) {
                errors.forEach((error) => {
                    const errorCode = extractErrorCode(error) as ErrorBackendMessage;
                    addNotification(errorMessageMapping(errorCode), NOTIFICATION_TYPE.ERROR);
                });
            } else {
                data && setUserPhotoState(data.result.avatar);
            }
        });
    };

    const handleUploadPhoto = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (event.target.files?.length) {
            const file: File = event.target.files[0];
            await uploadUserPhoto(file);
        }
    };

    const handleUploadClick = (): void => {
        uploadRef.current?.click();
    };

    return (
        <View marginBottom={'size-400'}>
            <input
                type={'file'}
                ref={uploadRef}
                onChange={handleUploadPhoto}
                accept={mediaExtensionHandler(VALID_IMAGE_TYPES)}
                hidden
            />
            {userPhotoState ? (
                <UserPhoto userPhoto={userPhotoState} handleUploadClick={handleUploadClick} isLoading={isLoading} />
            ) : (
                <UserPhotoPlaceholder
                    name={name}
                    handleUploadClick={handleUploadClick}
                    backgroundColor={backgroundColor}
                />
            )}
        </View>
    );
};
