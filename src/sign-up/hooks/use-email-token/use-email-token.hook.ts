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
import { useEffect, useState } from 'react';

import jwt_decode from 'jwt-decode';
import { useLocation } from 'react-router-dom';

import { isJwtPayloadWithMail } from './utils';

interface UseEmailToken {
    email: string;
    token: string;
}

export const useEmailToken = (): UseEmailToken => {
    const { search } = useLocation();

    const [email, setEmail] = useState<string>('');
    const [token, setToken] = useState<string>('');

    useEffect(() => {
        // set email and token that comes from the invitation link
        if (search.includes('token')) {
            const queryToken = search.split('=')[1];
            const decodedToken = jwt_decode(queryToken);

            if (isJwtPayloadWithMail(decodedToken)) {
                setEmail(decodedToken.mail);
                setToken(queryToken);
            }
        } else {
            throw new Error('Token is required for further actions.');
        }
    }, [search]);

    return {
        email,
        token,
    };
};
