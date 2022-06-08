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

import { UserDTO, UserProps } from '../pages/team-management/users-table';
import { RegistrationStatus } from '../pages/team-management/users-table/users-table.interface';

export const gqlUsers: UserDTO[] = [
    {
        id: 'test@email.com',
        email: 'test@email.com',
        name: 'test',
        roles: [],
        avatar: null,
        registered: true,
    },
    {
        id: 'test2@email.com',
        email: 'test2@email.com',
        name: 'test2',
        roles: [],
        avatar: null,
        registered: false,
    },
];

export const users: UserProps[] = [
    {
        id: 'test@email.com',
        email: 'test@email.com',
        fullName: 'test',
        role: '',
        registrationStatus: RegistrationStatus.COMPLETED,
        userPhoto: null,
        backgroundColor: '#ccc',
    },
    {
        id: 'test2@email.com',
        email: 'test2@email.com',
        fullName: 'test2',
        role: 'ADMIN',
        registrationStatus: RegistrationStatus.PENDING,
        userPhoto: null,
        backgroundColor: '#aaa',
    },
];
