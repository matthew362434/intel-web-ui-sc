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
import { ComponentProps } from 'react';

import { ActionButton, Flex, Image, View } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';

import classes from './user-photo.module.scss';

interface UserPhotoProps {
    userPhoto: string;
    handleUploadClick: (() => void) | null;
    isLoading?: boolean;
    width?: ComponentProps<typeof View>['width'];
    height?: ComponentProps<typeof View>['height'];
}

export const UserPhoto = ({
    userPhoto,
    handleUploadClick,
    isLoading,
    width = 'size-1600',
    height = 'size-1600',
}: UserPhotoProps): JSX.Element => {
    const { pressProps } = usePress({ onPress: handleUploadClick ?? undefined });
    return (
        <View width={width}>
            <View height={height}>
                <div {...pressProps} style={{ height: '100%' }}>
                    <Image
                        src={`data:image/png;base64,${userPhoto}`}
                        alt={'user-photo'}
                        width={'100%'}
                        height={'100%'}
                        objectFit={'cover'}
                        UNSAFE_className={classes.userPhoto}
                    />
                </div>
            </View>
            {handleUploadClick && (
                <Flex marginTop={'size-200'} justifyContent={'space-between'} alignItems={'center'}>
                    <ActionButton
                        onPress={handleUploadClick}
                        UNSAFE_className={classes.userPhotoChangeBtn}
                        isQuiet
                        isDisabled={isLoading}
                    >
                        Change
                    </ActionButton>
                </Flex>
            )}
        </View>
    );
};
