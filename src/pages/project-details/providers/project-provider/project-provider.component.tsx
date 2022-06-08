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

import { createContext, ReactNode, useCallback, useContext } from 'react';

import isFunction from 'lodash/isFunction';

import { DOMAIN, ProjectProps, ProjectIdentifier, Task } from '../../../../core/projects';
import { useProject as useProjectQuery, useProjectStatus } from '../../../../core/projects/hooks';
import { ProjectStatus } from '../../../../core/projects/project-status.interface';
import { Loading } from '../../../../shared/components';
import { MissingProviderError } from '../../../../shared/missing-provider-error';

export interface ProjectContextProps {
    projectIdentifier: ProjectIdentifier;
    project: ProjectProps;
    isTaskChainProject: boolean;
    isTaskTraining: (task: Task | null) => boolean;
    isSingleDomainProject: (domain: DOMAIN | ((domain: DOMAIN) => boolean)) => boolean;
    score: number | undefined;
    error?: unknown;
    projectStatus: ProjectStatus | undefined;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

interface ProjectProviderProps {
    children: ReactNode;
    projectIdentifier: ProjectIdentifier;
}

export const ProjectProvider = ({ projectIdentifier, children }: ProjectProviderProps): JSX.Element => {
    const { data: projectStatus, error: ProjectStatusError } = useProjectStatus(projectIdentifier);

    const { workspaceId, projectId } = projectIdentifier;

    const { data: project, error: ProjectError } = useProjectQuery(workspaceId, projectId);

    const isTaskChainProject = Boolean(project && project.tasks.length > 1);

    const isSingleDomainProject = useCallback(
        (domain: DOMAIN | ((domain: DOMAIN) => boolean)) => {
            if (project === undefined || isTaskChainProject) {
                return false;
            }

            const domains = project.tasks.map((task) => task.domain);

            if (isFunction(domain)) {
                return domain(domains[0]);
            }

            return domains[0] === domain;
        },
        [isTaskChainProject, project]
    );

    const isTaskTraining = useCallback(
        (task: Task | null) => {
            if (!task) {
                return !!projectStatus?.isTraining;
            }

            const projectTasks = projectStatus?.tasks || [];

            return !!projectTasks.find(({ id }) => id === task.id)?.is_training;
        },
        [projectStatus?.isTraining, projectStatus?.tasks]
    );

    if (project === undefined) {
        return <Loading />;
    }

    const value: ProjectContextProps = {
        projectIdentifier,
        project,
        isTaskChainProject,
        isSingleDomainProject,
        isTaskTraining,
        error: ProjectStatusError || ProjectError,
        score: Math.round(project.score * 100),
        projectStatus,
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextProps => {
    const context = useContext(ProjectContext);

    if (context === undefined) {
        throw new MissingProviderError('useProject', 'ProjectProvider');
    }

    return context;
};
