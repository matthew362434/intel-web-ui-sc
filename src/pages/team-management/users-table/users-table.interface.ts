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

import { SortingParams } from '../../../shared/components';

export enum Roles {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum RegistrationStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export interface UserDTO {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    registered: boolean;
    roles: Roles[];
}

export interface UserQueryDTO {
    result: UserDTO;
}

export interface UsersDTO {
    result: UserDTO[];
}

export interface UserProps {
    id: string;
    email: string;
    fullName: string;
    registrationStatus: RegistrationStatus;
    role: string;
    userPhoto: string | null;
    backgroundColor: string | null;
}

export interface UserState {
    naturalOrderData: UserProps[];
    usersData: UserProps[];
    filterUsersData: UserProps[];
}

export interface UsersTableProps {
    user: UserProps | undefined;
    usersData: UserProps[];
    sorting: SortingParams;
}
