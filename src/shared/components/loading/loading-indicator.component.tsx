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
import { SpectrumProgressCircleProps } from '@react-types/progress';

export const LoadingIndicator = (props: SpectrumProgressCircleProps): JSX.Element => {
    const { size = 'L', ...rest } = props;

    return (
        <Flex alignItems={'center'} justifyContent={'center'} height='100%'>
            <ProgressCircle aria-label='Loading...' isIndeterminate size={size} {...rest} />
        </Flex>
    );
};
