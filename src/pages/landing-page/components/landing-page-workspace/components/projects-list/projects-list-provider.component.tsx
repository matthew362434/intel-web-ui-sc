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

import { createContext, ReactNode, useContext } from 'react';

import { useErrorHandler } from 'react-error-boundary';

import { ProjectProps } from '../../../../../../core/projects';
import { useProjects } from '../../../../../../core/projects/hooks';
import { useApplicationContext } from '../../../../../../providers';
import { MissingProviderError } from '../../../../../../shared/missing-provider-error';
import { sortDescending } from '../../../../../../shared/utils';

export interface ProjectsListContextProps {
    projects: ProjectProps[] | undefined;
    isLoading: boolean;
    reloadProjects: () => void;
}

interface ProjectsListProviderProps {
    children: ReactNode;
}

export const ProjectsListContext = createContext<ProjectsListContextProps | undefined>(undefined);

export const ProjectsListProvider = ({ children }: ProjectsListProviderProps): JSX.Element => {
    const { workspaceId, error: WorkspacesError } = useApplicationContext();

    const { data: projects, isLoading, error: ProjectError, refetch: reloadProjects } = useProjects(workspaceId);
    const sortedProjects = projects && sortDescending(projects, 'creationDate');

    const error = WorkspacesError || ProjectError;

    useErrorHandler(error);

    return (
        <ProjectsListContext.Provider
            value={{
                projects: sortedProjects,
                isLoading,
                reloadProjects,
            }}
        >
            {children}
        </ProjectsListContext.Provider>
    );
};

export const useProjectsList = (): ProjectsListContextProps => {
    const context = useContext(ProjectsListContext);

    if (context === undefined) {
        throw new MissingProviderError('useProjectsListContext', 'ProjectsListProvider');
    }

    return context;
};
