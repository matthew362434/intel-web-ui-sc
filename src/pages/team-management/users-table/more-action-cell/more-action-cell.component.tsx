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

import { Dispatch, SetStateAction } from 'react';

import { useMutation } from '@apollo/client';

import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { MenuTriggerPopup } from '../../../../shared/components';
import { signOutAction } from '../../../profile-page/utils';
import { useTeamManagement } from '../../team-management-provider.component';
import { deleteUser } from '../reducer';
import { DELETE_USER } from '../users-table.gql';

interface MoreActionCellProps {
    userId: string;
    userEmail: string;
    isOwnAccountDeletion: boolean;
    setDeleteUserDialog: Dispatch<SetStateAction<boolean>>;
}

export const MoreActionCell = ({
    userId,
    userEmail,
    setDeleteUserDialog,
    isOwnAccountDeletion,
}: MoreActionCellProps): JSX.Element => {
    const [deleteUserMutation] = useMutation(DELETE_USER, {
        variables: { id: userId },
    });
    const { addNotification } = useNotification();
    const { usersDispatch } = useTeamManagement();

    const DELETE = 'Delete';
    const items = [DELETE];
    const question = `Are you sure you want to delete ${userEmail}?`;

    const deleteUserAction = (): void => {
        deleteUserMutation().then(({ errors }) => {
            if (errors?.length) {
                const [errorMsg] = errors[0].message.split('::');
                addNotification(errorMsg, NOTIFICATION_TYPE.ERROR);
            } else {
                usersDispatch(deleteUser(userId));
                if (isOwnAccountDeletion) {
                    signOutAction();
                }
            }
        });
    };

    return (
        <MenuTriggerPopup
            menuTriggerId={`user-action-menu-${userId}`}
            items={items}
            question={question}
            onPrimaryAction={deleteUserAction}
            setDeleteUserDialog={setDeleteUserDialog}
        />
    );
};
