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

import { useRef } from 'react';

import { Annotation, labelFromUser } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { LABEL_BEHAVIOUR } from '../../../../core/labels';
import { DOMAIN } from '../../../../core/projects';
import { render, screen, fakeAnnotationToolContext, fireEvent } from '../../../../test-utils';
import { getMockedAnnotation, getMockedLabel, getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { useContainerBoundingBox } from '../../hooks/use-container-bondingbox.hook';
import { EditTool } from './edit-tool.component';

jest.mock('../../providers', () => ({
    useAnnotationScene: () => ({ hasShapePointSelected: { current: false } }),
}));

jest.mock('../../hooks/use-container-bondingbox.hook', () => ({
    useContainerBoundingBox: jest.fn((roi) => roi),
}));

describe('Edit tool', (): void => {
    const tasks = [getMockedTask({ domain: DOMAIN.SEGMENTATION })];
    it('allows editing a bounding box', () => {
        const annotations: Annotation[] = [
            {
                id: 'rect-1',
                zIndex: 0,
                labels: [],
                shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 },
                isHovered: false,
                isSelected: true,
                isHidden: false,
                isLocked: false,
            },
        ];

        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });
        render(
            <svg>
                <EditTool annotationToolContext={annotationToolContext} />
            </svg>
        );

        const canvasAnnotations = screen.getByLabelText('Drag to move shape');
        expect(canvasAnnotations).toBeInTheDocument();
    });

    it('allows editing a circle', () => {
        const annotations: Annotation[] = [
            {
                id: 'circle-1',
                zIndex: 0,
                labels: [],
                shape: { shapeType: ShapeType.Circle, x: 0, y: 0, r: 0 },
                isHovered: false,
                isSelected: true,
                isHidden: false,
                isLocked: false,
            },
        ];

        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });
        render(
            <svg>
                <EditTool annotationToolContext={annotationToolContext} />
            </svg>
        );

        const canvasAnnotations = screen.getByLabelText('Drag to move shape');
        expect(canvasAnnotations).toBeInTheDocument();
    });

    it('allows editing a polygon', () => {
        const annotations: Annotation[] = [
            {
                id: 'circle-1',
                zIndex: 0,
                labels: [],
                shape: {
                    shapeType: ShapeType.Polygon,
                    points: [
                        { x: 0, y: 0 },
                        { x: 20, y: 0 },
                        { x: 20, y: 20 },
                    ],
                },
                isHovered: false,
                isSelected: true,
                isHidden: false,
                isLocked: false,
            },
        ];

        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });
        render(
            <svg>
                <EditTool annotationToolContext={annotationToolContext} />
            </svg>
        );

        const canvasAnnotations = screen.getByLabelText('Drag to move shape');
        expect(canvasAnnotations).toBeInTheDocument();
    });

    it('ignores annotations that are hidden', () => {
        const annotations: Annotation[] = [
            {
                id: 'rect-1',
                zIndex: 0,
                labels: [],
                shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 },
                isHovered: false,
                isSelected: true,
                isHidden: true,
                isLocked: false,
            },
        ];

        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });
        render(
            <svg>
                <EditTool annotationToolContext={annotationToolContext} />
            </svg>
        );

        const canvasAnnotations = screen.queryByLabelText('Drag to move shape');
        expect(canvasAnnotations).not.toBeInTheDocument();
    });

    it('stops editing when clicking outside of the annotation', () => {
        const annotations: Annotation[] = [getMockedAnnotation({ isSelected: true })];

        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });

        // Render an app with an additional canvas that the user can click on so that we can
        // simultate clicking outside of an annotation
        const EditToolApp = () => {
            const canvasRef = useRef<SVGSVGElement>(null);

            return (
                <div>
                    <svg ref={canvasRef} role='document'></svg>
                    <EditTool annotationToolContext={annotationToolContext} canvasRef={canvasRef} />
                </div>
            );
        };

        render(<EditToolApp />);
        expect(screen.getByLabelText('Drag to move shape')).toBeInTheDocument();

        const editor = screen.getByRole('document');

        // Drag with ctrl click
        fireEvent.pointerDown(editor, { ctrlKey: true });
        expect(annotationToolContext.scene.unselectAnnotation).not.toHaveBeenCalled();

        // Drag by mousehweel
        fireEvent.pointerDown(editor, { button: 1, buttons: 4 });
        expect(annotationToolContext.scene.unselectAnnotation).not.toHaveBeenCalled();

        // Click outside the annotation, thus deselecting the annotation
        fireEvent.pointerDown(editor);
        expect(annotationToolContext.scene.unselectAnnotation).toHaveBeenCalled();
    });
});

describe('editing global labels', () => {
    const image = new Image();
    image.width = 1000;
    image.height = 1000;
    describe('Detection -> Classification', () => {
        const tasks = [
            getMockedTask({
                id: 't-1',
                domain: DOMAIN.DETECTION,
                labels: [
                    getMockedLabel({ id: 'd-1', name: 'Object', behaviour: LABEL_BEHAVIOUR.LOCAL }),
                    getMockedLabel({
                        id: 'd-2',
                        name: 'Empty',
                        behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
                    }),
                ],
            }),
            getMockedTask({
                id: 't-2',
                domain: DOMAIN.CLASSIFICATION,
                labels: [
                    getMockedLabel({ id: 's-1', name: 'Deer', behaviour: LABEL_BEHAVIOUR.GLOBAL, color: 'red' }),
                    getMockedLabel({
                        id: 's-2',
                        name: 'Empty',
                        behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
                        color: 'green',
                    }),
                ],
            }),
        ];

        const labels = tasks.flatMap((task) => task.labels);

        it('only allows editing the label of a global annotation', () => {
            const roi = { x: 0, y: 0, width: image.width, height: image.height };
            jest.mocked(useContainerBoundingBox).mockImplementation(() => roi);

            const annotations: Annotation[] = [
                getMockedAnnotation({
                    id: 'rect-1',
                    shape: { shapeType: ShapeType.Rect, ...roi },
                    labels: [labelFromUser(tasks[0].labels[1])],
                    isSelected: true,
                }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, labels, image });
            render(
                <svg>
                    <EditTool annotationToolContext={annotationToolContext} />
                </svg>
            );

            const canvasAnnotations = screen.queryByLabelText('Drag to move shape');
            expect(canvasAnnotations).not.toBeInTheDocument();

            expect(screen.getByLabelText('edit-annotations')).toBeInTheDocument();
            expect(screen.getByLabelText('edit-annotations')).toHaveTextContent(annotations[0].labels[0].name);
        });

        it('does not render the shape of an empty label in task chain', () => {
            const roi = { x: 0, y: 0, width: 10, height: 10 };

            jest.mocked(useContainerBoundingBox).mockImplementation(() => roi);
            const annotations: Annotation[] = [
                getMockedAnnotation({
                    id: 'rect-1',
                    shape: { shapeType: ShapeType.Rect, ...roi },
                    labels: [labelFromUser(tasks[0].labels[0]), labelFromUser(tasks[1].labels[1])],
                    isSelected: true,
                }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({
                annotations,
                tasks,
                labels,
                image,
                selectedTask: tasks[1],
            });
            render(
                <svg>
                    <EditTool annotationToolContext={annotationToolContext} />
                </svg>
            );

            const canvasAnnotations = screen.queryByLabelText('Drag to move shape');
            expect(canvasAnnotations).not.toBeInTheDocument();

            expect(screen.getByLabelText('edit-annotations')).toBeInTheDocument();
            expect(screen.getByLabelText('edit-annotations')).toHaveTextContent(annotations[0].labels[1].name);
        });
    });

    describe('Detection -> Segmentation', () => {
        const tasks = [
            getMockedTask({
                id: 't-1',
                domain: DOMAIN.DETECTION,
                labels: [
                    getMockedLabel({ id: 'd-1', name: 'Object', behaviour: LABEL_BEHAVIOUR.LOCAL }),
                    getMockedLabel({
                        id: 'd-2',
                        name: 'Empty',
                        behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
                    }),
                ],
            }),
            getMockedTask({
                id: 't-2',
                domain: DOMAIN.SEGMENTATION,
                labels: [
                    getMockedLabel({ id: 's-1', name: 'Deer', behaviour: LABEL_BEHAVIOUR.LOCAL, color: 'red' }),
                    getMockedLabel({
                        id: 's-2',
                        name: 'Empty',
                        behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
                        color: 'green',
                    }),
                ],
            }),
        ];

        const labels = tasks.flatMap((task) => task.labels);

        it('does render the shape of a segmentation annotation without labels', () => {
            const roi = { x: 0, y: 0, width: 10, height: 10 };
            jest.mocked(useContainerBoundingBox).mockImplementation(() => roi);

            const annotations: Annotation[] = [
                getMockedAnnotation({
                    id: 'rect-1',
                    shape: { shapeType: ShapeType.Rect, ...roi },
                    labels: [labelFromUser(tasks[0].labels[0])],
                    isSelected: true,
                }),
                getMockedAnnotation({
                    id: 'rect-2',
                    shape: { shapeType: ShapeType.Rect, ...roi },
                    labels: [],
                    isSelected: true,
                }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({
                annotations,
                tasks,
                labels,
                image,
                selectedTask: tasks[1],
            });
            render(
                <svg>
                    <EditTool annotationToolContext={annotationToolContext} />
                </svg>
            );

            const canvasAnnotations = screen.queryByLabelText('Drag to move shape');
            expect(canvasAnnotations).toBeInTheDocument();
        });
    });
});
