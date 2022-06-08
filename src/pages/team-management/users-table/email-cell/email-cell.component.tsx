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

import { Flex } from '@adobe/react-spectrum';

import { UserPhoto } from '../../../profile-page/user-photo-container/user-photo';
import { UserPhotoPlaceholder } from '../../../profile-page/user-photo-container/user-photo-placeholder';
import { UserProps } from '../users-table.interface';
import classes from './email-cell.module.scss';

/* any type due to cellData in react virtualized */

/* eslint-disable  @typescript-eslint/no-explicit-any */
interface EmailCellProps {
    cellData: string;
    dataKey: string;
    rowData: UserProps;
}

export const EmailCell = ({ cellData, dataKey, rowData }: EmailCellProps): JSX.Element => {
    const { id, userPhoto, backgroundColor } = rowData;

    return (
        <Flex alignItems='center' UNSAFE_className={classes.emailCell} gap='size-115' id={`${id}-${dataKey}`}>
            {userPhoto ? (
                <UserPhoto userPhoto={userPhoto} handleUploadClick={null} width={'size-300'} height={'size-300'} />
            ) : (
                backgroundColor && (
                    <UserPhotoPlaceholder
                        backgroundColor={backgroundColor}
                        name={cellData}
                        handleUploadClick={null}
                        width={'size-300'}
                        height={'size-300'}
                    />
                )
            )}

            <span title={cellData} className={[classes.emailCellTitle, 'textOverflow'].join(' ')}>
                {cellData}
            </span>
        </Flex>
    );
};
