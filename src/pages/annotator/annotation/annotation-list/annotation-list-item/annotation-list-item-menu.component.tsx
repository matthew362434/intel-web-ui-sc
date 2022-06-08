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

import { Key } from 'react';

import { ActionButton, Item, Menu, MenuTrigger, Text } from '@adobe/react-spectrum';

import { Delete, Lock, Unlock, Visible, Invisible, MoreMenu, Edit } from '../../../../../assets/icons';
import { MenuItemImage } from '../../../../../shared/components/menu-item-image/menu-item-image.component';
import classes from './annotation-list-item.module.scss';

enum MENU_ACTIONS {
    HIDE = 'hide',
    SHOW = 'show',
    REMOVE = 'remove',
    LOCK = 'lock',
    UNLOCK = 'unlock',
    EDIT_LABELS = 'edit_labels',
}

interface AnnotationListItemMenuProps {
    id: string;
    isHidden: boolean;
    isLocked: boolean;
    hide: () => void;
    show: () => void;
    remove: () => void;
    toggleLock: () => void;
    editLabels: () => void;
}

export const AnnotationListItemMenu = ({
    id,
    isHidden,
    isLocked,
    hide,
    show,
    toggleLock,
    remove,
    editLabels,
}: AnnotationListItemMenuProps): JSX.Element => {
    const onAction = (key: Key) => {
        switch (key) {
            case MENU_ACTIONS.HIDE: {
                hide();
                break;
            }
            case MENU_ACTIONS.SHOW: {
                show();
                break;
            }
            case MENU_ACTIONS.REMOVE: {
                remove();
                break;
            }
            case MENU_ACTIONS.LOCK: {
                toggleLock();
                break;
            }
            case MENU_ACTIONS.UNLOCK: {
                toggleLock();
                break;
            }
            case MENU_ACTIONS.EDIT_LABELS: {
                editLabels();
                break;
            }
        }
    };

    const disabledKeys = isLocked ? [MENU_ACTIONS.REMOVE] : [];

    return (
        <MenuTrigger>
            <ActionButton isQuiet id={`annotation-list-item-${id}-menu`} aria-label='Show actions'>
                <MoreMenu className={isHidden ? classes.hiddenAnnotation : ''} />
            </ActionButton>
            <Menu onAction={onAction} disabledKeys={disabledKeys}>
                {isHidden ? (
                    <Item key={MENU_ACTIONS.SHOW} textValue='Show'>
                        <MenuItemImage>
                            <Visible width={'100%'} height={'100%'} />
                        </MenuItemImage>
                        <Text>Show</Text>
                    </Item>
                ) : (
                    <Item key={MENU_ACTIONS.HIDE} textValue='Hide'>
                        <MenuItemImage>
                            <Invisible width={'100%'} height={'100%'} />
                        </MenuItemImage>
                        <Text>Hide</Text>
                    </Item>
                )}
                {isLocked ? (
                    <Item key={MENU_ACTIONS.UNLOCK} textValue='Unlock'>
                        <MenuItemImage>
                            <Unlock width={'100%'} height={'100%'} />
                        </MenuItemImage>
                        <Text>Unlock</Text>
                    </Item>
                ) : (
                    <Item key={MENU_ACTIONS.LOCK} textValue='Lock'>
                        <MenuItemImage>
                            <Lock width={'100%'} height={'100%'} />
                        </MenuItemImage>
                        <Text>Lock</Text>
                    </Item>
                )}
                <Item key={MENU_ACTIONS.REMOVE} textValue='Remove'>
                    <MenuItemImage>
                        <Delete width={'100%'} height={'100%'} />
                    </MenuItemImage>
                    <Text>Remove</Text>
                </Item>
                <Item key={MENU_ACTIONS.EDIT_LABELS} textValue='Edit labels'>
                    <MenuItemImage>
                        <Edit width={'100%'} height={'100%'} />
                    </MenuItemImage>
                    <Text>Edit labels</Text>
                </Item>
            </Menu>
        </MenuTrigger>
    );
};
