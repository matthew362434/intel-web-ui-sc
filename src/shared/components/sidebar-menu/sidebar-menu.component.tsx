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
import { Key, useEffect, useState } from 'react';

import { Item, Menu, Text, Section } from '@adobe/react-spectrum';
import { useHistory, useLocation } from 'react-router-dom';

import { MenuOption } from '../menu-option.interface';
import classes from './sidebar-menu.module.scss';

interface SidebarMenuProps {
    options: MenuOption[][];
    disabledOptions?: Key[];
    lighter?: boolean;
    id: string;
}

export const SidebarMenu = ({ options, disabledOptions = [], lighter = false, id }: SidebarMenuProps): JSX.Element => {
    const history = useHistory();
    const location = useLocation();
    const [selectedOption, setSelectedOption] = useState<Set<string>>(new Set());

    useEffect(() => {
        const currentPath = location.pathname;
        const selected = options.flat().find((option: MenuOption) => {
            return 'url' in option ? option.url === currentPath : undefined;
        });

        selected && setSelectedOption(new Set<string>().add(selected.id));
    }, [location.pathname, options]);

    const selectMenuOption = (selection: Key, allOptions: MenuOption[]): void => {
        const selected = allOptions.find((option: MenuOption) => {
            return option.id === selection;
        });

        if (selected && 'url' in selected) {
            selected?.url && history.push(selected.url);
        }
    };

    return (
        <Menu
            marginTop={'size-900'}
            marginStart={'size-300'}
            width='size-2600'
            aria-label='Menu'
            disabledKeys={disabledOptions}
            selectionMode={'single'}
            selectedKeys={selectedOption}
            onAction={(selection) => selectMenuOption(selection, options.flat())}
            UNSAFE_className={lighter ? classes.menuLighter : classes.menu}
            id={`sidebar-menu-${id}`}
        >
            {options.map((section, index) => (
                <Section items={options.flat()} key={`section-${index}`}>
                    {section
                        .filter((option) => !option.isHidden)
                        .map((option) => (
                            <Item
                                key={option.id}
                                textValue={('name' in option && option.name) || 'empty'}
                                aria-label={option.ariaLabel}
                            >
                                {'icon' in option ? option.icon : <></>}
                                {'name' in option ? (
                                    <Text id={`sidebar-menu-${option.id}`} marginY={'auto'}>
                                        {option.name}
                                    </Text>
                                ) : (
                                    <></>
                                )}
                            </Item>
                        ))}
                </Section>
            ))}
        </Menu>
    );
};
