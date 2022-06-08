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
import isEqual from 'lodash/isEqual';
import { rest } from 'msw';

import { GROUP_SEPARATOR } from '../../../pages/annotator/components/labels/utils/group-utils';
import { LabelsRelationType } from '../../../pages/create-project/components/select-project-template/utils';
import { getMockedLabel, getMockedProject } from '../../../test-utils/mocked-items-factory';
import { server } from '../../annotations/services/test-utils';
import { LABEL_BEHAVIOUR } from '../../labels';
import { API_URLS } from '../../services';
import { DOMAIN, EditProjectProps, ProjectCreation, ProjectIdentifier, ProjectProps } from '../project.interface';
import { createApiProjectService } from './api-project-service';
import {
    FLAT_LABELS,
    HIERARCHY_LABELS,
    PROJECT_ANOMALY_CLASSIFICATION,
    PROJECT_ANOMALY_DETECTION,
    PROJECT_ANOMALY_SEGMENTATION,
    PROJECT_CLASSIFICATION,
    PROJECT_DETECTION,
    PROJECT_DETECTION_CLASSIFICATION,
    PROJECT_DETECTION_ORIENTED,
    PROJECT_DETECTION_SEGMENTATION,
    PROJECT_RESPONSE,
    PROJECT_SEGMENTATION,
    PROJECT_SEGMENTATION_INSTANCE,
} from './test-utils';
import { getProjectEntity, getProjectStatusBody } from './utils';

function apiRequestUrl(url: string): string {
    const urlRecord = new URL(`http://localhost/api/${url}`);
    urlRecord.search = '';

    return urlRecord.href;
}

describe('API project service', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };
    const projectService = createApiProjectService();

    describe('Get project', () => {
        it('gets project details', async () => {
            const projectUrl = API_URLS.PROJECT(datasetIdentifier.workspaceId, datasetIdentifier.projectId);

            server.use(
                rest.get(`/api/${projectUrl}`, (req, res, ctx) => {
                    return res(ctx.json(PROJECT_RESPONSE()));
                })
            );

            const project = await projectService.getProject(datasetIdentifier);
            const expectedProject: ProjectProps = getMockedProject({
                id: '60b609e0d036ba4566726c7f',
                name: 'Card detection',
                score: 50,
                thumbnail: '/v2/projects/60b609e0d036ba4566726c7f/thumbnail',
                creationDate: new Date('2021-06-01T10:20:16.209Z'),
                domains: [DOMAIN.DETECTION],
                tasks: [
                    {
                        id: '60b609e0d036ba4566726c81',
                        labels: [
                            getMockedLabel({
                                color: '#fff5f7ff',
                                group: 'Label Group 1',
                                id: '60b609e0d036ba4566726c82',
                                name: 'card',
                                behaviour: LABEL_BEHAVIOUR.LOCAL,
                            }),
                        ],
                        domain: DOMAIN.DETECTION,
                        title: 'Detection',
                    },
                ],
                labels: [
                    getMockedLabel({
                        id: '60b609e0d036ba4566726c82',
                        name: 'card',
                        color: '#fff5f7ff',
                        group: 'Label Group 1',
                        behaviour: LABEL_BEHAVIOUR.LOCAL,
                    }),
                ],
                datasets: [{ id: 'default-dataset', name: 'Default dataset' }],
            });
            expect(project).toEqual(expectedProject);
        });
    });

    describe('Get project status', () => {
        const { workspaceId, projectId } = datasetIdentifier;
        const projectIdentifier: ProjectIdentifier = { workspaceId, projectId };
        const statusUrl = API_URLS.PROJECT_STATUS(workspaceId, projectId);

        it('gets project status - remaining time 189.18... return 03:09', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) =>
                    res(ctx.json(getProjectStatusBody(189.18368864059448)))
                )
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.timeRemaining).toBe('03:09');
        });

        it('gets project status - remaining time 634 returns 10:34', async () => {
            server.use(rest.get(apiRequestUrl(statusUrl), (req, res, ctx) => res(ctx.json(getProjectStatusBody(634)))));

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.timeRemaining).toBe('10:34');
        });

        it('gets project status - remaining time 12 returns 00:12', async () => {
            server.use(rest.get(apiRequestUrl(statusUrl), (req, res, ctx) => res(ctx.json(getProjectStatusBody(12)))));

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.timeRemaining).toBe('00:12');
        });

        it('gets project status - remaining time 6661 returns 01:51:01', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) => res(ctx.json(getProjectStatusBody(6661))))
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.timeRemaining).toBe('01:51:01');
        });

        it('gets project status - progress 90.123 returns 90%', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) =>
                    res(ctx.json(getProjectStatusBody(undefined, 90.123)))
                )
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.progress).toBe('90%');
        });

        it('gets project status - progress 99.876 returns 99%', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) =>
                    res(ctx.json(getProjectStatusBody(undefined, 99.876)))
                )
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.progress).toBe('99%');
        });

        it('gets project status - progress 100.0 returns 100%', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) =>
                    res(ctx.json(getProjectStatusBody(undefined, 100.0)))
                )
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.progress).toBe('100%');
        });

        it('gets project status - progress 0.23 returns 0%', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) =>
                    res(ctx.json(getProjectStatusBody(undefined, 0.23)))
                )
            );

            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.progress).toBe('0%');
        });

        it('gets project status - time -213 returns undefined', async () => {
            server.use(
                rest.get(apiRequestUrl(statusUrl), (req, res, ctx) => res(ctx.json(getProjectStatusBody(-213))))
            );
            const { trainingDetails } = await projectService.getProjectStatus(projectIdentifier);

            expect(trainingDetails?.timeRemaining).toBe(undefined);
        });
    });

    describe('Project settings', () => {
        const settingsUrl = API_URLS.SETTINGS(datasetIdentifier.projectId);

        it('gets settings', async () => {
            const mockGETResponse = {
                settings: { name: 'sonoma creek' },
            };

            server.use(rest.get(`/api/${settingsUrl}`, (_req, res, ctx) => res(ctx.json(mockGETResponse))));

            const settings = await projectService.getProjectSettings(datasetIdentifier.projectId);

            expect(settings).toStrictEqual(mockGETResponse);
        });

        it('saves settings', async () => {
            const mockBody = { name: 'sonoma creek' };

            server.use(rest.post(`/api/${settingsUrl}`, (_req, res, ctx) => res(ctx.json({ message: 'ok' }))));

            await projectService.saveProjectSettings(datasetIdentifier.projectId, {
                settings: JSON.stringify(mockBody),
            });
        });
    });

    describe('Create project', () => {
        const { workspaceId } = datasetIdentifier;
        const url = API_URLS.PROJECTS(workspaceId);

        const expectedDetectionTask = {
            title: 'Detection task',
            task_type: 'detection',
            labels: [
                {
                    name: 'label',
                    group: 'group-1',
                    color: '#eeddbb',
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
                {
                    name: 'label2',
                    group: 'group-1',
                    color: '#eeddbb',
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
            ],
        };
        const expectedClassificationChainTask = {
            title: 'Classification task',
            task_type: 'classification',
            labels: [
                {
                    name: 'label',
                    color: '#eeddbb',
                    group: `group-1${GROUP_SEPARATOR}Default group`,
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
                {
                    name: 'label child',
                    color: '#eeddbb',
                    group: `group-1${GROUP_SEPARATOR}Default group`,
                    parent_id: 'label',
                    hotkey: 'ctrl+2',
                },
                {
                    name: 'label child child',
                    color: '#eeddbb',
                    group: `group-1${GROUP_SEPARATOR}Default group`,
                    parent_id: 'label child',
                    hotkey: 'ctrl+3',
                },
                {
                    name: 'label child2',
                    color: '#eeddbb',
                    group: `group-1${GROUP_SEPARATOR}Default group`,
                    parent_id: 'label',
                    hotkey: 'ctrl+4',
                },
            ],
        };

        const expectedClassificationTask = {
            title: 'Classification task',
            task_type: 'classification',
            labels: [
                {
                    name: 'label',
                    color: '#eeddbb',
                    group: 'Default group',
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
                {
                    name: 'label child',
                    color: '#eeddbb',
                    group: 'Default group',
                    parent_id: 'label',
                    hotkey: 'ctrl+2',
                },
                {
                    name: 'label child child',
                    color: '#eeddbb',
                    group: 'Default group',
                    parent_id: 'label child',
                    hotkey: 'ctrl+3',
                },
                {
                    name: 'label child2',
                    color: '#eeddbb',
                    group: 'Default group',
                    parent_id: 'label',
                    hotkey: 'ctrl+4',
                },
            ],
        };

        const expectedSegmentationTask = {
            title: 'Segmentation task',
            task_type: 'segmentation',
            labels: [
                {
                    name: 'label',
                    color: '#eeddbb',
                    group: 'group-1',
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
                {
                    name: 'label2',
                    color: '#eeddbb',
                    group: 'group-1',
                    parent_id: null,
                    hotkey: 'ctrl+1',
                },
            ],
        };

        it('Create Detection', async () => {
            const expectedTasks = [{ title: 'Dataset', task_type: 'dataset' }, expectedDetectionTask];
            const expectedConnections = PROJECT_DETECTION.pipeline.connections;

            server.use(
                rest.post<ProjectCreation>(apiRequestUrl(url), (req, res, ctx) => {
                    const connections = req.body.pipeline.connections;
                    const tasks = req.body.pipeline.tasks;

                    if (!isEqual(expectedConnections, connections)) {
                        return res(ctx.status(500));
                    }

                    if (!isEqual(expectedTasks, tasks)) {
                        return res(ctx.status(500));
                    }

                    return res(ctx.json(PROJECT_DETECTION));
                })
            );

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.DETECTION],
                [
                    {
                        domain: DOMAIN.DETECTION,
                        labels: FLAT_LABELS,
                        relation: LabelsRelationType.SINGLE_SELECTION,
                    },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_DETECTION));
        });

        it('Create Detection oriented', async () => {
            server.use(rest.post(apiRequestUrl(url), (req, res, ctx) => res(ctx.json(PROJECT_DETECTION_ORIENTED))));

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX],
                [
                    {
                        domain: DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
                        labels: FLAT_LABELS,
                        relation: LabelsRelationType.SINGLE_SELECTION,
                    },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_DETECTION_ORIENTED));
        });

        it('Create Classification', async () => {
            const expectedConnections = [{ from: 'Dataset', to: 'Classification task' }];
            const expectedTasks = [{ title: 'Dataset', task_type: 'dataset' }, expectedClassificationTask];

            server.use(
                rest.post<ProjectCreation>(apiRequestUrl(url), (req, res, ctx) => {
                    const connections = req.body.pipeline.connections;
                    const tasks = req.body.pipeline.tasks;

                    if (!isEqual(expectedConnections, connections)) {
                        return res(ctx.status(500));
                    }

                    if (!isEqual(expectedTasks, tasks)) {
                        return res(ctx.status(500));
                    }
                    return res(ctx.json(PROJECT_CLASSIFICATION));
                })
            );

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.CLASSIFICATION],
                [
                    {
                        domain: DOMAIN.CLASSIFICATION,
                        labels: HIERARCHY_LABELS,
                        relation: LabelsRelationType.MIXED,
                    },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_CLASSIFICATION));
        });

        it('Create Segmentation', async () => {
            server.use(rest.post(apiRequestUrl(url), (req, res, ctx) => res(ctx.json(PROJECT_SEGMENTATION))));

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.SEGMENTATION],
                [
                    {
                        domain: DOMAIN.SEGMENTATION,
                        labels: FLAT_LABELS,
                        relation: LabelsRelationType.SINGLE_SELECTION,
                    },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_SEGMENTATION));
        });

        it('Create Segmentation instance', async () => {
            server.use(rest.post(apiRequestUrl(url), (req, res, ctx) => res(ctx.json(PROJECT_SEGMENTATION_INSTANCE))));

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.SEGMENTATION_INSTANCE],
                [
                    {
                        domain: DOMAIN.SEGMENTATION_INSTANCE,
                        labels: FLAT_LABELS,
                        relation: LabelsRelationType.SINGLE_SELECTION,
                    },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_SEGMENTATION_INSTANCE));
        });

        it('Create Anomaly classification', async () => {
            server.use(
                rest.post(apiRequestUrl(url), (_req, res, ctx) => res(ctx.json(PROJECT_ANOMALY_CLASSIFICATION)))
            );
            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.ANOMALY_CLASSIFICATION],
                []
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_ANOMALY_CLASSIFICATION));
        });

        it('Create Anomaly detection', async () => {
            server.use(rest.post(apiRequestUrl(url), (_req, res, ctx) => res(ctx.json(PROJECT_ANOMALY_DETECTION))));
            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.ANOMALY_DETECTION],
                []
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_ANOMALY_DETECTION));
        });

        it('Create Anomaly segmentation', async () => {
            server.use(rest.post(apiRequestUrl(url), (_req, res, ctx) => res(ctx.json(PROJECT_ANOMALY_SEGMENTATION))));
            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.ANOMALY_SEGMENTATION],
                []
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_ANOMALY_SEGMENTATION));
        });

        it('Create Detection > Classification', async () => {
            const expectedConnections = [
                { from: 'Dataset', to: 'Detection task' },
                { from: 'Detection task', to: 'Crop task' },
                { from: 'Crop task', to: 'Classification task' },
            ];
            const expectedTasks = [
                { title: 'Dataset', task_type: 'dataset' },
                expectedDetectionTask,
                expectedClassificationChainTask,
                {
                    title: 'Crop task',
                    task_type: 'crop',
                },
            ];

            server.use(
                rest.post<ProjectCreation>(apiRequestUrl(url), (req, res, ctx) => {
                    const connections = req.body.pipeline.connections;
                    const tasks = req.body.pipeline.tasks;

                    if (!isEqual(expectedConnections, connections)) {
                        return res(ctx.status(500));
                    }

                    if (!isEqual(expectedTasks, tasks)) {
                        return res(ctx.status(500));
                    }

                    return res(ctx.json(PROJECT_DETECTION_CLASSIFICATION));
                })
            );

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.CLASSIFICATION],
                [
                    { domain: DOMAIN.DETECTION, labels: FLAT_LABELS, relation: LabelsRelationType.SINGLE_SELECTION },
                    { domain: DOMAIN.CLASSIFICATION, labels: HIERARCHY_LABELS, relation: LabelsRelationType.MIXED },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_DETECTION_CLASSIFICATION));
        });

        it('Create Detection > Segmentation', async () => {
            const expectedConnections = [
                { from: 'Dataset', to: 'Detection task' },
                { from: 'Detection task', to: 'Crop task' },
                { from: 'Crop task', to: 'Segmentation task' },
            ];
            const expectedTasks = [
                { title: 'Dataset', task_type: 'dataset' },
                expectedDetectionTask,
                {
                    ...expectedSegmentationTask,
                    labels: expectedSegmentationTask.labels.map((task) => ({
                        ...task,
                        group: `group-1${GROUP_SEPARATOR}${task.group}`,
                    })),
                },
                {
                    title: 'Crop task',
                    task_type: 'crop',
                },
            ];

            server.use(
                rest.post<ProjectCreation>(apiRequestUrl(url), (req, res, ctx) => {
                    const connections = req.body.pipeline.connections;
                    const tasks = req.body.pipeline.tasks;

                    if (!isEqual(expectedConnections, connections)) {
                        return res(ctx.status(500));
                    }

                    if (!isEqual(expectedTasks, tasks)) {
                        return res(ctx.status(500));
                    }

                    return res(ctx.json(PROJECT_DETECTION_SEGMENTATION));
                })
            );

            const project = await projectService.createProject(
                workspaceId,
                'test-project',
                [DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.SEGMENTATION],
                [
                    { domain: DOMAIN.DETECTION, labels: FLAT_LABELS, relation: LabelsRelationType.SINGLE_SELECTION },
                    { domain: DOMAIN.SEGMENTATION, labels: FLAT_LABELS, relation: LabelsRelationType.SINGLE_SELECTION },
                ]
            );

            expect(project).toStrictEqual(getProjectEntity(PROJECT_DETECTION_SEGMENTATION));
        });
    });

    describe('Edit project', () => {
        const url = API_URLS.PROJECT(datasetIdentifier.workspaceId, datasetIdentifier.projectId);

        it('edits project correctly', async () => {
            const fakeProject: EditProjectProps = {
                id: 'fake-project-id',
                name: 'fake project',
                creationDate: new Date(),
                domains: [DOMAIN.ANOMALY_DETECTION],
                thumbnail: '',
                score: 0,
                tasks: [],
                datasets: [{ name: 'test dataset', id: 'test-dataset' }],
            };

            server.use(
                rest.put<{ result: string }>(apiRequestUrl(url), (_req, res, ctx) => {
                    return res(ctx.json({ ...PROJECT_DETECTION, name: 'updated-name' }));
                })
            );

            const project = await projectService.editProject(
                {
                    workspaceId: datasetIdentifier.workspaceId,
                    projectId: datasetIdentifier.projectId,
                },
                fakeProject
            );

            expect(project).toStrictEqual(getProjectEntity({ ...PROJECT_DETECTION, name: 'updated-name' }));
        });
    });

    describe('Delete all media', () => {
        const { workspaceId, projectId, datasetId } = datasetIdentifier;
        const url = API_URLS.DATASET_URL(workspaceId, projectId, datasetId);

        it('deletes all media', async () => {
            server.use(
                rest.delete<{ result: string }>(apiRequestUrl(url), (_req, res, ctx) => {
                    return res(ctx.json({ result: 'success' }));
                })
            );

            await projectService.deleteAllMedia({
                workspaceId,
                projectId,
                datasetId,
            });
        });
    });
});
