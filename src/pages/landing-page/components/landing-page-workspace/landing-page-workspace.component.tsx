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

import { Button, Flex, Heading, Tooltip, TooltipTrigger, View } from '@adobe/react-spectrum';

import { ProjectProps } from '../../../../core/projects';
import { ListSearchField } from '../../../../shared/components';
import { NewProjectDialog, NewProjectDialogProvider } from '../../../create-project';
import { NoProjectArea, ProjectsList, ProjectSorting, useProjectsList } from './components';
import {
    DatasetImportDialog,
    DatasetImportItemDeletionDialog,
    DatasetImportListItem,
} from './components/dataset-import/components';
import { useDatasetImport } from './components/dataset-import/dataset-import.provider.component';
import { ProjectListItemSkeletonLoader } from './components/projects-list/components/project-list-item-skeleton-loader.component';

interface LandingWorkspaceProps {
    title: string;
}

export const LandingWorkspace = ({ title }: LandingWorkspaceProps): JSX.Element => {
    const { projects, isLoading } = useProjectsList();
    const { uploads: getUploads, setModalOpened } = useDatasetImport();
    const [filteredProjects, setFilteredProjects] = useState<ProjectProps[]>(projects || []);

    const projectActions = (
        <Flex marginY='auto' direction='row' height='100%' gap='size-150'>
            <ListSearchField<ProjectProps, 'name'>
                list={projects}
                setFilteredList={setFilteredProjects}
                attribute='name'
                placeholder='Search by name'
            />
            <ProjectSorting projects={filteredProjects} setSortedProjects={setFilteredProjects} />
            <TooltipTrigger>
                <Button variant='primary' onPress={() => setModalOpened(true)}>
                    Import
                </Button>
                <Tooltip>I want to import an already annotated dataset</Tooltip>
            </TooltipTrigger>
            <NewProjectDialogProvider>
                <NewProjectDialog buttonText={'Create new project'} />
            </NewProjectDialogProvider>
        </Flex>
    );

    const loadedContent =
        projects === undefined ? (
            <></>
        ) : projects.length > 0 ? (
            <ProjectsList projects={filteredProjects} />
        ) : (
            <NoProjectArea />
        );

    return (
        <>
            <Flex direction='row' justifyContent='space-between' marginTop='size-200'>
                <Heading level={3} id='workspace-title'>
                    {title}
                </Heading>
                {!projects?.length && (
                    <TooltipTrigger>
                        <Button variant='primary' onPress={() => setModalOpened(true)}>
                            Import
                        </Button>
                        <Tooltip>I want to import an already annotated dataset</Tooltip>
                    </TooltipTrigger>
                )}
                {projects && projects.length > 0 ? projectActions : <></>}
            </Flex>
            <View
                flex={1}
                minHeight={0}
                position={'relative'}
                UNSAFE_style={{ overflowY: 'auto' }}
                marginBottom={'size-400'}
            >
                {!isLoading &&
                    Object.keys(getUploads).map((uploadId: string) => (
                        <DatasetImportListItem key={uploadId} uploadId={uploadId} />
                    ))}

                {isLoading ? <ProjectListItemSkeletonLoader itemCount={3} /> : loadedContent}

                <DatasetImportDialog />
                <DatasetImportItemDeletionDialog />
            </View>
        </>
    );
};
