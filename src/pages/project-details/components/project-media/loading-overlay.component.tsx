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

import { Flex, ProgressCircle } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

interface LoadingOverlayProps {
    visible: boolean;
}

export const LoadingOverlay = ({ visible }: LoadingOverlayProps): JSX.Element => {
    return (
        <>
            {visible && (
                <View
                    zIndex={1}
                    position='absolute'
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    backgroundColor='gray-50'
                    UNSAFE_style={{ cursor: 'default' }}
                >
                    <Flex width='100%' height='100%' alignItems='center' justifyContent='center'>
                        <ProgressCircle size='L' isIndeterminate aria-label='Loading...' />
                    </Flex>
                </View>
            )}
        </>
    );
};
