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

import { initialConfig } from '../../../shared/components/header/settings/use-settings.hook';
import { getMockedLabel, getMockedProject, labels as mockedLabels } from '../../../test-utils/mocked-items-factory';
import { ExportDatasetStatusDTO, ExportStatusStateDTO } from '../../configurable-parameters/dtos';
import { CreateProjectProps, DOMAIN, ProjectIdentifier, ProjectProps, Settings, TaskMetadata } from '../../projects';
import { DatasetIdentifier, ExportDatasetIdentifier, ExportDatasetStatusIdentifier } from '../dataset.interface';
import { ProjectStatus } from '../project-status.interface';
import { ProjectService } from './project-service.interface';

/* eslint-disable @typescript-eslint/no-unused-vars */

const inMemoryDatasets = [
    {
        id: 'in-memory-dataset',
        name: 'In memory dataset',
    },
];
export const createInMemoryProjectService = (): ProjectService => {
    const editProject = async (projectIdentifier: ProjectIdentifier, project: ProjectProps): Promise<ProjectProps> => {
        return project;
    };

    const createProject = async (
        _workspaceId: string,
        name: string,
        domains: DOMAIN[],
        _tasksLabels: TaskMetadata[]
    ): Promise<CreateProjectProps> => {
        return getMockedProject({
            id: '1',
            name,
            domains,
            creationDate: new Date(),
            labels: [],
            thumbnail: '',
            tasks: [],
            score: 0,
        });
    };

    const deleteProject = async (_projectIdentifier: ProjectIdentifier): Promise<string> => {
        return 'success';
    };

    const getProjects = async (_workspaceId: string): Promise<ProjectProps[]> => [
        getMockedProject({
            id: 'test-project1',
            name: 'Test project 1',
            creationDate: new Date('2021-07-08'),
            domains: [DOMAIN.DETECTION],
            labels: [
                getMockedLabel({ id: 'test', name: 'test' }),
                getMockedLabel({ id: 'empty', name: 'Empty Detection task label', isExclusive: true }),
            ],
            thumbnail: 'v2/test-project1/thumbnail',
            score: 0.6,
            tasks: [],
            datasets: inMemoryDatasets,
        }),
        getMockedProject({
            id: 'animal-project',
            name: 'Animal project',
            creationDate: new Date('2020-12-10'),
            domains: [DOMAIN.DETECTION],
            labels: [
                getMockedLabel({ id: 'dog', name: 'dog', color: '#aadd55' }),
                getMockedLabel({ id: 'cat', name: 'cat', color: '#3399ff' }),
            ],
            thumbnail: 'v2/animal-project/thumbnail',
            score: 0.75,
            tasks: [],
            datasets: inMemoryDatasets,
        }),
        getMockedProject({
            id: 'test-project2',
            name: 'Test project 2',
            creationDate: new Date('2021-07-09'),
            domains: [DOMAIN.SEGMENTATION],
            labels: [
                getMockedLabel({ id: 'test_label', name: 'test_label', color: '#00bbff' }),
                getMockedLabel({ id: 'test_label2', name: 'test_label2', color: '#dddd00' }),
                getMockedLabel({ id: 'test_label3', name: 'test_label3', color: '#ffccdd' }),
                getMockedLabel({
                    id: 'empty',
                    name: 'Empty Segmentation task label',
                    color: '#dd0000',
                    isExclusive: true,
                }),
            ],
            thumbnail: 'v2/test-project2/thumbnail',
            score: 0.76,
            tasks: [],
            datasets: inMemoryDatasets,
        }),
        getMockedProject({
            id: 'test-project3',
            name: 'Test project 3',
            creationDate: new Date('2021-05-10'),
            domains: [DOMAIN.CLASSIFICATION],
            labels: [
                getMockedLabel({ id: 'test_label', name: 'test_label', color: '#bbddbb' }),
                getMockedLabel({ id: 'test_label2', name: 'test_label2', color: '#00aa00' }),
                getMockedLabel({ id: 'test_label3', name: 'test_label3', color: '#ffffdd' }),
                getMockedLabel({
                    id: 'empty',
                    name: 'Empty Classification task label',
                    color: '#00ddff',
                    isExclusive: true,
                }),
            ],
            thumbnail: 'v2/test-project3/thumbnail',
            score: 86,
            tasks: [],
            datasets: inMemoryDatasets,
        }),
    ];

    const getProject = async (projectIdentifier: ProjectIdentifier): Promise<ProjectProps> => {
        if (projectIdentifier.projectId === 'project-task-chain-id') {
            const [detectionLabel, ...classificationlabels] = mockedLabels;
            return getMockedProject({
                id: projectIdentifier.projectId,
                name: 'In memory detection',
                domains: [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION],
                labels: mockedLabels,
                creationDate: new Date(),
                thumbnail: '',
                score: 0.768,
                tasks: [
                    {
                        id: '1',
                        labels: [detectionLabel],
                        domain: DOMAIN.DETECTION,
                        title: 'Detection task',
                    },
                    {
                        id: '1',
                        labels: classificationlabels,
                        domain: DOMAIN.CLASSIFICATION,
                        title: 'Classification task',
                    },
                ],
                datasets: inMemoryDatasets,
            });
        }
        return getMockedProject({
            id: projectIdentifier.projectId,
            name: 'In memory detection',
            domains: [DOMAIN.SEGMENTATION],
            labels: mockedLabels,
            creationDate: new Date(),
            thumbnail: '',
            score: 0.768,
            tasks: [
                {
                    id: '1',
                    labels: mockedLabels,
                    domain: DOMAIN.SEGMENTATION,
                    title: 'Segmentation task',
                },
            ],
            datasets: inMemoryDatasets,
        });
    };

    const getProjectSettings = async (_projectId: string): Promise<Settings> => {
        return {
            settings: JSON.stringify(initialConfig),
        };
    };

    const saveProjectSettings = async (_projectId: string, _settings: Settings): Promise<void> => {
        return;
    };

    const getProjectStatus = async ({ projectId }: ProjectIdentifier): Promise<ProjectStatus> => {
        switch (projectId) {
            case 'animal-project':
                return {
                    score: 34,
                    isTraining: true,
                    trainingDetails: {
                        message: 'torch_segmentation - Training',
                        progress: '4%',
                        timeRemaining: '01:09',
                    },
                    tasks: [],
                };
            case 'test-project1':
                return {
                    score: 0,
                    isTraining: true,
                    trainingDetails: {
                        message: 'Detection - Training',
                        progress: '64%',
                        timeRemaining: '01:00:06',
                    },
                    tasks: [],
                };

            case 'test-project2':
                return {
                    score: 95,
                    isTraining: false,
                    tasks: [],
                };
            default:
                return {
                    score: 2,
                    isTraining: true,
                    trainingDetails: {
                        message: 'Detection - Training',
                        progress: '7%',
                        timeRemaining: '01:00:06',
                    },
                    tasks: [],
                };
        }
    };

    const deleteAllMedia = async (_datasetIdentifier: DatasetIdentifier): Promise<string> => {
        return 'success';
    };

    const prepareExportDataset = async (
        _datasetIdentifier: ExportDatasetIdentifier
    ): Promise<{ exportDatasetId: string }> => {
        return {
            exportDatasetId: '123123',
        };
    };

    const exportDatasetStatus = async (
        _datasetIdentifier: ExportDatasetStatusIdentifier
    ): Promise<ExportDatasetStatusDTO> => {
        return {
            message: 'test',
            progress: -1,
            state: ExportStatusStateDTO.DONE,
            download_url: 'test_url',
        };
    };

    return {
        getProjects,
        getProject,
        getProjectSettings,
        saveProjectSettings,
        editProject,
        createProject,
        deleteProject,
        getProjectStatus,
        deleteAllMedia,
        prepareExportDataset,
        exportDatasetStatus,
    };
};
