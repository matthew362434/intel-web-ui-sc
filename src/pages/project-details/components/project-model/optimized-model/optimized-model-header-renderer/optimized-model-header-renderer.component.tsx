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

import { Flex, Text } from '@adobe/react-spectrum';
import { TableHeaderProps } from 'react-virtualized';

import { OpenVinoIcon } from '../../../../../../assets/images';
import classes from './optimized-model-header-renderer.module.scss';

export const OptimizedModelHeaderRenderer = ({ label }: TableHeaderProps): JSX.Element => {
    return (
        <Flex direction={'column'}>
            <Text UNSAFE_className='ReactVirtualized__Table__headerTruncatedText'>{label}</Text>
            <svg viewBox={'0 0 68 38'} role={'img'} className={classes.openVinoIcon}>
                <OpenVinoIcon id={'open-vino-icon-id'} />
            </svg>
        </Flex>
    );
};
