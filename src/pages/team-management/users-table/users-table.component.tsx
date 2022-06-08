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

import { useMemo, useState } from 'react';

import { RowMouseEventHandlerParams, TableCellProps } from 'react-virtualized';

import { ColumnProps, Table } from '../../../shared/components';
import { CasualCell } from '../../../shared/components/table/components';
import { EditMemberPopup } from './edit-member-popup';
import { EmailCell } from './email-cell';
import { MoreActionCell } from './more-action-cell';
import { RegistrationCell } from './registration-cell';
import { Roles, UserProps, UsersTableProps } from './users-table.interface';
import classes from './users-table.module.scss';

const MINIMUM_NUMBER_OF_EXISTING_ADMINS = 2;

export const UsersTable = ({ user, usersData, sorting }: UsersTableProps): JSX.Element => {
    const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
    const [deleteUserDialog, setDeleteUserDialog] = useState<boolean>(false);

    const EmailTableCell = useMemo(
        () =>
            ({ cellData, dataKey, rowData }: TableCellProps): JSX.Element => {
                return <EmailCell cellData={cellData} dataKey={dataKey} rowData={rowData} />;
            },
        []
    );

    const MoreActionTableCell = useMemo(
        () =>
            ({ rowData }: TableCellProps): JSX.Element => {
                const { id: currentId, email, role: currentRole } = rowData;
                const isOwnAccount = user?.id === currentId;
                const isAdmin = user?.role === Roles.ADMIN;
                const areAtLeastTwoAdmins =
                    usersData.filter(({ role }) => role === Roles.ADMIN).length >= MINIMUM_NUMBER_OF_EXISTING_ADMINS;

                return (currentRole === Roles.ADMIN && areAtLeastTwoAdmins) ||
                    (isAdmin && currentRole !== Roles.ADMIN) ||
                    (currentRole !== Roles.ADMIN && isOwnAccount) ? (
                    <MoreActionCell
                        setDeleteUserDialog={setDeleteUserDialog}
                        userId={currentId}
                        userEmail={email}
                        isOwnAccountDeletion={isOwnAccount}
                    />
                ) : (
                    <></>
                );
            },
        [user, usersData]
    );

    const columns: ColumnProps[] = useMemo(
        () => [
            {
                label: 'EMAIL ADDRESS',
                dataKey: 'email',
                width: 300,
                sortable: true,
                component: EmailTableCell,
            },
            {
                label: 'FULL NAME',
                dataKey: 'fullName',
                width: 250,
                sortable: true,
                component: CasualCell,
            },
            {
                label: 'ROLE',
                dataKey: 'role',
                width: 100,
                sortable: true,
                component: CasualCell,
            },
            {
                label: 'REGISTRATION',
                dataKey: 'registrationStatus',
                width: 250,
                sortable: true,
                component: RegistrationCell,
            },
            {
                label: '',
                dataKey: '',
                width: 50,
                sortable: false,
                className: classes.moreActionCell,
                component: MoreActionTableCell,
            },
        ],
        [EmailTableCell, MoreActionTableCell]
    );

    const handleOnRowClick = ({ rowData }: RowMouseEventHandlerParams): void => {
        setSelectedUser(rowData);
    };

    return (
        <>
            <Table
                data={usersData}
                columns={columns}
                height={'100%'}
                sorting={sorting}
                onRowClick={user?.role === Roles.ADMIN && !deleteUserDialog ? handleOnRowClick : undefined}
            />
            <EditMemberPopup setSelectedUser={setSelectedUser} user={selectedUser} sorting={sorting} />
        </>
    );
};
