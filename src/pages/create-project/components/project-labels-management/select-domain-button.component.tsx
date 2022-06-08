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

import { ActionButton, Flex, Text, Image } from '@adobe/react-spectrum';
import { SpectrumActionButtonProps } from '@react-types/button';

import classes from './select-domain-button.module.scss';

interface SelectDomainButtonProps extends SpectrumActionButtonProps {
    imgSrc: string;
    alt: string;
    id: string;
    text: string;
    select: () => void;
    isSelected: boolean;
    isDisabled?: boolean;
}

export const SelectDomainButton = ({
    imgSrc,
    alt,
    text,
    select,
    isSelected,
    isDisabled = false,
    id,
    ...props
}: SelectDomainButtonProps): JSX.Element => {
    return (
        <Flex direction={'column'} alignItems={'center'}>
            <ActionButton
                id={id}
                onPress={select}
                width={'size-1250'}
                height={'size-1200'}
                UNSAFE_className={isSelected ? classes.selected : ''}
                isDisabled={isDisabled}
                aria-label={`Button domain${isSelected ? ' selected' : ''}`}
                {...props}
            >
                <Image src={imgSrc} alt={alt} />
            </ActionButton>
            <Text>{text}</Text>
        </Flex>
    );
};
