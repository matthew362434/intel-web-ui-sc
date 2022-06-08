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
import { ActionButton } from '@adobe/react-spectrum';
import { SpectrumActionButtonProps } from '@react-types/button';

import classes from './label-shortcut-button.module.scss';

export const LabelShortcutButton = ({
    children,
    id,
    onPress,
    UNSAFE_className,
    ...rest
}: SpectrumActionButtonProps): JSX.Element => {
    return (
        <ActionButton
            id={id}
            onPress={onPress}
            UNSAFE_className={`${classes.labelButton} ${UNSAFE_className}`}
            {...rest}
        >
            {children}
        </ActionButton>
    );
};
