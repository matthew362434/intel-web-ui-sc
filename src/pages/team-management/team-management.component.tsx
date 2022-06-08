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

import { useCallback, useState } from 'react';

import { Button, Flex, View } from '@adobe/react-spectrum';
import { SortDirection } from 'react-virtualized';

import { Loading, NotFound, Sorting, ListSearchField, PageLayout } from '../../shared/components';
import { AddMemberPopup } from './add-member-popup';
import { InviteUser } from './invite-user';
import { useTeamManagement } from './team-management-provider.component';
import { defaultSortingState, Roles, UserProps, UsersTable } from './users-table';
import { filter, noSort, sortAsc, sortDesc } from './users-table/reducer';

export const TeamManagement = (): JSX.Element => {
    const { activeUser, filterUsersData, usersData, usersDispatch, isLoading } = useTeamManagement();
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [sortingState, setSortingState] = useState<Sorting>(defaultSortingState);

    const sort = ({ sortBy, sortDirection }: Sorting): void => {
        if (sortingState.sortDirection === SortDirection.DESC && sortingState.sortBy === sortBy) {
            sortBy = undefined;
            sortDirection = undefined;

            usersDispatch(noSort());
        } else if (sortDirection === SortDirection.ASC) {
            const castedSortBy = sortBy as keyof UserProps;

            usersDispatch(sortAsc(castedSortBy));
        } else {
            const castedSortBy = sortBy as keyof UserProps;

            usersDispatch(sortDesc(castedSortBy));
        }
        setSortingState({ sortBy, sortDirection });
    };

    const setFilteredList = useCallback(
        (users: UserProps[]) => {
            usersDispatch(filter(users));
        },
        [usersDispatch]
    );

    return (
        <PageLayout
            breadcrumbs={[{ id: 'team-id', breadcrumb: 'Team' }]}
            header={
                !isLoading && activeUser?.role === Roles.ADMIN ? (
                    <Flex alignItems={'center'} gap={'size-150'}>
                        <Button variant='primary' onPress={() => setAddOpen(true)} id='add-member-button-id'>
                            Add member
                        </Button>
                        <InviteUser sorting={{ ...sortingState, sort }} />
                    </Flex>
                ) : (
                    <></>
                )
            }
        >
            <>
                <View position={'relative'} height={'100%'}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <Flex
                                justifyContent='end'
                                alignItems='center'
                                marginBottom={filterUsersData.length ? '' : 'size-200'}
                            >
                                <ListSearchField
                                    list={usersData}
                                    attribute='fullName'
                                    placeholder='Search by full name'
                                    setFilteredList={setFilteredList}
                                />
                            </Flex>
                            {filterUsersData.length ? (
                                <UsersTable
                                    user={activeUser}
                                    usersData={filterUsersData}
                                    sorting={{ ...sortingState, sort }}
                                />
                            ) : (
                                <NotFound />
                            )}
                        </>
                    )}
                </View>
                <AddMemberPopup addOpen={addOpen} setAddOpen={setAddOpen} sorting={{ ...sortingState, sort }} />
            </>
        </PageLayout>
    );
};

export default TeamManagement;
