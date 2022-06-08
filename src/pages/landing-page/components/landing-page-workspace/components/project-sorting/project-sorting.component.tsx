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

import { Item, Menu, MenuTrigger, Text } from '@adobe/react-spectrum';
import { ActionButton } from '@react-spectrum/button';

import { SortUpDown } from '../../../../../../assets/icons';
import { ProjectProps } from '../../../../../../core/projects';
import { sortAscending, sortDescending } from '../../../../../../shared/utils';

interface MenuAction {
    key: string;
    ariaLabel: string;
    text: string;
    action: () => void;
}

interface ProjectSortingProps {
    projects: ProjectProps[];
    setSortedProjects: (projects: ProjectProps[]) => void;
}

export const ProjectSorting = ({ projects, setSortedProjects }: ProjectSortingProps): JSX.Element => {
    const doAction = (key: Key) => {
        const selectedAction = sortingActions.find((action: MenuAction) => action.key === key);
        selectedAction && selectedAction.action();
    };
    const sortingActions: MenuAction[] = [
        {
            key: 'AtoZ',
            ariaLabel: 'sort from A to Z',
            text: 'A to Z',
            action: () => {
                const sortedProjects = sortAscending(projects, 'name', true);
                setSortedProjects(sortedProjects);
            },
        },
        {
            key: 'ZtoA',
            ariaLabel: 'sort from Z to A',
            text: 'Z to A',
            action: () => {
                const sortedProjects = sortDescending(projects, 'name', true);
                setSortedProjects(sortedProjects);
            },
        },
        {
            key: 'NewestToOldest',
            ariaLabel: 'sort from newest to oldest',
            text: 'Newest to Oldest',
            action: () => {
                const sortedProjects = sortDescending(projects, 'creationDate');
                setSortedProjects(sortedProjects);
            },
        },
        {
            key: 'OldestToNewest',
            ariaLabel: 'sort from oldest to newest',
            text: 'Oldest to Newest',
            action: () => {
                const sortedProjects = sortAscending(projects, 'creationDate');
                setSortedProjects(sortedProjects);
            },
        },
    ];

    return (
        <MenuTrigger>
            <ActionButton key={'sort'} aria-label={'Sort'} isQuiet={true}>
                <SortUpDown />
            </ActionButton>

            <Menu onAction={doAction}>
                {sortingActions.map((action: MenuAction) => (
                    <Item key={action.key} aria-label={action.ariaLabel} textValue={action.text}>
                        <Text>{action.text}</Text>
                    </Item>
                ))}
            </Menu>
        </MenuTrigger>
    );
};
