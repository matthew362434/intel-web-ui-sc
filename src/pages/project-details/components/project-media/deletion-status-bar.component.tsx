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

import { Flex, ProgressCircle, Text } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';

interface DeletionStatusBarProps {
    visible: boolean;
    offset?: Responsive<DimensionValue>;
}

export const DeletionStatusBar = ({ visible, offset = 'size-100' }: DeletionStatusBarProps): JSX.Element => {
    return (
        <>
            {visible && (
                <View
                    position='absolute'
                    height='size-600'
                    width='50%'
                    minWidth={250}
                    zIndex={1}
                    left='50%'
                    bottom={offset}
                    backgroundColor='gray-400'
                    UNSAFE_style={{ transform: 'translateX(-50%)', cursor: 'default' }}
                >
                    <Flex width='100%' height='100%' gap='size-100' alignItems='center' marginX='size-150'>
                        <ProgressCircle size='S' isIndeterminate aria-label='Loading...' />
                        <Text>Media deletion in progress...</Text>
                    </Flex>
                </View>
            )}
        </>
    );
};
