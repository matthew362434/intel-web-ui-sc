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

import { Flex } from '@adobe/react-spectrum';

import { Loading } from '../../../assets/icons';
import sharedClasses from '../../shared.module.scss';

interface ProgressLoadingProps {
    id: string;
}

export const ProgressLoading = ({ id }: ProgressLoadingProps): JSX.Element => {
    return (
        <Flex UNSAFE_className={sharedClasses.rotate} id={id}>
            <Loading height={'100%'} />
        </Flex>
    );
};
