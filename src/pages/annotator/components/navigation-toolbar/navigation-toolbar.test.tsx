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

import { fireEvent, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';

import { DOMAIN } from '../../../../core/projects';
import { initialConfig, UseSettings } from '../../../../shared/components/header/settings/use-settings.hook';
import { fakeAnnotationToolContext, getById, screen } from '../../../../test-utils';
import { getMockedLabel, getMockedProject, getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import { ANNOTATOR_MODE } from '../../core';
import { useAnnotationToolContext, useAnnotator, useTask } from '../../providers';
import { annotatorRender as render } from '../../test-utils/annotator-render';
import { NavigationToolbar } from './navigation-toolbar.component';

jest.mock('../../../project-details/providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../../project-details/providers/project-provider/project-provider.component'),
    useProject: jest.fn(() => ({
        project: { domains: [], tasks: [] },
        isSingleDomainProject: jest.fn(),
        isTaskTraining: jest.fn(),
        projectStatus: {
            tasks: [],
        },
    })),
}));

jest.mock('../../providers', () => ({
    ...jest.requireActual('../../providers'),
    useAnnotator: jest.fn(() => ({})),
    useTask: jest.fn(() => ({
        selectedTask: null,
        activeDomains: [],
    })),
    useAnnotationToolContext: jest.fn(),
}));

describe('Navigation toolbar', () => {
    const mockSettings: UseSettings = {
        saveConfig: jest.fn(),
        isSavingConfig: false,
        config: initialConfig,
    };

    beforeEach(() => {
        const annotationToolContext = fakeAnnotationToolContext({});

        (useAnnotationToolContext as jest.Mock).mockImplementation(() => annotationToolContext);
    });

    it('Displays LabelSearch if is not a classification task', async () => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ domains: [DOMAIN.SEGMENTATION] }),
            isTaskTraining: jest.fn(),
            isSingleDomainProject: jest.fn(),
        }));

        (useAnnotator as jest.Mock).mockImplementation(() => ({
            mode: ANNOTATOR_MODE.ANNOTATION,
            settings: {
                config: initialConfig,
                toggleFeature: jest.fn(),
                saveConfig: jest.fn(),
            },
        }));

        (useTask as jest.Mock).mockImplementation(() => ({
            activeDomains: [DOMAIN.SEGMENTATION],
        }));

        const { container } = render(<NavigationToolbar settings={mockSettings} />);

        await waitFor(() => {
            expect(getById(container, 'label-search-field-id')).toBeTruthy();
        });
    });

    it('Displays the project name if it is not a task chain project', async () => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ name: 'test-project', domains: [DOMAIN.SEGMENTATION] }),
            isTaskTraining: jest.fn(),
            isSingleDomainProject: jest.fn(),
        }));

        render(<NavigationToolbar settings={mockSettings} />);

        await waitFor(() => {
            expect(screen.queryByText(`test-project @ ${DOMAIN.SEGMENTATION}`)).toBeTruthy();
        });
    });

    it('Displays NavigationBreadcrumbs if it is a task chain project', async () => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: getMockedProject({ name: 'test-project', domains: [DOMAIN.SEGMENTATION, DOMAIN.CLASSIFICATION] }),
            isSingleDomainProject: jest.fn(),
            isTaskTraining: jest.fn(),
        }));

        render(<NavigationToolbar settings={mockSettings} />);

        await waitFor(() => {
            expect(screen.queryByRole('navigation')).toBeTruthy();
        });
    });

    it('Job management icon is properly displayed', async () => {
        const { container } = render(<NavigationToolbar settings={mockSettings} />);

        await waitFor(() => {
            getById(container, 'number-badge-jobs-management');
        });

        const numberBadge = getById(container, 'number-badge-jobs-management');

        expect(numberBadge).toBeInTheDocument();
        expect(numberBadge).not.toHaveClass('reversedColor', { exact: false });
    });

    describe('Required annotations', () => {
        const fakeTaskOne = {
            id: '1234',
            title: 'Detection task',
            labels: [getMockedLabel({ id: 'task-one-label' })],
            domain: DOMAIN.DETECTION,
            required_annotations: {
                details: [],
                value: 64,
            },
        };
        const fakeTaskTwo = {
            id: '12345',
            title: 'Segmentation task',
            labels: [getMockedLabel({ id: 'task-two-label' })],
            domain: DOMAIN.SEGMENTATION,
            required_annotations: {
                details: [],
                value: 2,
            },
        };

        it('Displays the correct required annotations for single task project', async () => {
            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: fakeTaskOne,
                activeDomains: [],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({ name: 'test-project', domains: [DOMAIN.SEGMENTATION] }),
                isSingleDomainProject: jest.fn(),
                isTaskTraining: jest.fn(),
                projectStatus: {
                    tasks: [fakeTaskOne],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitFor(() => {
                const annotationsValue = screen.getByTestId('required-annotations-value');

                expect(within(annotationsValue).queryByText('64')).toBeTruthy();
            });
        });

        it('Displays the correct required annotations on task chain project with "All tasks" selected', async () => {
            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: null,
                activeDomains: [],
                tasks: [fakeTaskOne, fakeTaskTwo],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({
                    name: 'test-project',
                    domains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
                }),
                isSingleDomainProject: jest.fn(),
                isTaskTraining: jest.fn(),
                projectStatus: {
                    tasks: [fakeTaskOne, fakeTaskTwo],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitFor(() => {
                const annotationsValue = screen.getByTestId('required-annotations-value');
                expect(within(annotationsValue).queryByText('66')).toBeTruthy();
            });
        });

        it('Displays the correct required annotations on task chain project with one of the tasks selected', async () => {
            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: fakeTaskOne,
                activeDomains: [],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({
                    name: 'test-project',
                    domains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
                }),
                isSingleDomainProject: jest.fn(),
                isTaskTraining: jest.fn(),
                projectStatus: {
                    tasks: [fakeTaskOne, fakeTaskTwo],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitFor(() => {
                const annotationsValue = screen.getByTestId('required-annotations-value');
                expect(within(annotationsValue).queryByText('64')).toBeTruthy();
            });
        });

        it('Displays the correct training information on task chain project with one of the tasks selected not training', async () => {
            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: fakeTaskTwo,
                activeDomains: [],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({
                    name: 'test-project',
                    domains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
                }),
                isSingleDomainProject: jest.fn(),
                isTaskTraining: jest.fn(),
                projectStatus: {
                    tasks: [
                        { ...fakeTaskOne, is_training: true },
                        { ...fakeTaskTwo, is_training: false },
                    ],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitFor(() => {
                const annotationsValue = screen.getByTestId('required-annotations-value');

                expect(within(annotationsValue).queryByText('2')).toBeTruthy();
            });
        });

        it('Displays the correct training information on task chain project with one of the tasks selected training', async () => {
            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: fakeTaskOne,
                activeDomains: [],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({
                    name: 'test-project',
                    domains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
                }),
                isSingleDomainProject: jest.fn(),
                isTaskTraining: jest.fn(() => true),
                projectStatus: {
                    tasks: [
                        { ...fakeTaskOne, is_training: true },
                        { ...fakeTaskTwo, is_training: false },
                    ],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitFor(() => {
                const annotationsValue = screen.queryByTestId('required-annotations-value');
                const trainingDots = screen.queryByTestId('training-dots');

                expect(annotationsValue).toBeFalsy();
                expect(trainingDots).toBeTruthy();
            });
        });

        it('hides the required annotations for anomaly projects', async () => {
            const anomalyTask = getMockedTask({
                domain: DOMAIN.ANOMALY_DETECTION,
            });

            (useTask as jest.Mock).mockImplementation(() => ({
                selectedTask: anomalyTask,
                activeDomains: [],
            }));

            (useProject as jest.Mock).mockImplementation(() => ({
                project: getMockedProject({ name: 'test-project', tasks: [anomalyTask] }),
                isSingleDomainProject: () => true,
                isTaskTraining: jest.fn(),
                projectStatus: {
                    tasks: [{ ...anomalyTask, required_annotations: { details: [], value: 0 } }],
                },
            }));

            render(<NavigationToolbar settings={mockSettings} />);

            await waitForElementToBeRemoved(screen.getByRole('progressbar'));

            expect(screen.queryByTestId('required-annotations-value')).not.toBeInTheDocument();
            expect(screen.queryByText(/Annotations required/i)).not.toBeInTheDocument();
        });
    });

    it('should render a GearIcon that correctly renders the settings dialog', async () => {
        await render(<NavigationToolbar settings={mockSettings} />);

        await waitFor(() => {
            const settingsIcon = screen.getByTestId('settings-icon');

            fireEvent.click(settingsIcon);

            expect(screen.queryByLabelText('Settings dialog')).toBeTruthy();
        });
    });
});
