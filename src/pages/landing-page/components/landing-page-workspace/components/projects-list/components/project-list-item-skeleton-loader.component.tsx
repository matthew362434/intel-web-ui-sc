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
import { Flex, View, Divider } from '@adobe/react-spectrum';

import classes from './skeleton-loader.module.scss';

export const ProjectListItemSkeletonLoader = ({ itemCount = 3 }: { itemCount: number }): JSX.Element => {
    return (
        <div data-testid='project-item-loader-list' role='progressbar'>
            {[...Array(itemCount)].map((_elem, index) => (
                <Flex
                    UNSAFE_className={classes.wrapper}
                    data-testid={`project-item-loader-${index}`}
                    key={`project-item-loader-${index}`}
                >
                    <View UNSAFE_className={classes.image}></View>
                    <View UNSAFE_className={classes.projectInfo} margin={'size-200'}>
                        <View UNSAFE_className={classes.projectName}></View>
                        <View UNSAFE_className={classes.date}></View>
                        <Divider
                            UNSAFE_className={classes.divider}
                            height={'size-10'}
                            marginTop='size-150'
                            marginBottom='size-150'
                        />
                        <View UNSAFE_className={classes.labels}></View>
                    </View>
                </Flex>
            ))}
        </div>
    );
};
