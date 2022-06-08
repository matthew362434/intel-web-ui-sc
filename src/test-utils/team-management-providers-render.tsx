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

import { ReactElement } from 'react';

import { MockedProvider } from '@apollo/client/testing';
import { RenderResult } from '@testing-library/react';

import { TeamManagementProvider } from '../pages/team-management';
import { GET_NO_USERS_MOCK, GET_USER_MOCK, GET_USERS_MOCK, GET_NO_USER_MOCK } from './fake-gql-mocks';
import { providersRender } from './required-providers-render';

const customRender = (ui: ReactElement, emptyUsers = false): RenderResult => {
    const mocks = emptyUsers ? [GET_NO_USER_MOCK, GET_NO_USERS_MOCK] : [GET_USER_MOCK, GET_USERS_MOCK];
    const teamManagementWrapper = (
        <MockedProvider mocks={mocks}>
            <TeamManagementProvider>{ui}</TeamManagementProvider>
        </MockedProvider>
    );
    return providersRender(teamManagementWrapper);
};

export { customRender as teamProvider };
