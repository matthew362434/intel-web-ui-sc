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

import { useState } from 'react';

import { Flex, Link } from '@adobe/react-spectrum';
import { FlexStyleProps } from '@react-types/shared';

import { InfoTooltip } from '../../../../../../../shared/components';

interface LinkButtonProps extends FlexStyleProps {
    text: string;
    info?: string;
    children: JSX.Element;
}

export const LinkButton = ({ text, info, children, ...props }: LinkButtonProps): JSX.Element => {
    const [inEditMode, setEditMode] = useState<boolean>(false);

    return (
        <Flex alignItems={'center'} {...props}>
            {inEditMode ? (
                children
            ) : (
                <Link
                    variant={'primary'}
                    onPress={() => {
                        setEditMode(true);
                    }}
                    UNSAFE_style={{
                        color: 'var(--spectrum-global-color-gray-500)',
                        fontSize: '12px',
                        textDecoration: 'none',
                        minWidth: 'max-content',
                    }}
                >
                    {text}
                </Link>
            )}

            {info && <InfoTooltip tooltipText={info} />}
        </Flex>
    );
};
