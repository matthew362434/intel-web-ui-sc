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

import { DocumentNode } from '@apollo/client';

import { CREATE_USER } from '../pages/team-management/add-member-popup/add-member.gql';
import { GET_USERS, UserDTO } from '../pages/team-management/users-table';
import { EDIT_USER, GET_USER } from '../shared/users.gql';
import { gqlUsers } from './fake-users-data';

type UserInputType = Partial<UserDTO>;

interface MockQueryRequest {
    query: DocumentNode;
}

interface MockMutationRequest extends MockQueryRequest {
    variables: {
        userInput: UserInputType;
    };
}

interface MockGql<T> {
    request: T;
    result: {
        data: {
            result: UserInputType | UserInputType[] | undefined;
        };
    };
}

export const EDIT_USER_MOCK = (userInput: UserInputType): MockGql<MockMutationRequest> => ({
    request: {
        query: EDIT_USER,
        variables: {
            userInput,
        },
    },
    result: {
        data: {
            result: { ...gqlUsers[0] },
        },
    },
});

export const CREATE_USER_MOCK = (userInput: UserInputType): MockGql<MockMutationRequest> => ({
    request: {
        query: CREATE_USER,
        variables: { userInput },
    },
    result: {
        data: {
            result: { ...gqlUsers[0] },
        },
    },
});

export const GET_USER_MOCK: MockGql<MockQueryRequest> = {
    request: {
        query: GET_USER,
    },
    result: {
        data: {
            result: { ...gqlUsers[0] },
        },
    },
};

export const GET_USERS_MOCK: MockGql<MockQueryRequest> = {
    request: {
        query: GET_USERS,
    },
    result: {
        data: {
            result: { ...gqlUsers },
        },
    },
};

export const GET_NO_USER_MOCK: MockGql<MockQueryRequest> = {
    request: {
        query: GET_USER,
    },
    result: {
        data: {
            result: undefined,
        },
    },
};

export const GET_NO_USERS_MOCK: MockGql<MockQueryRequest> = {
    request: {
        query: GET_USERS,
    },
    result: {
        data: {
            result: [],
        },
    },
};
