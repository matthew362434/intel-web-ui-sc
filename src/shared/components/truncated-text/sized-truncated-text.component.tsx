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
import { TruncatedText, TruncatedTextProps } from './truncated-text.component';

interface SizedTruncatedTextProps extends Omit<TruncatedTextProps, 'prefix'> {
    size: 'M' | 'L';
    suffix?: JSX.Element;
    prefix?: JSX.Element;
}

export const SizedTruncatedText = ({
    size,
    children,
    suffix = <></>,
    prefix = <></>,
    ...props
}: SizedTruncatedTextProps): JSX.Element => {
    const width = size === 'M' ? 200 : 400;

    return (
        <>
            {prefix}
            <TruncatedText width={width} {...props}>
                {children}
            </TruncatedText>
            {suffix}
        </>
    );
};
