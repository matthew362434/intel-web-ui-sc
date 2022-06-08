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

import { Dispatch, Key, SetStateAction } from 'react';

import { ActionButton, Button, Item, Menu, MenuTrigger as MenuTriggerSpectrum, Text } from '@adobe/react-spectrum';

import { MoreMenu } from '../../../assets/icons';
import { idMatchingFormat } from '../../../test-utils';

interface MenuTriggerProps {
    id: string;
    title?: string;
    quiet?: boolean;
    regularButton?: boolean;
    items: string[];
    onAction: (key: Key) => void;
    disabledKeys?: Iterable<Key>;
    icon?: JSX.Element;
    variant?: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative';
    onOpenChange?: Dispatch<SetStateAction<boolean>>;
}

export const MenuTrigger = ({
    id,
    title = 'More',
    quiet = false,
    regularButton = false,
    items,
    onAction,
    disabledKeys,
    icon,
    variant = 'secondary',
    onOpenChange,
}: MenuTriggerProps): JSX.Element => {
    return (
        <MenuTriggerSpectrum onOpenChange={onOpenChange}>
            {regularButton ? (
                <Button
                    variant={variant}
                    isQuiet={quiet || !!icon}
                    id={id}
                    aria-label='open menu'
                    UNSAFE_style={{ pointerEvents: 'all' }}
                >
                    {icon ?? <>{quiet ? <MoreMenu /> : <Text>{title}</Text>}</>}
                </Button>
            ) : (
                <ActionButton
                    isQuiet={quiet || !!icon}
                    id={id}
                    aria-label='open menu'
                    UNSAFE_style={{ pointerEvents: 'auto' }}
                >
                    {icon ?? <>{quiet ? <MoreMenu /> : <Text>{title}</Text>}</>}
                </ActionButton>
            )}
            <Menu
                onAction={onAction}
                disabledKeys={disabledKeys}
                aria-label='Menu'
                id={'menu-id'}
                UNSAFE_style={{ pointerEvents: 'auto' }}
            >
                {items.map((item: string) => (
                    <Item key={item.toLocaleLowerCase()} aria-label={item.toLocaleLowerCase()} textValue={item}>
                        <Text id={`${idMatchingFormat(item.toLowerCase())}-id`}>{item}</Text>
                    </Item>
                ))}
            </Menu>
        </MenuTriggerSpectrum>
    );
};
