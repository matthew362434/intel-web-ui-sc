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

import classes from '../../selectable-customized-tabs/selectable-customized-tabs.module.scss';

interface CPStaticItemProps {
    content: string | number;
    id: string;
    shouldShowHPO: boolean;
}

export const CPStaticItem = ({ content, id, shouldShowHPO }: CPStaticItemProps): JSX.Element => {
    return (
        <Flex alignItems={'center'} gap={'size-100'}>
            <Text id={id}>{content}</Text>
            {shouldShowHPO && (
                <div>
                    <Text id={id} UNSAFE_className={classes.hpoOn}>
                        HPO
                    </Text>
                </div>
            )}
        </Flex>
    );
};
