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

import { waitForElementToBeRemoved } from '@testing-library/react';
import difference from 'lodash/difference';
import { TransformComponent } from 'react-zoom-pan-pinch';

import { DETECTION_DOMAINS, DOMAIN, SEGMENTATION_DOMAINS } from '../../../../core/projects';
import { fakeAnnotationToolContext, fireEvent, screen, within } from '../../../../test-utils';
import {
    getMockedProject,
    getMockedTask,
    mockedProjectContextProps,
} from '../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../project-details/providers';
import { AnnotationToolContext, ANNOTATOR_MODE, ToolLabel } from '../../core';
import { useActiveTool } from '../../providers';
import { annotatorRender } from '../../test-utils/annotator-render';
import { ZoomProvider } from '../../zoom';
import { PrimaryToolbar } from './primary-toolbar.component';

jest.mock('../../../project-details/providers', () => ({
    ...jest.requireActual('../../../project-details/providers'),
    useProject: jest.fn(() => mockedProjectContextProps({})),
}));

describe('Primary toolbar', (): void => {
    const App = ({ annotationToolContext }: { annotationToolContext?: AnnotationToolContext }) => {
        const [activeTool, setActiveTool] = useActiveTool(ANNOTATOR_MODE.ANNOTATION);
        const mockContext = fakeAnnotationToolContext({
            activeDomains: [DOMAIN.SEGMENTATION],
            mode: ANNOTATOR_MODE.ANNOTATION,
            toggleTool: setActiveTool,
            ...annotationToolContext,
            tool: activeTool,
        });

        return (
            <ZoomProvider>
                <PrimaryToolbar annotationToolContext={mockContext} />
                <TransformComponent>{''}</TransformComponent>
            </ZoomProvider>
        );
    };

    const render = async (annotationToolContext?: AnnotationToolContext) => {
        annotatorRender(<App annotationToolContext={annotationToolContext} />);

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    };

    it('selects the circle tool', async () => {
        await render();

        const circleButton = screen.getByRole('button', { name: /Circle tool/ });

        expect(circleButton).not.toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(circleButton);
        expect(circleButton).toHaveAttribute('aria-pressed', 'true');
    });

    describe('supported tools by domain', () => {
        const tools = Object.keys(ToolLabel);
        const toolsAndSupportedDomains = [
            [DOMAIN.SEGMENTATION, [ToolLabel.BoxTool, ToolLabel.CircleTool, ToolLabel.PolygonTool]],
            [DOMAIN.SEGMENTATION_INSTANCE, [ToolLabel.BoxTool, ToolLabel.CircleTool, ToolLabel.PolygonTool]],

            [DOMAIN.DETECTION, [ToolLabel.BoxTool]],
            [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX, [ToolLabel.RotatedBoxTool]],

            [DOMAIN.CLASSIFICATION, []],

            [DOMAIN.ANOMALY_CLASSIFICATION, []],
            [DOMAIN.ANOMALY_DETECTION, []],
            [DOMAIN.ANOMALY_SEGMENTATION, []],
        ];

        test.each(toolsAndSupportedDomains)('renders correct tools for %o', async (domain, domainTools) => {
            const mockContext = fakeAnnotationToolContext({
                activeDomains: [domain as DOMAIN],
            });

            await render(mockContext);

            const nonSupportedTools = difference(tools, domainTools);

            (domainTools as ToolLabel[]).forEach((tool) => {
                expect(screen.getByRole('button', { name: tool })).toBeInTheDocument();
            });

            nonSupportedTools.forEach((tool) => {
                expect(screen.queryByRole('button', { name: tool })).not.toBeInTheDocument();
            });
        });
    });

    it('shows tools for a classification -> segmentation task chain', async () => {
        const mockContext = fakeAnnotationToolContext({
            activeDomains: [DOMAIN.CLASSIFICATION, DOMAIN.SEGMENTATION],
        });

        await render(mockContext);

        expect(screen.getByRole('button', { name: /^Bounding Box tool$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Rotated Bounding Box tool$/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Circle tool/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Polygon tool/ })).toBeInTheDocument();
    });

    it('shows tools for a detection -> segmentation task chain', async () => {
        const mockContext = fakeAnnotationToolContext({
            activeDomains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
        });

        await render(mockContext);

        expect(screen.getByRole('button', { name: /^Bounding Box tool$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Rotated Bounding Box tool$/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Circle tool/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Polygon tool/ })).toBeInTheDocument();
    });

    it('should disable tools if user is on the second task without any input from the first one', async () => {
        const mockTaskOne = getMockedTask({ id: 'task-1', domain: DOMAIN.DETECTION });
        const mockTaskTwo = getMockedTask({ id: 'task-2', domain: DOMAIN.SEGMENTATION });

        const mockContext = fakeAnnotationToolContext({
            activeDomains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
            tasks: [mockTaskOne, mockTaskTwo],
            selectedTask: mockTaskTwo,
        });

        await render(mockContext);

        const drawingToolsButtons = within(screen.getByTestId('drawing-tools-container')).getAllByRole('button');
        const undoRedoButtons = within(screen.getByTestId('undo-redo-tools')).getAllByRole('button');

        drawingToolsButtons.forEach((button) => expect(button).toBeDisabled());
        undoRedoButtons.forEach((button) => expect(button).toBeDisabled());
    });

    describe('tools selected by default based on the project type', () => {
        it('Rotated bounding box tool should be selected by default in detection oriented project', async () => {
            const mockedTask = getMockedTask({ id: 'task-1', domain: DOMAIN.DETECTION_ROTATED_BOUNDING_BOX });
            const mockedContext = fakeAnnotationToolContext({
                activeDomains: [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX],
                tasks: [mockedTask],
            });

            jest.mocked(useProject).mockImplementation(() =>
                mockedProjectContextProps({ project: getMockedProject({ tasks: [mockedTask] }) })
            );

            await render(mockedContext);

            expect(screen.getByRole('button', { name: /Rotated Bounding Box tool$/ })).toHaveAttribute(
                'aria-pressed',
                'true'
            );
        });

        it.each(SEGMENTATION_DOMAINS)(
            'Polygon tool should be selected by default for segmentation projects',
            async (domain) => {
                const mockedTask = getMockedTask({ id: 'task-1', domain });
                const mockedContext = fakeAnnotationToolContext({
                    activeDomains: [domain],
                    tasks: [mockedTask],
                });

                jest.mocked(useProject).mockImplementation(() =>
                    mockedProjectContextProps({ project: getMockedProject({ tasks: [mockedTask] }) })
                );

                await render(mockedContext);

                expect(screen.getByRole('button', { name: /Polygon tool$/ })).toHaveAttribute('aria-pressed', 'true');
            }
        );

        it.each(DETECTION_DOMAINS)(
            'Bounding box tool is selected by default for detection projects',
            async (domain) => {
                const mockedTask = getMockedTask({ id: 'task-1', domain });
                const mockedContext = fakeAnnotationToolContext({
                    tasks: [getMockedTask({ id: 'task-1', domain })],
                    activeDomains: [domain],
                });

                jest.mocked(useProject).mockImplementation(() =>
                    mockedProjectContextProps({ project: getMockedProject({ tasks: [mockedTask] }) })
                );

                await render(mockedContext);

                expect(screen.getByRole('button', { name: /^Bounding Box tool$/ })).toHaveAttribute(
                    'aria-pressed',
                    'true'
                );
            }
        );
    });
});
