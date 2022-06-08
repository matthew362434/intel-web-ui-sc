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

import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer, useState } from 'react';

import { useQuery } from '@apollo/client';

import { NOTIFICATION_TYPE, useNotification } from '../../notification';
import { NETWORK_ERROR_MESSAGE } from '../../providers';
import { MissingProviderError } from '../../shared/missing-provider-error';
import { GET_USER } from '../../shared/users.gql';
import { GET_USERS, RegistrationStatus, Roles, UserDTO, UserProps, UserQueryDTO, UsersDTO } from './users-table';
import { Actions, setData, UsersReducer } from './users-table/reducer';
import { randomizeColor, resetColors } from './utils';

interface TeamManagementContextProps {
    isLoading: boolean;
    activeUser: UserProps | undefined;
    usersData: UserProps[];
    filterUsersData: UserProps[];
    usersDispatch: Dispatch<Actions>;
}

interface TeamManagementProviderProps {
    children: ReactNode;
}

const TeamManagementContext = createContext<TeamManagementContextProps | undefined>(undefined);

export const TeamManagementProvider = ({ children }: TeamManagementProviderProps): JSX.Element => {
    const activeUserQuery = useQuery<UserQueryDTO>(GET_USER);
    const { data: usersDataGql, loading: loadingUsersData, error: errorUsersData } = useQuery<UsersDTO>(GET_USERS);

    const [{ filterUsersData, usersData }, usersDispatch] = useReducer(UsersReducer, {
        usersData: [],
        naturalOrderData: [],
        filterUsersData: [],
    });

    const [activeUser, setActiveUser] = useState<UserProps | undefined>(undefined);

    const { addNotification } = useNotification();

    useEffect(() => {
        if (usersDataGql && activeUserQuery.data) {
            const { id, name, email, roles, avatar } = activeUserQuery.data.result;

            resetColors();

            const convertedUsersData: UserProps[] = usersDataGql.result.reduce((prev: UserProps[], curr: UserDTO) => {
                if (curr.email !== email) {
                    let backgroundColor: string | null = null;

                    if (!curr.avatar) {
                        backgroundColor = randomizeColor();
                    }

                    return [
                        {
                            id: curr.id,
                            fullName: curr.name,
                            email: curr.email,
                            role: curr.roles.length ? curr.roles[0] : Roles.USER,
                            registrationStatus: curr.registered
                                ? RegistrationStatus.COMPLETED
                                : RegistrationStatus.PENDING,
                            userPhoto: curr.avatar,
                            backgroundColor,
                        },
                        ...prev,
                    ];
                }
                return prev;
            }, []);

            const convertedActiveUser: UserProps = {
                id,
                fullName: name,
                email: email,
                role: roles.length ? activeUserQuery.data.result.roles[0] : Roles.USER,
                registrationStatus: activeUserQuery.data.result.registered
                    ? RegistrationStatus.COMPLETED
                    : RegistrationStatus.PENDING,
                userPhoto: avatar,
                backgroundColor: !avatar ? 'var(--blue-steel)' : null,
            };

            setActiveUser(convertedActiveUser);
            usersDispatch(setData([convertedActiveUser, ...convertedUsersData]));
        }
    }, [usersDataGql, activeUserQuery.data, usersDispatch]);

    if (activeUserQuery.error || errorUsersData) {
        const isNetworkError = activeUserQuery.error?.networkError;
        const errorMessage = isNetworkError
            ? NETWORK_ERROR_MESSAGE
            : errorUsersData?.message ?? 'Unknown error: Please try refreshing the page';

        addNotification(errorMessage, NOTIFICATION_TYPE.ERROR);

        return <></>;
    }

    const value = {
        activeUser,
        usersData,
        filterUsersData,
        usersDispatch,
        isLoading: activeUserQuery.loading || loadingUsersData,
    };

    return <TeamManagementContext.Provider value={value}>{children}</TeamManagementContext.Provider>;
};

export const useTeamManagement = (): TeamManagementContextProps => {
    const context = useContext(TeamManagementContext);

    if (context === undefined) {
        throw new MissingProviderError('useTeamManagement', 'TeamManagementProvider');
    }

    return context;
};
