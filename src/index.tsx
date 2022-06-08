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

import { StrictMode } from 'react';

import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router } from 'react-router-dom';

import { NotificationProvider } from './notification';
import { ErrorBoundary } from './pages/errors/error-boundary.component';
import { ApolloClientProvider } from './providers';
import { RouteBasedApplicationServiceProvider } from './providers/application-provider/route-based-application-service-provider.component';
import reportWebVitals from './report-web-vitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider } from './theme/theme-provider.component';

function importBuildTarget(): Promise<typeof import('./app.component') | typeof import('./sign-up/app.component')> {
    if (process.env.REACT_APP_BUILD_TARGET === 'register') {
        return import('./sign-up/app.component');
    }

    return import('./app.component');
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchIntervalInBackground: false,
            refetchOnWindowFocus: false,
        },
    },
});

importBuildTarget().then(({ default: App }) =>
    // eslint-disable-next-line react/no-render-return-value
    ReactDOM.render(
        <ErrorBoundary>
            <StrictMode>
                <Router
                    getUserConfirmation={(_message, callback) => {
                        // Always bypass the browser prompt
                        callback(true);
                    }}
                >
                    <ThemeProvider>
                        <RouteBasedApplicationServiceProvider>
                            <NotificationProvider>
                                <ApolloClientProvider>
                                    <QueryClientProvider client={queryClient}>
                                        <App />
                                    </QueryClientProvider>
                                </ApolloClientProvider>
                            </NotificationProvider>
                        </RouteBasedApplicationServiceProvider>
                    </ThemeProvider>
                </Router>
            </StrictMode>
        </ErrorBoundary>,
        document.getElementById('root')
    )
);

serviceWorkerRegistration.register();

reportWebVitals();
