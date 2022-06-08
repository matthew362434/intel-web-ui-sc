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
import { fireEvent, RenderResult, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { DOMAIN } from '../../../../../core/projects';
import { mockedSupportedAlgorithms } from '../../../../../core/supported-algorithms/services/test-utils';
import { applicationRender as render, idMatchingFormat, onHoverTooltip } from '../../../../../test-utils';
import { useTasksWithSupportedAlgorithms } from '../../../hooks/use-tasks-with-supported-algorithms';
import { ProjectProvider, useProject } from '../../../providers';
import { TrainModelDialog } from './train-model-dialog.component';
import { getModelTemplateDetails, trainFromScratchTooltipMsg } from './utils';

jest.mock('../../../providers', () => ({
    ...jest.requireActual('../../../providers'),
    useProject: jest.fn(() => ({
        isTaskChainProject: false,
        project: {
            tasks: [{ id: '1', domain: 'Detection' }],
            labels: [],
            datasets: [{ id: 1, name: 'test dataset' }],
        },
    })),
}));

jest.mock('../../../hooks/use-tasks-with-supported-algorithms', () => ({
    useTasksWithSupportedAlgorithms: jest.fn(() => ({
        tasksWithSupportedAlgorithms: {
            '1': [],
        },
    })),
}));

describe('Train model dialog', () => {
    const mockedProject = {
        isTaskChainProject: false,
        project: {
            tasks: [{ id: '1', domain: DOMAIN.DETECTION }],
            labels: [],
            datasets: [{ id: 1, name: 'test dataset' }],
        },
    };

    const projectTaskChainId = 'project-task-chain-id';
    const projectIdMocked = 'project-id';
    const selectedClass = 'selectableCard selectableCardSelected';
    const handleClose = jest.fn();

    const mockedSupportedAlgorithmsForDetection = mockedSupportedAlgorithms.filter(
        ({ domain }) => DOMAIN.DETECTION === domain
    );
    const mockedSupportedAlgorithmsForClassification = mockedSupportedAlgorithms.filter(
        ({ domain }) => DOMAIN.CLASSIFICATION === domain
    );

    const mockedTaskWithAlgorithmsDetection = {
        tasksWithSupportedAlgorithms: {
            '1': mockedSupportedAlgorithmsForDetection,
        },
    };

    const mockedTaskWithTwoAlgorithmsDetection = {
        tasksWithSupportedAlgorithms: {
            '1': [mockedSupportedAlgorithmsForDetection[0], mockedSupportedAlgorithmsForDetection[1]],
        },
    };

    const renderTrainModelDialog = async (projectId = projectIdMocked): Promise<RenderResult> => {
        return await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId }}>
                <TrainModelDialog isOpen={true} handleClose={handleClose} />
            </ProjectProvider>
        );
    };

    it('Picker for domains should not be displayed when a project is not a task chain', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithAlgorithmsDetection);

        await renderTrainModelDialog();

        expect(screen.queryByDisplayValue(DOMAIN.DETECTION)).not.toBeInTheDocument();
    });

    it('Balance model template should be selected by default', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithAlgorithmsDetection);

        await renderTrainModelDialog();

        const balanceModelTemplate = screen.getByTestId('balance-id');
        expect(balanceModelTemplate).toHaveClass(selectedClass, { exact: false });
    });

    it('Accuracy model template should be selected by default when there is no balance model', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog(projectIdMocked);

        const accuracyModelTemplate = screen.getByTestId('accuracy-id');
        expect(accuracyModelTemplate).toHaveClass(selectedClass, { exact: false });
    });

    it('Speed model template should be selected', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithAlgorithmsDetection);

        await renderTrainModelDialog();

        const balanceModelTemplate = screen.getByTestId('balance-id');
        const speedModelTemplate = screen.getByTestId('speed-id');

        expect(balanceModelTemplate).toHaveClass(selectedClass, { exact: false });
        expect(speedModelTemplate).not.toHaveClass(selectedClass, { exact: false });

        fireEvent.click(speedModelTemplate);

        expect(balanceModelTemplate).not.toHaveClass(selectedClass, { exact: false });
        expect(speedModelTemplate).toHaveClass(selectedClass, { exact: false });
    });

    it('Custom template should be selected', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        const customTemplate = screen.getByTestId('custom-id');
        expect(customTemplate).not.toHaveClass(selectedClass, { exact: false });

        fireEvent.click(customTemplate);
        expect(customTemplate).toHaveClass(selectedClass, { exact: false });
    });

    it('Start button is displayed in the selection template step when custom template is not selected', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        const startButton = screen.getByRole('button', { name: 'Start' });
        expect(screen.getByTestId('custom-id')).not.toHaveClass(selectedClass, { exact: false });
        expect(startButton).toBeInTheDocument();
        expect(startButton).toBeEnabled();
    });

    it('Next button is displayed in the selection template step when custom template is selected', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        const customTemplate = screen.getByTestId('custom-id');
        fireEvent.click(customTemplate);
        expect(customTemplate).toHaveClass(selectedClass, { exact: false });
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('Back button is not displayed in the selection template step', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    });

    it('Back button is displayed in the selecting architecture steps', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('Selecting algorithms should be the first step of selecting architecture', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);
        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });

    it('Configuring parameters should be the second step of selecting architecture', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));

        const nextButton = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        expect(screen.getByText('2 of 2')).toBeInTheDocument();
    });

    it('First algorithm in the first step of selecting architecture should be selected by default', async () => {
        const [firstAlgorithm, secondAlgorithm] = mockedSupportedAlgorithmsForDetection;

        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));

        [firstAlgorithm, secondAlgorithm].forEach((algorithm) => {
            const { algorithmName, gigaflops, modelSize } = algorithm;
            expect(screen.getByText(algorithmName)).toBeInTheDocument();
            expect(screen.getByTestId(`${idMatchingFormat(algorithmName)}-size-id`)).toHaveTextContent(
                `${modelSize} MB`
            );
            expect(screen.getByTestId(`${idMatchingFormat(algorithmName)}-complexity-id`)).toHaveTextContent(
                `${gigaflops} GFlops`
            );
        });

        expect(screen.getByTestId(`${idMatchingFormat(firstAlgorithm.algorithmName)}-id`)).toHaveClass(selectedClass, {
            exact: false,
        });
    });

    it('Start button is enabled in the final step of advanced training', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));

        const nextButton = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

        const startButton = screen.getByRole('button', { name: 'Start' });
        expect(startButton).toBeInTheDocument();
        expect(startButton).toBeEnabled();
    });

    it('Training from scratch is only available in the configuring parameters step', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        fireEvent.click(screen.getByTestId('custom-id'));

        const nextButton = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextButton);
        expect(screen.queryByText('Train from scratch')).not.toBeInTheDocument();
        fireEvent.click(nextButton);

        await waitForElementToBeRemoved(screen.getByTestId('config-params-placeholder-id'));
        expect(screen.getByText('Train from scratch')).toBeInTheDocument();
        onHoverTooltip(screen.getByTestId('train-from-scratch-tooltip-id'));
        expect(screen.getByText(trainFromScratchTooltipMsg)).toBeInTheDocument();
    });

    it('Choices from the previous steps should be remembered', async () => {
        const [, secondAlgorithm] = mockedSupportedAlgorithmsForDetection;

        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithTwoAlgorithmsDetection);

        await renderTrainModelDialog();

        const customCard = screen.getByTestId('custom-id');
        fireEvent.click(customCard);

        const nextButton = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextButton);

        const backButton = screen.getByRole('button', { name: 'Back' });
        const secondAlgorithmCard = screen.getByTestId(`${idMatchingFormat(secondAlgorithm.algorithmName)}-id`);

        expect(secondAlgorithmCard).not.toHaveClass(selectedClass, { exact: false });
        fireEvent.click(secondAlgorithmCard);
        expect(secondAlgorithmCard).toHaveClass(selectedClass, { exact: false });

        fireEvent.click(backButton);
        expect(customCard).toHaveClass(selectedClass, { exact: false });

        fireEvent.click(nextButton);
        expect(secondAlgorithmCard).toHaveClass(selectedClass, { exact: false });
    });

    it('Picker for domains should be displayed only when a project is a task chain', async () => {
        const mockedTCProject = {
            isTaskChainProject: true,
            project: {
                tasks: [
                    { id: '1', domain: DOMAIN.DETECTION },
                    {
                        id: '2',
                        domain: DOMAIN.CLASSIFICATION,
                    },
                ],
                labels: [],
                datasets: [{ id: 1, name: 'test dataset' }],
            },
        };
        const taskWithAlgorithms = {
            tasksWithSupportedAlgorithms: {
                '1': mockedSupportedAlgorithmsForDetection,
                '2': mockedSupportedAlgorithmsForClassification,
            },
        };

        (useProject as jest.Mock).mockImplementation(() => mockedTCProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => taskWithAlgorithms);

        await renderTrainModelDialog(projectTaskChainId);

        const picker = screen.getByDisplayValue(DOMAIN.DETECTION);
        expect(picker).toBeInTheDocument();
        fireEvent.click(picker);

        expect(screen.getByText(DOMAIN.CLASSIFICATION)).toBeInTheDocument();
    });

    it('Should show proper tooltip for given algorithm', async () => {
        (useProject as jest.Mock).mockImplementation(() => mockedProject);
        (useTasksWithSupportedAlgorithms as jest.Mock).mockImplementation(() => mockedTaskWithAlgorithmsDetection);
        await renderTrainModelDialog(projectIdMocked);

        const { summary, templateName } = getModelTemplateDetails(
            mockedSupportedAlgorithmsForDetection[0].modelTemplateId,
            mockedSupportedAlgorithmsForDetection
        );

        const infoTooltip = screen.getByTestId(`${templateName.toLocaleLowerCase()}-summary-id`);
        expect(screen.queryByText(summary)).not.toBeInTheDocument();
        onHoverTooltip(infoTooltip);
        expect(screen.getByText(summary)).toBeInTheDocument();
    });
});
