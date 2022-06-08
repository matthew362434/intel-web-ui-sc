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
import { Heading, Link } from '@adobe/react-spectrum';
import CloudErrorIcon from '@spectrum-icons/workflow/CloudError';

import { ErrorLayout } from '../error-layout';
import classes from '../error-layout/error-layout.module.scss';

export const ErrorScreen = ({ errorDescription }: { errorDescription: string }): JSX.Element => {
    const handleOnPress = (): void => {
        // hard refresh
        window.location.href = window.location.href;
    };

    return (
        <ErrorLayout>
            <CloudErrorIcon size='XXL' />
            <Heading UNSAFE_className={classes.errorMessage}>
                An error occured...please try{' '}
                <Link variant='overBackground' onPress={handleOnPress}>
                    refreshing
                </Link>{' '}
                the page
            </Heading>
            <Heading id='error-description' UNSAFE_className={classes.errorMessage}>
                Error: {errorDescription}
            </Heading>
        </ErrorLayout>
    );
};
