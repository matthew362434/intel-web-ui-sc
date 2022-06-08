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
import { ReactNode } from 'react';

import { View } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';

import { idMatchingFormat } from '../../../../../../test-utils';
import classes from './selectable-card.module.scss';

interface SelectableCardProps {
    headerContent: ReactNode;
    descriptionContent: ReactNode;
    text: string;
    isSelected: boolean;
    handleOnPress: () => void;
}

export const SelectableCard = ({
    headerContent,
    descriptionContent,
    handleOnPress,
    text,
    isSelected,
}: SelectableCardProps): JSX.Element => {
    const { pressProps } = usePress({
        onPress: () => {
            handleOnPress();
        },
    });

    return (
        <div
            {...pressProps}
            id={`${idMatchingFormat(text)}-id`}
            data-testid={`${idMatchingFormat(text)}-id`}
            className={[classes.selectableCard, isSelected ? classes.selectableCardSelected : ''].join(' ')}
        >
            <View
                backgroundColor={'gray-200'}
                padding={'size-250'}
                borderTopWidth={'thin'}
                borderTopEndRadius={'regular'}
                borderTopStartRadius={'regular'}
                borderTopColor={'gray-200'}
            >
                {headerContent}
            </View>
            <View
                backgroundColor={'gray-100'}
                paddingX={'size-250'}
                paddingY={'size-225'}
                borderBottomWidth={'thin'}
                borderBottomEndRadius={'regular'}
                borderBottomStartRadius={'regular'}
                borderBottomColor={'gray-100'}
                height={'size-1000'}
            >
                {descriptionContent}
            </View>
        </div>
    );
};
