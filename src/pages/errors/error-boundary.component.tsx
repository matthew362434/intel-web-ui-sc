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

/*
    Error boundaries on Sonoma Creek:
    
    1) Wrapping the whole <App />, for error that might happens anywhere (e.g. session expired)
    2) Wrapping <Workspace />, in case of /workspaces endpoint failing
    3) Wrapping <Annotator />, in case of any annotator related endpoint failing (e.g /annotations)

    - Besides runtime errors, we also want to catch 401's and 503's
    - We want to catch the error ASAP so we keep all the UI surrounding the component that caused the error
    to still be functional (e.g. 'Go back')

*/

import { FC } from 'react';

import { StatusCodes } from 'http-status-codes';
import { ErrorBoundary as Boundary, FallbackProps } from 'react-error-boundary';

import { ErrorScreen } from './general-error-screen/general-error-screen.component';
import { ServiceUnavailable } from './service-unavailable/service-unavailable.component';
import { UnauthenticatedUser } from './unauthenticated-user/unauthenticated-user.component';

const ErrorFallback = ({ error }: FallbackProps) => {
    const errorType = Number(error.message);

    switch (errorType) {
        case StatusCodes.SERVICE_UNAVAILABLE:
        case StatusCodes.TOO_MANY_REQUESTS:
            return <ServiceUnavailable />;
        case StatusCodes.UNAUTHORIZED:
            return <UnauthenticatedUser />;
        default:
            return <ErrorScreen errorDescription={error.message} />;
    }
};

export const ErrorBoundary: FC = ({ children }): JSX.Element => {
    return <Boundary FallbackComponent={ErrorFallback}>{children}</Boundary>;
};
