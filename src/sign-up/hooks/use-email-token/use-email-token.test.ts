// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { renderHook } from '@testing-library/react-hooks';
import { useLocation } from 'react-router-dom';

import { useEmailToken } from './use-email-token.hook';

// token consists of an email (test@gmail.com) and exp time

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(() => ({
        search: 'token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJleHAiOjE2NDc0MzM4MDJ9.ZOLAB63iBkK04RAibctGCEFfmp7kXQp8vSM1yQuHH8g',
    })),
}));

describe('useEmailToken', () => {
    it('Should return en email with token', () => {
        const { result } = renderHook(() => useEmailToken());
        expect(result.current).toEqual({
            email: 'test@gmail.com',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJleHAiOjE2NDc0MzM4MDJ9.ZOLAB63iBkK04RAibctGCEFfmp7kXQp8vSM1yQuHH8g',
        });
    });

    it('Should throw an error when token is no present in the url', () => {
        jest.mocked(useLocation).mockImplementation(() => ({
            search: '',
            pathname: '',
            hash: '',
            state: '',
        }));
        const { result } = renderHook(() => useEmailToken());
        expect(result.error).toBeDefined();
    });
});
