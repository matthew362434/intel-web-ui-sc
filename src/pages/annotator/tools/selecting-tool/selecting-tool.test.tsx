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

import { render, fireEvent, screen } from '@testing-library/react';

import { labelFromUser } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedTask,
    labels as mockedLabels,
} from '../../../../test-utils/mocked-items-factory';
import { AnnotationToolContext } from '../../core';
import { AnnotationSceneProvider, useAnnotationScene } from '../../providers';
import { useSelectingState } from './selecting-state-provider.component';
import { SelectingTool } from './selecting-tool.component';
import { SelectingToolType } from './selecting-tool.enums';

jest.mock('./selecting-state-provider.component', () => {
    const actual = jest.requireActual('./selecting-state-provider.component');
    return {
        ...actual,
        useSelectingState: jest.fn(),
    };
});

jest.mock('./components/brush-tool.component', () => {
    const actual = jest.requireActual('./components/brush-tool.component');
    return {
        ...actual,
        BrushTool: () => <p>[BrushTool]</p>,
    };
});

describe('SelectingTool', () => {
    beforeEach(() => {
        (useSelectingState as jest.Mock).mockReturnValue({
            brushSize: 20,
            activeTool: SelectingToolType.SelectionTool,
        });
    });
    const drawRect = (x: number, y: number, width: number, height: number) => {
        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: x, clientY: y });
        fireEvent.pointerDown(svg, { buttons: 1, clientX: x, clientY: y });

        const rect = screen.getByRole('application');
        expect(rect).toHaveAttribute('x', `${x}`);
        expect(rect).toHaveAttribute('y', `${y}`);
        expect(rect).toHaveAttribute('width', '0');
        expect(rect).toHaveAttribute('height', '0');

        fireEvent.pointerMove(svg, { clientX: x + width, clientY: y + height });
        expect(rect).toHaveAttribute('x', `${x}`);
        expect(rect).toHaveAttribute('y', `${y}`);
        expect(rect).toHaveAttribute('width', `${width}`);
        expect(rect).toHaveAttribute('height', `${height}`);

        fireEvent.pointerUp(svg);
    };

    // While we could use the spies from the annotationToolContext to check
    // that the selection tool properly updates the isSelected state of the annotations,
    // this makes it more difficult to refactor the selection tool to use different
    // methods to update the isSelected status (which is the goal of the current task)
    const renderWithScene = (annotationToolContext: AnnotationToolContext) => {
        const App = () => {
            const scene = useAnnotationScene();
            const selectedAnnotations = scene.annotations.filter(({ isSelected }) => isSelected);

            return (
                <>
                    <SelectingTool annotationToolContext={{ ...annotationToolContext, scene }} />
                    {/* This is used to check that we don't remove annotations in a task chain */}
                    <span>{`Selected ${selectedAnnotations.length} of ${scene.annotations.length} annotations`}</span>
                    <ul>
                        {selectedAnnotations.map((annotation) => (
                            <li key={annotation.id}>{annotation.id}</li>
                        ))}
                    </ul>
                </>
            );
        };

        render(
            <AnnotationSceneProvider
                annotations={annotationToolContext.scene.annotations}
                labels={annotationToolContext.scene.labels}
            >
                <App />
            </AnnotationSceneProvider>
        );
    };

    it('renders BrushTool when activeTool is SelectingToolType.BrushTool', () => {
        (useSelectingState as jest.Mock).mockReturnValue({
            activeTool: SelectingToolType.BrushTool,
            brushSize: 20,
        });
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [
                getMockedAnnotation({
                    id: '1',
                    shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                    isSelected: false,
                    zIndex: 1,
                }),
            ],
        });
        renderWithScene(annotationToolContext);
        expect(screen.queryByText('[BrushTool]')).toBeInTheDocument();
    });

    describe('clicking', () => {
        it('selects an annotation by clicking', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);
            expect(screen.queryAllByRole('listitem')).toHaveLength(0);

            const svg = screen.getByRole('editor');
            const pointOverFirstAnnotation = { clientX: 0, clientY: 0 };
            fireEvent.pointerDown(svg, pointOverFirstAnnotation);
            fireEvent.pointerUp(svg, pointOverFirstAnnotation);

            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByRole('listitem')).toHaveTextContent('1');
        });

        it('unselects previous annotation and selects new annotation by clicking', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: true,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);

            const svg = screen.getByRole('editor');

            const pointOverlapping = { clientX: 10, clientY: 10 };
            fireEvent.pointerDown(svg, pointOverlapping);
            fireEvent.pointerUp(svg, pointOverlapping);

            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByRole('listitem')).toHaveTextContent('2');
        });

        it('selects additional annotations by shift clicking', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: true,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);
            expect(screen.queryAllByRole('listitem')).toHaveLength(1);

            const svg = screen.getByRole('editor');

            const pointOverlapping = { clientX: 10, clientY: 10, shiftKey: true };
            fireEvent.pointerDown(svg, pointOverlapping);
            fireEvent.pointerUp(svg, pointOverlapping);

            expect(screen.getAllByRole('listitem')).toHaveLength(2);

            // Shift clicking on an selected label deselects it
            fireEvent.pointerDown(svg, pointOverlapping);
            fireEvent.pointerUp(svg, pointOverlapping);

            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByRole('listitem')).toHaveTextContent('1');
        });
    });

    describe('drawing a selection region', () => {
        it('selects annotations by drawing a selection region', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);
            expect(screen.queryAllByRole('listitem')).toHaveLength(0);

            drawRect(0, 0, 20, 20);
            expect(screen.queryAllByRole('listitem')).toHaveLength(2);
        });

        it('resets selection by drawing a selection region', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: true,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);
            expect(screen.queryAllByRole('listitem')).toHaveLength(1);

            drawRect(22, 22, 30, 30);
            expect(screen.queryAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByRole('listitem')).toHaveTextContent('2');
        });

        it('adds selection by drawing a selection region while pressing shift', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: true,
                        zIndex: 1,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { x: 10, y: 10, width: 20, height: 20, shapeType: ShapeType.Rect },
                        isSelected: false,
                        zIndex: 2,
                    }),
                ],
            });

            renderWithScene(annotationToolContext);
            expect(screen.queryAllByRole('listitem')).toHaveLength(1);

            const svg = screen.getByRole('editor');
            fireEvent.keyDown(svg, { key: 'Shift', shiftKey: true });
            drawRect(22, 22, 30, 30);
            expect(screen.queryAllByRole('listitem')).toHaveLength(2);
        });
    });

    describe('task chain aware', () => {
        const [firstLabel, ...otherLabels] = mockedLabels;
        const tasks = [
            getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: [firstLabel] }),
            getMockedTask({ id: '2', domain: DOMAIN.SEGMENTATION, labels: otherLabels }),
        ];

        // For convenience we only consider rects for the first task and circles in the second task
        const annotations = [
            getMockedAnnotation({
                id: '1',
                shape: { x: 0, y: 0, width: 20, height: 20, shapeType: ShapeType.Rect },
                labels: [labelFromUser(firstLabel)],
                isSelected: true,
                zIndex: 1,
            }),
            getMockedAnnotation({
                id: '2',
                shape: { x: 5, y: 5, r: 5, shapeType: ShapeType.Circle },
                labels: [labelFromUser(otherLabels[0])],
                isSelected: false,
                zIndex: 2,
            }),
            getMockedAnnotation({
                id: '3',
                shape: { x: 10, y: 10, r: 5, shapeType: ShapeType.Circle },
                labels: [labelFromUser(otherLabels[0])],
                isSelected: false,
                zIndex: 3,
            }),
            // Other bounding box that's not active
            getMockedAnnotation({
                id: '4',
                shape: { x: 30, y: 30, width: 20, height: 20, shapeType: ShapeType.Rect },
                labels: [labelFromUser(firstLabel)],
                isSelected: false,
                zIndex: 1,
            }),
            getMockedAnnotation({
                id: '5',
                shape: { x: 35, y: 35, r: 5, shapeType: ShapeType.Circle },
                labels: [labelFromUser(otherLabels[0])],
                isSelected: false,
                zIndex: 2,
            }),
            getMockedAnnotation({
                id: '6',
                shape: { x: 40, y: 40, r: 5, shapeType: ShapeType.Circle },
                labels: [labelFromUser(otherLabels[0])],
                isSelected: false,
                zIndex: 3,
            }),
        ];

        // Do this to verify that we won't "delete" annotations from other tasks
        it('selects annotations from the current task', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations,
                tasks,
                selectedTask: tasks[1],
            });
            renderWithScene(annotationToolContext);

            const svg = screen.getByRole('editor');
            const point = { clientX: 5, clientY: 5 };
            fireEvent.pointerDown(svg, point);
            fireEvent.pointerUp(svg, point);

            // Verify that we don't remove annotations that are not selectable
            expect(screen.getByText(`Selected 2 of 6 annotations`)).toBeInTheDocument();
            expect(screen.queryAllByRole('listitem')).toHaveLength(2);

            const secondAnnotation = { clientX: 10, clientY: 10, shiftKey: true };
            fireEvent.pointerDown(svg, secondAnnotation);
            fireEvent.pointerUp(svg, secondAnnotation);

            expect(screen.getByText(`Selected 3 of 6 annotations`)).toBeInTheDocument();
            expect(screen.queryAllByRole('listitem')).toHaveLength(3);
        });

        it('only selects annotations from the current task', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations,
                tasks,
                selectedTask: tasks[1],
            });
            renderWithScene(annotationToolContext);

            const svg = screen.getByRole('editor');

            drawRect(0, 0, 5, 5);

            // Verify that we don't remove annotations that are not selectable
            expect(screen.getByText(`Selected 2 of 6 annotations`)).toBeInTheDocument();
            expect(screen.queryAllByRole('listitem')).toHaveLength(2);

            fireEvent.keyDown(svg, { key: 'Shift', shiftKey: true });
            drawRect(10, 10, 5, 5);

            expect(screen.getByText(`Selected 3 of 6 annotations`)).toBeInTheDocument();
            expect(screen.queryAllByRole('listitem')).toHaveLength(3);
        });
    });
});
