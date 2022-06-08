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

import { Image, Text, Heading, View } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';

import '@spectrum-css/card/dist/index-vars.css';
import classes from './card.module.scss';

interface CardProps {
    imgSrc: string;
    alt: string;
    onPress: () => void;
    isSelected: boolean;
    id: string;
    description?: string;
    title?: string;
    isDisabled?: boolean;
}

export const Card = ({
    imgSrc,
    alt,
    onPress,
    isSelected,
    id,
    title = '',
    description = '',
    isDisabled = false,
}: CardProps): JSX.Element => {
    const { pressProps } = usePress({
        onPress,
    });

    return (
        <div
            {...pressProps}
            className={`${isSelected ? classes.selected : classes.card} ${isDisabled ? classes.disabled : ''}`}
            id={id}
            data-testid={id}
        >
            <div role='figure'>
                <div className={`spectrum-Card-coverPhoto ${classes.coverPhoto}`}>
                    <Image alt={alt} src={imgSrc} />
                </div>

                <View
                    isHidden={!title && !description}
                    UNSAFE_className={`spectrum-Card-body ${classes.cardBody}`}
                    backgroundColor={'gray-100'}
                >
                    <Heading marginTop={0} marginBottom={'size-50'}>
                        {title}
                    </Heading>

                    <Text marginY={'size-100'}>{description}</Text>
                </View>
            </div>
        </div>
    );
};
