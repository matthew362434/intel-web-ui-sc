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
import { View, Text, useNumberFormatter } from '@adobe/react-spectrum';
import { ViewProps } from '@react-types/view';

import classes from './number-badge.module.scss';

interface NumberBadgeProps {
    number: number | undefined;
    id: string;
    selected?: boolean;
    reversedColor?: boolean;
    isError?: boolean;
}

interface CircleBadgeProps extends ViewProps {
    children: JSX.Element;
}

const CircleBadge = ({ children, ...viewProps }: CircleBadgeProps): JSX.Element => {
    return (
        <View {...viewProps} borderRadius={'large'} width={'size-200'} height={'size-200'}>
            {children}
        </View>
    );
};

const getNumberClasses = (number: number): string => {
    const size = number >= 100 ? 'large' : number >= 10 ? 'medium' : '';

    if (size) {
        return `${classes.number} ${classes[size]}`;
    }

    return classes.number;
};

export const NumberBadge = ({
    number,
    selected = false,
    reversedColor = false,
    id,
    isError = false,
}: NumberBadgeProps): JSX.Element => {
    const formatter = useNumberFormatter({
        notation: 'compact',
    });

    return !!number ? (
        <CircleBadge
            id={`number-badge-${id}`}
            UNSAFE_className={`${classes.circle} ${
                selected ? (reversedColor ? classes.reversedColor : classes.selected) : classes.basic
            }`}
        >
            <Text data-testid={`number-badge-${id}-value`} UNSAFE_className={getNumberClasses(number)}>
                {formatter.format(number)}
            </Text>
        </CircleBadge>
    ) : isError ? (
        <CircleBadge id={`question-mark-badge-${id}`} backgroundColor='notice'>
            <Text>?</Text>
        </CircleBadge>
    ) : (
        <></>
    );
};
