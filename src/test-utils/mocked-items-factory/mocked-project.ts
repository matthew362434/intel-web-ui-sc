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
import { DOMAIN, isAnomalyDomain, ProjectProps, Performance } from '../../core/projects';
import { ProjectContextProps } from '../../pages/project-details/providers';
import { getMockedTask } from './mocked-tasks';

const mockedProject: ProjectProps = {
    id: '111111',
    name: 'Test project 1',
    thumbnail: 'test/thumbnail',
    labels: [],
    creationDate: new Date(),
    domains: [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION],
    score: 0.8,
    tasks: [
        getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
        getMockedTask({ id: 'classification', domain: DOMAIN.CLASSIFICATION }),
    ],
    performance: {
        type: 'default_performance',
        score: 0.8,
    },
    datasets: [{ id: 'mocked-dataset', name: 'Mocked dataset' }],
};

const getMockedPerformance = (customProjectValues: Partial<ProjectProps>): Performance => {
    const score = customProjectValues.score ?? 0.8;
    const tasks = customProjectValues.tasks ?? [];

    if (customProjectValues.performance) {
        return customProjectValues.performance;
    }

    if (tasks.some(({ domain }) => isAnomalyDomain(domain))) {
        return { type: 'anomaly_performance', localScore: score, globalScore: score };
    }
    return { type: 'default_performance', score };
};

export const getMockedProject = (customProjectValues: Partial<ProjectProps>): ProjectProps => {
    // As domains should be inferred from a project's task we give priority to the tasks's domains,
    // this should, in the future, allow us to remove the domains property from ProjectProps
    const domains =
        customProjectValues.tasks?.map(({ domain }) => domain) ?? customProjectValues.domains ?? mockedProject.domains;

    const labels =
        customProjectValues.tasks?.flatMap((task) => task.labels) ?? customProjectValues.labels ?? mockedProject.labels;

    const performance = getMockedPerformance(customProjectValues);

    return {
        ...mockedProject,
        ...customProjectValues,
        performance,
        domains,
        labels,
    };
};

export const mockedProjectContextProps = (customValues: Partial<ProjectContextProps>): ProjectContextProps => ({
    isTaskChainProject: false,
    projectIdentifier: { workspaceId: '321', projectId: '123' },
    project: getMockedProject({ domains: [] }),
    isSingleDomainProject: () => true,
    score: 20,
    error: null,
    projectStatus: undefined,
    isTaskTraining: () => false,
    ...customValues,
});
