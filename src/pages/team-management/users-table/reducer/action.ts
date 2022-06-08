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

import { UserProps } from '../users-table.interface';

export enum ActionsTypes {
    SORT_ASC = 'SORT_ASC',
    SORT_DESC = 'SORT_DESC',
    NO_SORT = 'NO_SORT',
    SET = 'SET',
    FILTER = 'FILTER',
    DELETE = 'DELETE',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
}

interface Action {
    type: ActionsTypes.NO_SORT;
}

interface ActionPayload<T, K> {
    type: K;
    payload: T;
}

interface EditUser {
    id: string;
    fullName: string;
}

export type ActionSortTypes = ActionsTypes.SORT_ASC | ActionsTypes.SORT_DESC;
type ActionSetFilter = ActionsTypes.SET | ActionsTypes.FILTER;

export type Actions =
    | Action
    | ActionPayload<UserProps[], ActionSetFilter>
    | ActionPayload<string, ActionSortTypes | ActionsTypes.DELETE>
    | ActionPayload<EditUser, ActionsTypes.EDIT>
    | ActionPayload<UserProps, ActionsTypes.CREATE>;

export const sortAsc = (key: string): ActionPayload<string, ActionSortTypes> => ({
    type: ActionsTypes.SORT_ASC,
    payload: key,
});

export const sortDesc = (key: string): ActionPayload<string, ActionSortTypes> => ({
    type: ActionsTypes.SORT_DESC,
    payload: key,
});

export const noSort = (): Action => ({
    type: ActionsTypes.NO_SORT,
});

export const setData = (payload: UserProps[]): ActionPayload<UserProps[], ActionsTypes.SET> => ({
    type: ActionsTypes.SET,
    payload,
});

export const filter = (payload: UserProps[]): ActionPayload<UserProps[], ActionsTypes.FILTER> => ({
    type: ActionsTypes.FILTER,
    payload,
});

export const deleteUser = (id: string): ActionPayload<string, ActionsTypes.DELETE> => ({
    type: ActionsTypes.DELETE,
    payload: id,
});

export const editUser = (payload: EditUser): ActionPayload<EditUser, ActionsTypes.EDIT> => ({
    type: ActionsTypes.EDIT,
    payload,
});

export const createUser = (payload: UserProps): ActionPayload<UserProps, ActionsTypes.CREATE> => ({
    type: ActionsTypes.CREATE,
    payload,
});
