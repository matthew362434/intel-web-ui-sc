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

import { fireEvent, RenderResult, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';

import { DOMAIN } from '../../../../../core/projects';
import { mockedDetectionSupportedAlgorithms } from '../../../../../core/supported-algorithms/services/test-utils';
import { applicationRender as render, getAllWithMatchId, getById, onHoverTooltip } from '../../../../../test-utils';
import { getMockedProject } from '../../../../../test-utils/mocked-items-factory';
import { useTasksWithSupportedAlgorithms } from '../../../hooks/use-tasks-with-supported-algorithms';
import { ProjectProvider, useProject } from '../../../providers';
import { getModelTemplateDetails } from '../train-model-dialog/utils';
import { ModelContainer } from './index';
import { ModelCardProps } from './model-card';
import { ModelContainerProps } from './model-container.interface';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: jest.fn(),
    }),
    useLocation: () => ({
        pathname: 'localhost:3000/projects/123/models/1',
    }),
}));

jest.mock('../../../providers', () => ({
    ...jest.requireActual('../../../providers'),
    useProject: jest.fn(() => ({
        project: { tasks: [] },
    })),
}));

jest.mock('../../../hooks/use-tasks-with-supported-algorithms', () => ({
    useTasksWithSupportedAlgorithms: jest.fn(() => ({
        tasksWithSupportedAlgorithms: {},
    })),
}));

describe('Model container', () => {
    const taskId = 'task-id';

    beforeEach(() => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({
                tasks: [{ id: taskId, domain: DOMAIN.DETECTION, title: 'Detection', labels: [] }],
            }),
        }));
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => ({
            tasksWithSupportedAlgorithms: {
                [taskId]: mockedDetectionSupportedAlgorithms,
            },
        }));
    });

    const defaultModelsHistory: ModelCardProps[] = [
        {
            id: '3',
            architectureId: 'yolov4-id',
            architectureName: 'YoloV4',
            accuracy: 90,
            performance: { type: 'default_performance', score: 90 },
            version: 3,
            isActiveModel: false,
            upToDate: true,
            creationDate: dayjs().toString(),
        },
        {
            id: '2',
            architectureId: 'yolov4-id',
            architectureName: 'Yolov4',
            accuracy: 85,
            performance: { type: 'default_performance', score: 85 },
            version: 2,
            isActiveModel: false,
            upToDate: false,
            creationDate: dayjs().toString(),
        },
        {
            id: '1',
            architectureName: 'YoloV4',
            architectureId: 'yolov4-id',
            accuracy: 70,
            performance: { type: 'default_performance', score: 70 },
            version: 1,
            isActiveModel: false,
            upToDate: false,
            creationDate: dayjs().toString(),
        },
    ];

    const defaultModelOverall: ModelContainerProps = {
        modelTemplateId: mockedDetectionSupportedAlgorithms[0].modelTemplateId,
        modelVersions: defaultModelsHistory,
        architectureName: 'YoloV4',
        architectureId: 'yolov4-id',
        taskId,
    };

    const renderModelContainer = async (models = defaultModelOverall): Promise<RenderResult> => {
        return await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <ModelContainer {...models} />
            </ProjectProvider>
        );
    };

    it('should render the models overall', async () => {
        const { container } = await renderModelContainer();
        const { templateName } = getModelTemplateDetails(
            mockedDetectionSupportedAlgorithms[0].modelTemplateId,
            mockedDetectionSupportedAlgorithms
        );

        expect(getById(container, `model-group-name-${defaultModelOverall.architectureId}-id`)).toHaveTextContent(
            `${templateName} (${defaultModelOverall.architectureName})`
        );
        expect(getAllWithMatchId(container, 'model-card-')).toHaveLength(1);
    });

    it('should render more models after pressed expand button', async () => {
        const { container } = await renderModelContainer();
        expect(getAllWithMatchId(container, 'model-card-')).toHaveLength(1);
        const expandButton = getById(container, `expand-button-${defaultModelOverall.architectureId}-id`);
        expandButton && fireEvent.click(expandButton);
        expect(getAllWithMatchId(container, 'model-card-')).toHaveLength(defaultModelOverall.modelVersions.length);
        expandButton && fireEvent.click(expandButton);
        await waitFor(() => {
            expect(getAllWithMatchId(container, 'model-card-')).toHaveLength(1);
        });
    });

    it('should show tooltip for given algorithm', async () => {
        const { container } = await renderModelContainer();
        const { summary } = getModelTemplateDetails(
            mockedDetectionSupportedAlgorithms[0].modelTemplateId,
            mockedDetectionSupportedAlgorithms
        );

        const infoIcon = getById(container, `algorithm-summary-${defaultModelOverall.architectureId}-id`);
        expect(screen.queryByText(summary)).not.toBeInTheDocument();
        onHoverTooltip(infoIcon);
        expect(screen.getByText(summary)).toBeInTheDocument();
    });

    it('should not show expand button when there is only one model', async () => {
        const modelGroupWithOneModel: ModelContainerProps = {
            ...defaultModelOverall,
            modelVersions: [defaultModelsHistory[0]],
        };

        const { container } = await renderModelContainer(modelGroupWithOneModel);
        const expandButton = getById(container, `expand-button-${defaultModelOverall.architectureId}-id`);
        expect(expandButton).toBeNull();
    });

    it('should show expand button where there are at least two models', async () => {
        const { container } = await renderModelContainer();
        const expandButton = getById(container, `expand-button-${defaultModelOverall.architectureId}-id`);
        expect(expandButton).toBeDefined();
    });
});
