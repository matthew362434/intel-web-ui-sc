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

import { View, Flex, Text, ActionButton } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';

import classes from './user-photo-placeholder.module.scss';

interface UserPhotoPlaceholderProps {
    name: string;
    handleUploadClick: (() => void) | null;
    width?: ComponentProps<typeof View>['width'];
    height?: ComponentProps<typeof View>['height'];
    backgroundColor: string;
}

export const UserPhotoPlaceholder = ({
    name,
    handleUploadClick,
    backgroundColor,
    width = 'size-1600',
    height = 'size-1600',
}: UserPhotoPlaceholderProps): JSX.Element => {
    const { pressProps } = usePress({ onPress: handleUploadClick ?? undefined });
    return (
        <>
            <View
                height={height}
                width={width}
                UNSAFE_className={[
                    classes.userPhotoPlaceholder,
                    handleUploadClick ? classes.userPhotoUploadPlaceholder : '',
                ].join(' ')}
                UNSAFE_style={{ backgroundColor: backgroundColor }}
            >
                <div {...pressProps} style={{ height: '100%' }}>
                    <Flex height={'100%'} alignItems={'center'} justifyContent={'center'}>
                        <Text data-testid={'user-placeholder-letter-id'}>{name[0].toUpperCase()}</Text>
                    </Flex>
                </div>
            </View>
            {handleUploadClick && (
                <ActionButton
                    marginTop={'size-200'}
                    onPress={handleUploadClick}
                    UNSAFE_className={classes.userPhotoUploadBtn}
                    isQuiet
                >
                    Upload image
                </ActionButton>
            )}
        </>
    );
};
