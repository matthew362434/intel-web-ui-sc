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
import { ComponentProps } from 'react';

import { Button, Flex, Text } from '@adobe/react-spectrum';

import { LoadingIndicator } from '../loading';

interface ButtonWithLoadingProps extends Partial<ComponentProps<typeof Button>> {
    isLoading: boolean;
}

export const ButtonWithLoading = (props: ButtonWithLoadingProps): JSX.Element => {
    const { variant = 'cta', isLoading, children, ...rest } = props;

    return (
        <Button variant={variant} {...rest}>
            <Flex alignItems={'center'} gap={'size-65'}>
                {isLoading ? <LoadingIndicator id={'loading-indicator-id'} size={'S'} /> : <></>}
                <Text>{children}</Text>
            </Flex>
        </Button>
    );
};
