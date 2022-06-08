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

import { useState } from 'react';

import { ActionButton, Flex, Text, Tooltip, TooltipTrigger, useNumberFormatter } from '@adobe/react-spectrum';

import { Image, Model, Deployments, Test } from '../../../../assets/icons';
import { ProjectProps } from '../../../../core/projects';
import { API_URLS, PATHS } from '../../../../core/services';
import { ProjectNameDomain, SidebarMenu } from '../../../../shared/components';
import { MenuItemImage } from '../../../../shared/components/menu-item-image/menu-item-image.component';
import { MenuOptionTextAndIcon } from '../../../../shared/components/menu-option.interface';
import { idMatchingFormat } from '../../../../test-utils';
import { DatasetChapters } from '../project-dataset';
import classes from './project-sidebar.module.scss';

interface PerformanceProps {
    project: ProjectProps;
}
const Performance = ({ project }: PerformanceProps) => {
    const performance = project.performance;
    const formatter = useNumberFormatter({
        style: 'percent',
        maximumFractionDigits: 0,
    });

    if (performance.type === 'default_performance') {
        const score = performance.score;
        return (
            <TooltipTrigger delay={0}>
                <ActionButton isQuiet aria-label='Zoom level' UNSAFE_className={classes.tooltipButton}>
                    <Text>Score: {formatter.format(score)}</Text>
                </ActionButton>
                <Tooltip>Latest model score</Tooltip>
            </TooltipTrigger>
        );
    }

    return (
        <Flex direction='column'>
            <TooltipTrigger delay={0}>
                <ActionButton isQuiet aria-label='Zoom level' UNSAFE_className={classes.tooltipButton}>
                    <Text>Image Score: {formatter.format(performance.globalScore)}</Text>
                </ActionButton>
                <Tooltip>Latest model score</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger delay={0}>
                <ActionButton isQuiet aria-label='Zoom level' UNSAFE_className={classes.tooltipButton}>
                    <Text>
                        Object score:{' '}
                        {performance.localScore !== null ? formatter.format(performance.localScore) : 'N/A'}
                    </Text>
                </ActionButton>
                <Tooltip>Latest model score</Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};

interface ProjectSidebarProps {
    project: ProjectProps;
    status: string | undefined;
    isTaskChainProject: boolean;
}

export const ProjectSidebar = ({ project, status, isTaskChainProject }: ProjectSidebarProps): JSX.Element => {
    const { name, thumbnail } = project;
    const NO_IMAGE_ICON = '/icons/image-icon.svg';

    const [thumbNailSource, setThumbnailSource] = useState<string>(API_URLS.THUMBNAIL(thumbnail));
    const [errored, setErrored] = useState<boolean>(false);

    const onError = () => {
        if (!errored) {
            setThumbnailSource(NO_IMAGE_ICON);
            setErrored(true);
        }
    };

    const iconOptions: MenuOptionTextAndIcon[] = [
        {
            id: 'dataset',
            name: 'Dataset',
            ariaLabel: 'dataset',
            icon: (
                <MenuItemImage>
                    <Image width={'100%'} height={'100%'} />
                </MenuItemImage>
            ),
            url: PATHS.getProjectDatasetUrl(project.id, DatasetChapters.DEFAULT),
        },
        {
            id: 'models',
            name: 'Models',
            ariaLabel: 'models',
            icon: (
                <MenuItemImage>
                    <Model width={'100%'} height={'100%'} />
                </MenuItemImage>
            ),
            url: isTaskChainProject
                ? PATHS.getProjectModelsUrl(project.id, 'all')
                : PATHS.getProjectModelsUrl(project.id),
        },
        {
            id: 'tests',
            name: 'Tests',
            ariaLabel: 'tests',
            icon: (
                <MenuItemImage>
                    <Test width={'100%'} height={'100%'} />
                </MenuItemImage>
            ),
            url: PATHS.getProjectTestsUrl(project.id),
        },
        {
            id: 'deployments',
            name: 'Deployments',
            ariaLabel: 'deployments',
            icon: (
                <MenuItemImage>
                    <Deployments width={'100%'} height={'100%'} />
                </MenuItemImage>
            ),
            url: PATHS.getProjectDeploymentsUrl(project.id),
        },
    ];

    return (
        <Flex height={'100%'} direction={'column'}>
            <Flex direction='column' margin={'size-400'} gap={'size-200'}>
                <ProjectNameDomain project={project} isEditableName />
                <Flex direction={'row'} gap={'size-100'}>
                    <img
                        width={48}
                        height={48}
                        src={thumbNailSource}
                        alt={name}
                        onError={onError}
                        id={`project-page-sidebar-image-${idMatchingFormat(name)}`}
                        className={errored ? classes.thumbnailPlaceholder : classes.thumbnail}
                    />
                    <Flex direction={'column'} justifyContent={'center'}>
                        <Text>Cost: Free</Text>
                        <Performance project={project} />
                    </Flex>
                </Flex>

                <Text id={`project-${project.id}-status-id`}>{status}</Text>
            </Flex>
            <Flex
                marginEnd={'size-300'}
                direction={'column'}
                justifyContent={'space-between'}
                height={'100%'}
                marginBottom={'size-300'}
            >
                <SidebarMenu options={[iconOptions]} lighter id={'project-steps'} />
            </Flex>
        </Flex>
    );
};

export default ProjectSidebar;
