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
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext, getById, applicationRender } from '../../../../test-utils';
import { getMockedLabel } from '../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../../project-details/providers';
import { ToolType } from '../../core';
import { TaskProvider, useTask } from '../../providers';
import { SecondaryToolbar } from './secondary-toolbar.component';
import { BACKGROUND_LABEL } from './utils';
import { WatershedStateProvider, useWatershedState } from './watershed-state-provider.component';

jest.mock('./watershed-state-provider.component', () => ({
    ...jest.requireActual('./watershed-state-provider.component'),
    useWatershedState: jest.fn(() => ({
        ...jest.requireActual('./watershed-state-provider.component').useWatershedState,
        shapes: { markers: [], watershedPolygons: [] },
    })),
}));

jest.mock('../../providers/task-provider/task-provider.component', () => ({
    ...jest.requireActual('../../providers/task-provider/task-provider.component'),
    useTask: jest.fn(() => ({
        labels: [],
        activeDomains: [],
        isTaskChainDomainSelected: jest.fn(),
    })),
}));

const mockLabels = [
    getMockedLabel({ id: '1', name: 'label-1' }),
    getMockedLabel({ id: '2', name: 'label-2' }),
    getMockedLabel({ id: '3', name: 'label-3' }),
];

const mockAnnotationToolContext = fakeAnnotationToolContext({ tool: ToolType.WatershedTool, labels: mockLabels });

const getToolSettings = mockAnnotationToolContext.getToolSettings as jest.Mock;
const updateToolSettings = mockAnnotationToolContext.updateToolSettings as jest.Mock;
const defaultToolSettings = { brushSize: 2, sensitivity: 2, label: { label: mockLabels[0], markerId: 2 } };

const renderMockApp = async () =>
    await applicationRender(
        <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
            <TaskProvider>
                <WatershedStateProvider>
                    <SecondaryToolbar annotationToolContext={mockAnnotationToolContext} />
                </WatershedStateProvider>
            </TaskProvider>
        </ProjectProvider>
    );

describe('Secondary Toolbar', () => {
    beforeEach(() => {
        getToolSettings.mockReturnValue(defaultToolSettings);

        (useTask as jest.Mock).mockImplementation(() => ({
            selectedTask: null,
            activeDomains: [],
            tasks: [
                {
                    id: '60b609e0d036ba4566726c81',
                    labels: [mockLabels[0]],
                    domain: DOMAIN.CLASSIFICATION,
                    title: 'Classification',
                },
                {
                    id: '60b609e0d036ba4566726c82',
                    labels: [mockLabels[1], mockLabels[2]],
                    domain: DOMAIN.SEGMENTATION,
                    title: 'Segmentation',
                },
            ],
            labels: mockLabels,
        }));
    });

    it('renders label picker correctly', async () => {
        await renderMockApp();

        fireEvent.click(screen.getByLabelText('label'));

        expect(screen.getByText(BACKGROUND_LABEL.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockLabels[1].name)).toBeInTheDocument();
        expect(screen.getByText(mockLabels[2].name)).toBeInTheDocument();
        expect(screen.queryByText(mockLabels[0].name)).toBeFalsy();
    });

    it('renders sensitivity slider correctly', async () => {
        await renderMockApp();

        // Trigger slider popover
        fireEvent.click(screen.getByTestId('sensitivity-button'));

        const slider = screen.getByRole('slider');

        expect(slider).toBeInTheDocument();

        // Set to minimum
        act(() => {
            fireEvent.change(slider, {
                target: {
                    value: 1,
                },
            });
        });

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument();
        });

        // Set to maximum
        act(() => {
            fireEvent.change(slider, {
                target: {
                    value: 5,
                },
            });
        });

        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        // Trigger onChangeEnd
        act(() => {
            fireEvent.keyDown(slider, { key: 'Right' });
        });

        expect(updateToolSettings).toHaveBeenCalledWith(ToolType.WatershedTool, {
            ...defaultToolSettings,
            sensitivity: 5,
        });
    });

    it('renders brush slider correctly', async () => {
        await renderMockApp();

        // Trigger slider popover
        fireEvent.click(screen.getByTestId('brush-size-button'));

        const slider = screen.getByRole('slider');

        // Set to minimum
        fireEvent.change(slider, {
            target: {
                value: 1,
            },
        });

        expect(screen.getByText('1px')).toBeInTheDocument();

        // Set to maximum
        fireEvent.change(slider, {
            target: {
                value: 128,
            },
        });

        expect(screen.getByText('128px')).toBeInTheDocument();

        // Trigger onChangeEnd
        act(() => {
            fireEvent.keyDown(slider, { key: 'Right' });
        });

        expect(updateToolSettings).toHaveBeenCalledWith(ToolType.WatershedTool, {
            ...defaultToolSettings,
            brushSize: 128,
        });
    });

    it('does not render a ButtonGroup if there are no watershed polygons rendered', async () => {
        (useWatershedState as jest.Mock).mockImplementation(() => ({
            shapes: { markers: [], watershedPolygons: [] },
        }));

        const { container } = await renderMockApp();

        const confirmButton = getById(container, 'confirm-watershed-annotation');
        const cancelButton = getById(container, 'cancel-watershed-annotation');

        expect(confirmButton).not.toBeInTheDocument();
        expect(cancelButton).not.toBeInTheDocument();
    });

    it('renders a ButtonGroup if there are watershed polygons or markers rendered', async () => {
        (useWatershedState as jest.Mock).mockImplementation(() => ({
            shapes: {
                markers: [],
                watershedPolygons: [
                    { id: 1, points: [123, 456] },
                    { id: 2, points: [222, 444] },
                ],
            },
        }));

        const { container } = await renderMockApp();

        const confirmButton = getById(container, 'confirm-watershed-annotation');
        const cancelButton = getById(container, 'cancel-watershed-annotation');

        expect(confirmButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
    });

    it('confirms and cancels annotation correctly', async () => {
        const mockReset = jest.fn();
        const mockSetShapes = jest.fn();

        (useWatershedState as jest.Mock).mockImplementation(() => ({
            shapes: {
                markers: [],
                watershedPolygons: [
                    { id: 1, points: [123, 456] },
                    { id: 2, points: [222, 444] },
                ],
            },
            undoRedoActions: {
                reset: jest.fn(),
            },
            reset: mockReset,
            setShapes: mockSetShapes,
        }));

        const { container } = await renderMockApp();

        const confirmButton = getById(container, 'confirm-watershed-annotation');
        const cancelButton = getById(container, 'cancel-watershed-annotation');

        confirmButton && fireEvent.click(confirmButton);

        expect(mockAnnotationToolContext.scene.addAnnotations).toHaveBeenCalled();

        cancelButton && fireEvent.click(cancelButton);

        expect(mockReset).toHaveBeenCalled();
    });

    it('disables confirm button if there are not polygons to annotate', async () => {
        const mockReset = jest.fn();
        const mockSetShapes = jest.fn();

        (useWatershedState as jest.Mock).mockImplementation(() => ({
            shapes: {
                markers: [{ label: mockLabels[0], points: [123, 456], brushSize: 2, id: 12345 }],
                watershedPolygons: [],
            },
            reset: mockReset,
            setShapes: mockSetShapes,
        }));

        const { container } = await renderMockApp();

        const confirmButton = getById(container, 'confirm-watershed-annotation');

        expect(confirmButton).toHaveAttribute('disabled');
    });

    it('shows only the labels from the supported task', async () => {
        (useTask as jest.Mock).mockImplementation(() => ({
            selectedTask: null,
            activeDomains: [],
            tasks: [
                {
                    id: '60b609e0d036ba4566726c81',
                    labels: [mockLabels[0]],
                    domain: DOMAIN.CLASSIFICATION,
                    title: 'Classification',
                },
                {
                    id: '60b609e0d036ba4566726c82',
                    labels: [mockLabels[1], mockLabels[2]],
                    domain: DOMAIN.SEGMENTATION,
                    title: 'Segmentation',
                },
            ],
        }));

        await renderMockApp();

        fireEvent.click(screen.getByLabelText('label'));

        expect(screen.getByText(BACKGROUND_LABEL.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockLabels[1].name)).toBeInTheDocument();
        expect(screen.getByText(mockLabels[2].name)).toBeInTheDocument();
        expect(screen.queryByText(mockLabels[0].name)).toBeFalsy();
    });
});
