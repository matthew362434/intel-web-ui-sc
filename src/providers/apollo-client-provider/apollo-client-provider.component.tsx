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

import { ReactNode } from 'react';

import { ApolloClient, ApolloLink, ApolloProvider, DefaultOptions, from, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

import { NOTIFICATION_TYPE, useNotification } from '../../notification';

interface ApolloClientProps {
    children: ReactNode;
}

export const NETWORK_ERROR_MESSAGE = 'Network error: Please check your connection and try again';

export const ApolloClientProvider = ({ children }: ApolloClientProps): JSX.Element => {
    const { addNotification } = useNotification();

    const httpLink: ApolloLink = createUploadLink({
        uri: process.env.REACT_APP_BACKEND_GTW_URL || `${window.location.origin}/api/graphql/`,
        credentials: 'include',
    });

    const authLink = setContext((_, { headers }) => ({
        headers: {
            ...headers,
            'Access-Control-Allow-Origin': '*',
        },
    }));

    const errorLink: ApolloLink = onError(({ networkError }) => {
        if (networkError) {
            addNotification(NETWORK_ERROR_MESSAGE, NOTIFICATION_TYPE.ERROR);
        }
    });

    const link = from([authLink, errorLink, httpLink]);
    const cache = new InMemoryCache();

    const defaultOptions: DefaultOptions = {
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
        mutate: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    };

    const apolloClient = new ApolloClient({ cache, link, credentials: 'include', defaultOptions });

    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
