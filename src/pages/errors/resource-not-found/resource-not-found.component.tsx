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
import { Content, Button } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { EmptyModels } from '../../../assets/images';
import { ErrorLayout } from '../error-layout';
import classes from '../error-layout/error-layout.module.scss';

export const Notfound = (): JSX.Element => {
    const handleOnPress = (): void => {
        // hard refresh
        window.location.href = window.location.href;
    };

    return (
        <ErrorLayout>
            <EmptyModels aria-label={'Resource unavailable'} />
            <Heading data-testid={'server-connection-lost-id'}>Resource not found</Heading>
            <Content UNSAFE_className={classes.errorMessage}>Please try refreshing the page</Content>
            <Button variant={'cta'} marginTop={'size-200'} onPress={handleOnPress}>
                Refresh
            </Button>
        </ErrorLayout>
    );
};
