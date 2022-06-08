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

import { useLocation } from 'react-router-dom';

import { ApplicationServicesProvider } from './application-services-provider.component';

interface RouteBasedApplicationServiceProviderProps {
    children: ReactNode;
}

const TEST_PROJECT_ID = 'test-project';

// We use this component so that the inmemory services are used when REACT_APP_USE_API_SERVICES is false,
// or when the user visits /projects/test-project/
export const RouteBasedApplicationServiceProvider = ({
    children,
}: RouteBasedApplicationServiceProviderProps): JSX.Element => {
    const { pathname } = useLocation();
    const re = new RegExp(`/projects/${TEST_PROJECT_ID}.*`);
    const inMemory =
        process.env.REACT_APP_USE_API_SERVICES === 'false' ||
        process.env.REACT_APP_VALIDATION_COMPONENT_TESTS === 'true' ||
        re.test(pathname);

    return <ApplicationServicesProvider useInMemoryEnvironment={inMemory}>{children}</ApplicationServicesProvider>;
};
