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

import { sortAscending, sortDescending } from '../../../../shared/utils';
import { UserProps, UserState } from '../users-table.interface';
import { Actions, ActionsTypes } from './action';

const reducer = (state: UserState, action: Actions): UserState => {
    const { usersData, naturalOrderData } = state;
    switch (action.type) {
        case ActionsTypes.SORT_ASC:
            const attributeAsc = action.payload as keyof UserProps;
            const sortedAscUser = sortAscending(usersData, attributeAsc, true);
            return { ...state, usersData: sortedAscUser };
        case ActionsTypes.SORT_DESC:
            const attributeDesc = action.payload as keyof UserProps;
            const sortedDescUser = sortDescending(usersData, attributeDesc, true);
            return { ...state, usersData: sortedDescUser };
        case ActionsTypes.NO_SORT:
            return { ...state, usersData: [...naturalOrderData] };
        case ActionsTypes.SET:
            const { payload } = action;
            return { naturalOrderData: [...payload], usersData: [...payload], filterUsersData: [...payload] };
        case ActionsTypes.FILTER:
            return { ...state, filterUsersData: action.payload };
        case ActionsTypes.DELETE:
            const newNaturalOrderData = naturalOrderData.filter(({ id }: UserProps) => id !== action.payload);
            const newUsersData = usersData.filter(({ id }: UserProps) => id !== action.payload);
            return { ...state, naturalOrderData: newNaturalOrderData, usersData: newUsersData };
        case ActionsTypes.EDIT:
            const { id, fullName } = action.payload;
            const editedNaturalOrderData = naturalOrderData.map((user: UserProps) =>
                user.id === id ? { ...user, fullName } : user
            );
            return { ...state, naturalOrderData: editedNaturalOrderData, usersData: editedNaturalOrderData };
        case ActionsTypes.CREATE:
            const updatedData = [...naturalOrderData, action.payload];
            return { ...state, naturalOrderData: [...updatedData], usersData: [...updatedData] };
        default:
            return state;
    }
};

export default reducer;
