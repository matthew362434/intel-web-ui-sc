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
import { waitFor } from '@testing-library/react';

import { DOMAIN } from '../../../../core/projects';
import { ApplicationProvider } from '../../../../providers';
import { getById, providersRender as render, screen } from '../../../../test-utils';
import { getMockedImageMediaItem, getMockedProject } from '../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import { useAnnotator } from '../../providers';
import { useTask } from '../../providers/task-provider/task-provider.component';
import { Footer } from './footer.component';

jest.mock('../../providers', () => ({
    ...jest.requireActual('../../providers'),
    useAnnotator: jest.fn(() => ({})),
}));

jest.mock('../../../project-details/providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../../project-details/providers/project-provider/project-provider.component'),
    useProject: jest.fn(() => ({
        project: { domains: [] },
        projectStatus: {
            trainingDetails: {
                message: 'Waiting for annotations',
            },
        },
    })),
}));

jest.mock('../../providers/task-provider/task-provider.component', () => ({
    ...jest.requireActual('../../providers/task-provider/task-provider.component'),
    useTask: jest.fn(() => ({
        selectedTask: undefined,
        activeDomains: [],
    })),
}));

jest.mock('../../hooks/use-dataset-identifier.hook', () => ({
    useDatasetIdentifier: jest.fn(() => {
        return { projectId: 'project-id', workspaceId: 'workspace-id' };
    }),
}));

describe('Annotator Footer', () => {
    it('Displays training progress correctly if there is no training', async () => {
        const { container } = render(<Footer zoom={1} />);

        await waitFor(() => {
            expect(getById(container, 'training-progress')).toBeInTheDocument();
        });

        expect(screen.getByText('Waiting for annotations')).toBeInTheDocument();
    });

    it('Displays training progress correctly if there is  general training', async () => {
        const fakeTraining = { timeRemaining: '01:02:00', message: 'Anomaly - Training', progress: '63%' };

        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ domains: [] }),
            projectStatus: {
                isTraining: true,
                trainingDetails: fakeTraining,
            },
        }));

        const { container } = render(
            <ApplicationProvider>
                <Footer zoom={1} />
            </ApplicationProvider>
        );

        await waitFor(() => {
            expect(getById(container, 'training-progress')).toBeInTheDocument();
        });

        expect(screen.getByText('Anomaly - Training')).toBeInTheDocument();
        expect(screen.getByText('63%')).toBeInTheDocument();
        expect(screen.getByText('01:02:00')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('Displays training progress for a specific task', async () => {
        const fakeTask = { id: '1234', title: 'Segmentation task', labels: [], domain: DOMAIN.SEGMENTATION };

        (useTask as jest.Mock).mockImplementation(() => ({
            selectedTask: fakeTask,
            activeDomains: [],
        }));

        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ domains: [] }),
            projectStatus: {
                tasks: [
                    {
                        ...fakeTask,
                        status: {
                            message: 'Training specific task',
                            progress: 63,
                            time_remaining: 100,
                        },
                    },
                ],
            },
        }));

        const { container } = render(
            <ApplicationProvider>
                <Footer zoom={1} />
            </ApplicationProvider>
        );

        await waitFor(() => {
            expect(getById(container, 'training-progress')).toBeInTheDocument();
        });

        expect(screen.getByText('Training specific task')).toBeInTheDocument();
        expect(screen.getByText('63%')).toBeInTheDocument();
        expect(screen.getByText('00:01:40')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('Displays zoom state and image metadata correctly', async () => {
        const image = document.createElement('img');
        const mockedImageItem = getMockedImageMediaItem(image);

        (useAnnotator as jest.Mock).mockImplementation(() => ({
            selectedMediaItem: mockedImageItem,
        }));

        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ domains: [] }),
        }));

        render(
            <ApplicationProvider>
                <Footer zoom={1} />
            </ApplicationProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('100.0%')).toBeTruthy();
            expect(screen.queryByText(`${mockedImageItem.name}`)).toBeTruthy();
            expect(
                screen.queryByText(`(${mockedImageItem.metadata.width}px x ${mockedImageItem.metadata.height}px)`)
            ).toBeTruthy();
        });
    });

    it('Displays project name if it is a task chain project', async () => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ name: 'test project', domains: [DOMAIN.SEGMENTATION, DOMAIN.CLASSIFICATION] }),
        }));

        render(
            <ApplicationProvider>
                <Footer zoom={1} />
            </ApplicationProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('test project')).toBeTruthy();
        });
    });
});
