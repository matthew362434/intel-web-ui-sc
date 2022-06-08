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

import { Well } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';

import classes from './custom-well.module.scss';

interface CustomWellProps {
    id: string;
    children: JSX.Element;
    isSelected?: boolean;
    onPress?: () => void;
    isSelectable?: boolean;
    height?: Responsive<DimensionValue>;
    margin?: Responsive<DimensionValue>;
    position?: Responsive<'fixed' | 'static' | 'relative' | 'absolute' | 'sticky'>;
    className?: string;
}

export const CustomWell = ({
    children,
    position = 'static',
    isSelected = false,
    onPress = () => {
        /*not implemented*/
    },
    isSelectable = true,
    className,
    ...props
}: CustomWellProps): JSX.Element => {
    const { pressProps } = usePress({
        onPress: () => onPress(),
    });

    return (
        <div {...pressProps}>
            <Well
                position={position}
                UNSAFE_className={`${
                    isSelected ? classes.selected : isSelectable ? classes.selectableWell : classes.basicWell
                } ${className}`}
                {...props}
            >
                {children}
            </Well>
        </div>
    );
};
