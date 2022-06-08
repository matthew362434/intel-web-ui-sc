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

import { ReactElement, ReactNode } from 'react';

import { defaultTheme, Provider as ThemeProvider } from '@adobe/react-spectrum';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter as Router } from 'react-router-dom';

import { NotificationProvider } from '../notification';
import {
    ApplicationServicesContextProps,
    ApplicationServicesProvider,
} from '../providers/application-provider/application-services-provider.component';

interface RequiredProvidersProps extends Partial<ApplicationServicesContextProps> {
    children?: ReactNode;
}

export const RequiredProviders = ({ children, ...services }: RequiredProvidersProps): JSX.Element => {
    const queryClient = new QueryClient();

    return (
        <Router>
            <NotificationProvider>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider theme={defaultTheme}>
                        <ApplicationServicesProvider useInMemoryEnvironment {...services}>
                            {children}
                        </ApplicationServicesProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </NotificationProvider>
        </Router>
    );
};

interface CustomRenderOptions extends RenderOptions {
    services?: Partial<ApplicationServicesContextProps>;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions): RenderResult => {
    const services = options?.services;

    const Wrapper = (props: unknown) => {
        return <RequiredProviders {...props} {...services} />;
    };

    return render(ui, { wrapper: Wrapper, ...options });
};

export { customRender as providersRender };
