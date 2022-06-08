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

import { ReactNode } from 'react';

import { fireEvent, screen, within } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';

import { Annotation, labelFromUser } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { Label, LABEL_BEHAVIOUR } from '../../../../core/labels';
import { DOMAIN, Task } from '../../../../core/projects';
import { providersRender as render } from '../../../../test-utils/';
import {
    getMockedAnnotation,
    getMockedLabel,
    getMockedTask,
    labels as mockedLabels,
} from '../../../../test-utils/mocked-items-factory';
import {
    AnnotationSceneProvider,
    useAnnotationScene,
} from '../annotation-scene-provider/annotation-scene-provider.component';
import { TaskChainProvider } from './task-chain-provider.component';

const IMAGE_WIDTH = 200;
const IMAGE_HEIGHT = 200;
const EMPTY_SHAPE = { shapeType: ShapeType.Rect as const, x: 0, y: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT };

// Used to mock the image ROI
jest.mock('../../providers/annotator-provider/annotator-provider.component', () => ({
    useAnnotator: () => {
        return {
            selectedMediaItem: {
                image: { x: 0, y: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
            },
        };
    },
}));

describe('TaskChainProvider', (): void => {
    const App = () => {
        const { annotations } = useAnnotationScene();
        const selectedAnnotations = annotations.filter(({ isSelected }) => isSelected);

        return (
            <ul>
                {selectedAnnotations.map((annotation) => (
                    <li key={annotation.id} aria-label={annotation.id}>
                        {annotation.id}
                    </li>
                ))}
            </ul>
        );
    };
    const detectionLabels = [getMockedLabel({ id: '1' })];
    const segmentationLabels = [getMockedLabel({ id: '2' })];

    const tasks = [
        getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: detectionLabels }),
        getMockedTask({ id: '2', domain: DOMAIN.SEGMENTATION, labels: segmentationLabels }),
    ];

    it('uses the annotation scene', () => {
        const annotations = [
            getMockedAnnotation({ id: '1', labels: [] }),
            getMockedAnnotation({ id: '2', labels: [labelFromUser(detectionLabels[0])] }),
            getMockedAnnotation({ id: '3', labels: [labelFromUser(detectionLabels[0])], isSelected: true }),
            getMockedAnnotation({
                id: '4',
                labels: [labelFromUser(segmentationLabels[0])],
                isSelected: true,
            }),
            getMockedAnnotation({
                id: '5',
                labels: [labelFromUser(segmentationLabels[0])],
            }),
        ];

        render(
            <AnnotationSceneProvider annotations={annotations} labels={mockedLabels}>
                <TaskChainProvider tasks={tasks} selectedTask={tasks[1]} defaultLabel={null}>
                    <App />
                </TaskChainProvider>
            </AnnotationSceneProvider>
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByRole('listitem', { name: '3' })).toBeInTheDocument();
        expect(screen.getByRole('listitem', { name: '4' })).toBeInTheDocument();
    });

    it('selects the last added input for a task', () => {
        const annotations = [
            getMockedAnnotation({ id: '1', labels: [] }),
            getMockedAnnotation({ id: '2', labels: [labelFromUser(detectionLabels[0])] }),
            getMockedAnnotation({ id: '3', labels: [labelFromUser(detectionLabels[0])] }),
            getMockedAnnotation({ id: '4', labels: [labelFromUser(segmentationLabels[0])], isSelected: true }),
            getMockedAnnotation({ id: '5', labels: [labelFromUser(segmentationLabels[0])] }),
        ];

        render(
            <AnnotationSceneProvider annotations={annotations} labels={mockedLabels}>
                <TaskChainProvider tasks={tasks} selectedTask={tasks[1]} defaultLabel={null}>
                    <App />
                </TaskChainProvider>
            </AnnotationSceneProvider>
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByRole('listitem', { name: '3' })).toBeInTheDocument();
        expect(screen.getByRole('listitem', { name: '4' })).toBeInTheDocument();
    });

    it("selects the task's selected input and the new annotation after drawing", () => {
        const AddShapes = () => {
            const { addShapes } = useAnnotationScene();
            const handleClick = () => {
                addShapes([{ shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 }], segmentationLabels[0]);
            };

            return <button onClick={handleClick}>Add shapes</button>;
        };
        const annotations = [
            getMockedAnnotation({ id: '1', labels: [] }),
            getMockedAnnotation({ id: '2', labels: [labelFromUser(detectionLabels[0])], isSelected: true }),
            getMockedAnnotation({ id: '3', labels: [labelFromUser(detectionLabels[0])] }),
            getMockedAnnotation({ id: '4', labels: [labelFromUser(segmentationLabels[0])], isSelected: true }),
            getMockedAnnotation({ id: '5', labels: [labelFromUser(segmentationLabels[0])] }),
        ];

        render(
            <AnnotationSceneProvider annotations={annotations} labels={mockedLabels}>
                <TaskChainProvider tasks={tasks} selectedTask={tasks[1]} defaultLabel={null}>
                    <App />
                    <AddShapes />
                </TaskChainProvider>
            </AnnotationSceneProvider>
        );

        fireEvent.click(screen.getByRole('button'));

        const listitems = screen.getAllByRole('listitem');
        expect(listitems).toHaveLength(2);
        // The inputs should still be selected
        expect(screen.getByRole('listitem', { name: '2' })).toBeInTheDocument();

        // The previous annotation should be unselected
        expect(screen.queryByRole('listitem', { name: '4' })).not.toBeInTheDocument();

        // Check that the new annotation is selected (its id is randomly generated, so we can't select it)
        annotations.forEach((annotation) => {
            expect(listitems[1]).not.toHaveAttribute('aria-label', annotation.id);
        });
    });

    describe('(un)Selecting annotations', () => {
        const SelectAnnotations = () => {
            const { annotations, selectAnnotation, unselectAnnotation } = useAnnotationScene();
            const handleClick = (annotation: Annotation) => {
                if (annotation.isSelected) {
                    unselectAnnotation(annotation.id);
                } else {
                    selectAnnotation(annotation.id);
                }
            };

            return (
                <ul>
                    {annotations.map((annotation) => (
                        <li key={annotation.id} aria-label={annotation.id}>
                            <button onClick={() => handleClick(annotation)}>
                                {annotation.isSelected ? 'Unselect' : 'Select'}
                            </button>
                        </li>
                    ))}
                </ul>
            );
        };

        it('allows selecting at most 1 task input even when they were selected from a different task', () => {
            // annotations 2 and 3 were selected in all task, but only 3 is shown
            // to be selected in the segmentation task
            const annotations = [
                getMockedAnnotation({ id: '1', labels: [] }),
                getMockedAnnotation({ id: '2', labels: [labelFromUser(detectionLabels[0])], isSelected: true }),
                getMockedAnnotation({ id: '3', labels: [labelFromUser(detectionLabels[0])], isSelected: true }),
                getMockedAnnotation({ id: '4', labels: [labelFromUser(segmentationLabels[0])], isSelected: true }),
                getMockedAnnotation({ id: '5', labels: [labelFromUser(segmentationLabels[0])] }),
            ];

            render(
                <AnnotationSceneProvider annotations={annotations} labels={mockedLabels}>
                    <TaskChainProvider tasks={tasks} selectedTask={tasks[1]} defaultLabel={null}>
                        <SelectAnnotations />
                    </TaskChainProvider>
                </AnnotationSceneProvider>
            );

            expect(screen.getByRole('listitem', { name: '2' })).toHaveTextContent('Select');
            expect(screen.getByRole('listitem', { name: '3' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '4' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '5' })).toHaveTextContent('Select');
        });

        it('allows selecting at most 1 task input', () => {
            const annotations = [
                getMockedAnnotation({ id: '1', labels: [] }),
                getMockedAnnotation({ id: '2', labels: [labelFromUser(detectionLabels[0])], isSelected: true }),
                getMockedAnnotation({ id: '3', labels: [labelFromUser(detectionLabels[0])] }),
                getMockedAnnotation({ id: '4', labels: [labelFromUser(segmentationLabels[0])], isSelected: true }),
                getMockedAnnotation({ id: '5', labels: [labelFromUser(segmentationLabels[0])] }),
            ];

            render(
                <AnnotationSceneProvider annotations={annotations} labels={mockedLabels}>
                    <TaskChainProvider tasks={tasks} selectedTask={tasks[1]} defaultLabel={null}>
                        <SelectAnnotations />
                    </TaskChainProvider>
                </AnnotationSceneProvider>
            );

            // Selecting multiple outputs is allowed
            fireEvent.click(within(screen.getByRole('listitem', { name: '5' })).getByRole('button'));
            expect(screen.getByRole('listitem', { name: '2' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '3' })).toHaveTextContent('Select');
            expect(screen.getByRole('listitem', { name: '4' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '5' })).toHaveTextContent('Unselect');

            // Selecting an input deselects the other input
            fireEvent.click(within(screen.getByRole('listitem', { name: '3' })).getByRole('button'));
            expect(screen.getByRole('listitem', { name: '2' })).toHaveTextContent('Select');
            expect(screen.getByRole('listitem', { name: '3' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '4' })).toHaveTextContent('Unselect');
            expect(screen.getByRole('listitem', { name: '5' })).toHaveTextContent('Unselect');
        });
    });
});

const wrapper = ({
    children,
    annotations,
    tasks,
    selectedTask = tasks[0],
}: {
    children?: ReactNode;
    tasks: Task[];
    selectedTask?: Task | null;
    annotations: Annotation[];
}) => {
    const labels = tasks.flatMap((task) => task.labels);
    return (
        <AnnotationSceneProvider annotations={annotations} labels={labels}>
            <TaskChainProvider tasks={tasks} selectedTask={selectedTask} defaultLabel={null}>
                {children}
            </TaskChainProvider>
        </AnnotationSceneProvider>
    );
};

describe('Empty labels', () => {
    describe('single task proejcts', () => {
        const emptyLabel = getMockedLabel({
            id: 'empty-id',
            isExclusive: true,
            group: 'empty-group',
        });
        const labels: Label[] = [...mockedLabels, emptyLabel];

        describe('classification (single global)', () => {
            const tasks = [getMockedTask({ id: '1', domain: DOMAIN.CLASSIFICATION, labels })];

            it('adds an empty label', () => {
                const annotations = [getMockedAnnotation({ id: '1', labels: [], isSelected: true })];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(emptyLabel, [result.current.annotations[0].id]);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toEqual([labelFromUser(emptyLabel)]);
            });

            it('removes labels when assigning an empty label', () => {
                const annotations = [
                    getMockedAnnotation({
                        id: '1',
                        labels: [labelFromUser(labels[1]), labelFromUser(labels[3])],
                        isSelected: true,
                    }),
                ];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(emptyLabel, [result.current.annotations[0].id]);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toEqual([labelFromUser(emptyLabel)]);
            });

            it('removes empty label when assigning a different label', () => {
                const annotations = [
                    getMockedAnnotation({
                        id: '1',
                        labels: [labelFromUser(emptyLabel)],
                        isSelected: true,
                    }),
                ];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(labels[0], [result.current.annotations[0].id]);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toEqual([labelFromUser(labels[0])]);
            });
        });

        describe('detection (single local)', () => {
            const tasks = [getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels })];

            it('adds a new empty annotation shape', () => {
                const annotations: Annotation[] = [];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(emptyLabel, []);
                });

                const expectedAnnotation = {
                    shape: EMPTY_SHAPE,
                    labels: [labelFromUser(emptyLabel)],
                    isSelected: true,
                };

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
            });

            it('can not add an empty label to an existing annotation', () => {
                const annotations: Annotation[] = [getMockedAnnotation({ id: 'non-empty' })];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(emptyLabel, [annotations[0].id]);
                });

                const expectedAnnotation = {
                    shape: EMPTY_SHAPE,
                    labels: [labelFromUser(emptyLabel)],
                    isSelected: true,
                };

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
            });

            it('removes other annotations when assigning empty label', () => {
                const annotations: Annotation[] = [
                    getMockedAnnotation({ id: 'non-empty' }),
                    getMockedAnnotation({ id: 'non-empty-2' }),
                ];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                act(() => {
                    result.current.addLabel(emptyLabel, [annotations[0].id]);
                });

                const expectedAnnotation = {
                    shape: EMPTY_SHAPE,
                    labels: [labelFromUser(emptyLabel)],
                    isSelected: true,
                };

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
            });

            it('removes the empty label when adding a new shape', () => {
                const annotations: Annotation[] = [
                    getMockedAnnotation({ id: 'empty', labels: [labelFromUser(emptyLabel)] }),
                ];
                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations },
                });

                const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                act(() => {
                    result.current.addShapes([shape], labels[0]);
                });

                const expectedAnnotation = {
                    shape,
                    labels: [labelFromUser(labels[0])],
                    isSelected: true,
                };

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
            });
        });
    });

    describe('task chain projects', () => {
        describe('detection -> classification (local -> global)', () => {
            const emptyDetectionLabel = getMockedLabel({
                id: 'empty-detection-id',
                isExclusive: true,
                group: 'empty-detection-group',
            });
            const emptyClassificationLabel = getMockedLabel({
                id: 'empty-classificatino-id',
                isExclusive: true,
                group: 'empty-classification-group',
                parentLabelId: 'card',
            });

            const [detectionLabel, ...classificationLabels] = mockedLabels;

            const tasks = [
                getMockedTask({
                    id: 'detection',
                    domain: DOMAIN.DETECTION,
                    labels: [detectionLabel, emptyDetectionLabel],
                }),
                getMockedTask({
                    id: 'classification',
                    domain: DOMAIN.CLASSIFICATION,
                    labels: [...classificationLabels, emptyClassificationLabel],
                }),
            ];

            describe('detection', () => {
                const selectedTask = tasks[0];

                it('adds a new empty annotation shape', () => {
                    const annotations: Annotation[] = [];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, []);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes other annotations when assigning empty label', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({ id: 'non-empty' }),
                        getMockedAnnotation({ id: 'non-empty-2' }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, [annotations[0].id]);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty label when adding a new shape', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({ id: 'empty', labels: [labelFromUser(emptyDetectionLabel)] }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], detectionLabel);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(detectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });
            });

            describe('classification', () => {
                const selectedTask = tasks[1];

                it('assigns an empty label to a detection annotation', () => {
                    const annotations = [
                        getMockedAnnotation({ id: '1', labels: [labelFromUser(detectionLabel)], isSelected: true }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptyClassificationLabel),
                    ]);
                });

                it('assigns an empty label to a detection annotation without specifying the annotation', () => {
                    const annotations = [
                        getMockedAnnotation({ id: '1', labels: [labelFromUser(detectionLabel)], isSelected: true }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptyClassificationLabel),
                    ]);
                });

                it('removes labels when assigning an empty label', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [
                                labelFromUser(detectionLabel),
                                labelFromUser(classificationLabels[0]),
                                labelFromUser(classificationLabels[4]),
                            ],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptyClassificationLabel),
                    ]);
                });

                it('removes empty label when assigning a different label', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptyClassificationLabel)],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(classificationLabels[4], [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(classificationLabels[0]),
                        labelFromUser(classificationLabels[4]),
                    ]);
                });

                it('does not allow adding an empty classification label without annotations', () => {
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations: [], selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(0);
                });
            });

            describe('all tasks', () => {
                const selectedTask = null;

                // empty detection label
                it('adds a new empty annotation shape', () => {
                    const annotations: Annotation[] = [];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, []);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes other annotations when assigning empty label', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({ id: 'non-empty' }),
                        getMockedAnnotation({ id: 'non-empty-2' }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, [annotations[0].id]);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty label when adding a new shape', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({ id: 'empty', labels: [labelFromUser(emptyDetectionLabel)] }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], detectionLabel);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(detectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                // empty classification label
                it('sets an empty classifiation label to a detection annotation', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, [annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptyClassificationLabel),
                    ]);
                });

                it('does not allow adding an empty classification label without input', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyClassificationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations).toEqual(annotations);
                });

                it('adds a shape with an empty label', () => {
                    const annotations: Annotation[] = [];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };

                    act(() => {
                        result.current.addShapes([shape], emptyClassificationLabel);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(detectionLabel), labelFromUser(emptyClassificationLabel)],
                        isSelected: true,
                    };
                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });
            });
        });

        describe('detection -> segmentation (local -> global)', () => {
            const emptyDetectionLabel = getMockedLabel({
                id: 'empty-detection-id',
                isExclusive: true,
                group: 'empty-detection-group',
            });
            const emptySegmentationLabel = getMockedLabel({
                id: 'empty-segmentation-id',
                isExclusive: true,
                group: 'empty-segmentation-group',
            });

            const detectionLabel = mockedLabels[0];
            const segmentationLabels = [
                { ...mockedLabels[1], parentLabelId: null },
                { ...mockedLabels[2], parentLabelId: null },
            ];

            const tasks = [
                getMockedTask({
                    id: 'detection',
                    domain: DOMAIN.DETECTION,
                    labels: [detectionLabel, emptyDetectionLabel],
                }),
                getMockedTask({
                    id: 'segmentation',
                    domain: DOMAIN.SEGMENTATION,
                    labels: [...segmentationLabels, emptySegmentationLabel],
                }),
            ];

            describe('detection', () => {
                const selectedTask = tasks[0];

                it('adds a new empty annotation shape', () => {
                    const annotations: Annotation[] = [];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, []);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes other annotations when assigning empty label', () => {
                    const annotations: Annotation[] = [
                        // Detection annotation with 2 segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 10, y: 10, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-2',
                            shape: { shapeType: ShapeType.Rect, x: 20, y: 20, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, [annotations[0].id]);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty label when adding a new shape', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({ id: 'empty', labels: [labelFromUser(emptyDetectionLabel)] }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], detectionLabel);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(detectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });
            });

            describe('segmentation', () => {
                const selectedTask = tasks[1];

                it('assigns an empty label to a detection annotation', () => {
                    const annotations = [
                        getMockedAnnotation({ id: '1', labels: [labelFromUser(detectionLabel)], isSelected: true }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                });

                it('removes labels when assigning an empty label', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel), labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                });

                it('removes empty label when assigning a different label', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(segmentationLabels[0], [result.current.annotations[0].id]);
                    });

                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(segmentationLabels[0]),
                    ]);
                });

                it('assigns an empty label to a detection annotation without specifying the annotation', () => {
                    const annotations = [
                        getMockedAnnotation({ id: '1', labels: [labelFromUser(detectionLabel)], isSelected: true }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                });

                it('assigns an empty label to a detection annotation without specifying a selected annotation', () => {
                    // We implicitly select the input annotation
                    const annotations = [getMockedAnnotation({ id: '1', labels: [labelFromUser(detectionLabel)] })];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });
                    expect(result.current.annotations[0].isSelected).toEqual(true);

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                });

                it('removes other annotations when assigning empty label', () => {
                    const annotations: Annotation[] = [
                        // Detection annotation with 2 segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: false,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 10, y: 10, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-2',
                            shape: { shapeType: ShapeType.Rect, x: 20, y: 20, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, []);
                    });

                    const expectedAnnotation = {
                        id: 'det-2',
                        shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                        labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                    };

                    expect(result.current.annotations).toHaveLength(4);
                    expect(result.current.annotations[3]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty label when adding a new shape', () => {
                    const annotations: Annotation[] = [
                        // Detection with empty segmentation
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: false,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], segmentationLabels[0]);
                    });

                    expect(result.current.annotations).toHaveLength(4);
                    expect(result.current.annotations[0].labels).toEqual([labelFromUser(detectionLabel)]);
                });

                it('does not allow adding an empty segmentation label without annotations', () => {
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations: [], selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(0);
                });
            });

            describe('all tasks', () => {
                const selectedTask = null;

                // empty detection label
                it('adds a new empty annotation shape', () => {
                    const annotations: Annotation[] = [];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, []);
                    });

                    const expectedAnnotation = {
                        shape: EMPTY_SHAPE,
                        labels: [labelFromUser(emptyDetectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes other detection annotations when assigning empty label', () => {
                    const annotations = [
                        // Detection annotation with 2 segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 10, y: 10, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-2',
                            shape: { shapeType: ShapeType.Rect, x: 20, y: 20, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptyDetectionLabel, [annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([labelFromUser(emptyDetectionLabel)]);
                    expect(result.current.annotations[0].shape).toEqual(EMPTY_SHAPE);
                });

                it('removes the empty label when adding a detection annotation', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({
                            id: 'empty',
                            labels: [labelFromUser(emptyDetectionLabel)],
                            shape: EMPTY_SHAPE,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], detectionLabel);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(detectionLabel)],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty label when adding an annotation without label', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({
                            id: 'empty',
                            labels: [labelFromUser(emptyDetectionLabel)],
                            shape: EMPTY_SHAPE,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape]);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('does not remove an empty segmentation annotation when adding a detection annotation', () => {
                    const annotations: Annotation[] = [
                        getMockedAnnotation({
                            id: 'det-1-empty-seg',
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                            shape: { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 10, height: 10 },
                        }),
                        getMockedAnnotation({
                            id: 'det-2',
                            labels: [labelFromUser(detectionLabel)],
                            shape: { shapeType: ShapeType.Rect as const, x: 30, y: 30, width: 20, height: 20 },
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 35, y: 35, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], segmentationLabels[1]);
                    });

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(segmentationLabels[1])],
                        isSelected: true,
                    };

                    expect(result.current.annotations).toHaveLength(3);
                    expect(result.current.annotations[0]).toEqual(annotations[0]);
                    expect(result.current.annotations[1]).toEqual(annotations[1]);
                    expect(result.current.annotations[2]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                // empty classification label
                it('sets an empty segmentation label to a detection annotation', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, [annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                });

                // NOTE: make sure we add the annotaiotns inside of a detection annotation, add another detection annotation
                // to be sure..
                it('removes other segmentation annotations when assigning empty label to a detection annotation', () => {
                    const annotations = [
                        // Detection annotation with 2 segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 10, y: 10, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-1-seg-2',
                            shape: { shapeType: ShapeType.Rect, x: 20, y: 20, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: true,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: true,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, [annotations[0].id]);
                    });

                    expect(result.current.annotations).toHaveLength(3);
                    expect(result.current.annotations[0].labels).toEqual([
                        labelFromUser(detectionLabel),
                        labelFromUser(emptySegmentationLabel),
                    ]);
                    expect(result.current.annotations.map(({ id }) => id)).toEqual(['det-1', 'det-2', 'det-2-seg-1']);
                });

                it('removes the empty segmentation label when adding a new shape in a detection annotation', () => {
                    const annotations = [
                        // Detection annotation without segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: false,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 35, y: 35, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape], segmentationLabels[1]);
                    });

                    expect(result.current.annotations).toHaveLength(4);
                    expect(result.current.annotations[0].labels).toEqual([labelFromUser(detectionLabel)]);
                    expect(result.current.annotations[1]).toEqual(annotations[1]);
                    expect(result.current.annotations[2]).toEqual(annotations[2]);

                    const expectedAnnotation = {
                        shape,
                        labels: [labelFromUser(segmentationLabels[1])],
                        isSelected: true,
                    };
                    expect(result.current.annotations[3]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('removes the empty segmentation label when adding a new shape without label in a detection annotation', () => {
                    const annotations = [
                        // Detection annotation without segmentation annotations
                        getMockedAnnotation({
                            id: 'det-1',
                            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                            labels: [labelFromUser(detectionLabel), labelFromUser(emptySegmentationLabel)],
                            isSelected: true,
                        }),
                        // Detection annotation with 1 segmentation annotation
                        getMockedAnnotation({
                            id: 'det-2',
                            shape: { shapeType: ShapeType.Rect, x: 150, y: 150, width: 50, height: 50 },
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: false,
                        }),
                        getMockedAnnotation({
                            id: 'det-2-seg-1',
                            shape: { shapeType: ShapeType.Rect, x: 170, y: 170, width: 10, height: 10 },
                            labels: [labelFromUser(segmentationLabels[0])],
                            isSelected: false,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    const shape = { shapeType: ShapeType.Rect as const, x: 35, y: 35, width: 10, height: 10 };
                    act(() => {
                        result.current.addShapes([shape]);
                    });

                    expect(result.current.annotations).toHaveLength(4);
                    expect(result.current.annotations[0].labels).toEqual([labelFromUser(detectionLabel)]);
                    expect(result.current.annotations[1]).toEqual(annotations[1]);
                    expect(result.current.annotations[2]).toEqual(annotations[2]);

                    const expectedAnnotation = {
                        shape,
                        labels: [],
                        isSelected: true,
                    };
                    expect(result.current.annotations[3]).toEqual(expect.objectContaining(expectedAnnotation));
                });

                it('does not allow adding an empty classification label without input', () => {
                    const annotations = [
                        getMockedAnnotation({
                            id: '1',
                            labels: [labelFromUser(detectionLabel)],
                            isSelected: false,
                        }),
                    ];
                    const { result } = renderHook(() => useAnnotationScene(), {
                        wrapper,
                        initialProps: { tasks, annotations, selectedTask },
                    });

                    act(() => {
                        result.current.addLabel(emptySegmentationLabel, []);
                    });

                    expect(result.current.annotations).toHaveLength(1);
                    expect(result.current.annotations).toEqual(annotations);
                });
            });

            it('does not allow adding a detection label to a circle', () => {
                const selectedTask = tasks[0];
                const shape = {
                    shapeType: ShapeType.Circle as const,
                    x: 0,
                    y: 0,
                    r: 10,
                };

                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations: [], selectedTask },
                });

                act(() => {
                    result.current.addShapes([shape], detectionLabel);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toHaveLength(0);
            });

            it('does not allow adding a detection label to a polygon', () => {
                const selectedTask = tasks[0];
                const shape = {
                    shapeType: ShapeType.Polygon as const,
                    points: [
                        { x: 0, y: 0 },
                        { x: 0, y: 10 },
                        { x: 10, y: 10 },
                    ],
                };

                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations: [], selectedTask },
                });

                act(() => {
                    result.current.addShapes([shape], detectionLabel);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toHaveLength(0);
            });

            it('does not allow adding a detection label to an existing circle', () => {
                const selectedTask = tasks[0];
                const annotations = [
                    getMockedAnnotation({
                        shape: { shapeType: ShapeType.Circle, x: 0, y: 0, r: 10 },
                        labels: [],
                        isSelected: true,
                    }),
                ];

                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations, selectedTask },
                });

                act(() => {
                    result.current.addLabel(detectionLabel, [annotations[0].id]);
                });

                expect(result.current.annotations).toHaveLength(1);
                expect(result.current.annotations[0].labels).toHaveLength(0);
            });

            it('does not allow adding a detection label to an existing polygon', () => {
                const selectedTask = tasks[0];
                const annotations = [
                    getMockedAnnotation({
                        id: '1',
                        shape: {
                            shapeType: ShapeType.Polygon,
                            points: [
                                { x: 0, y: 0 },
                                { x: 0, y: 10 },
                                { x: 10, y: 10 },
                            ],
                        },
                        labels: [],
                        isSelected: true,
                    }),
                    getMockedAnnotation({
                        id: '2',
                        shape: { shapeType: ShapeType.Circle, x: 0, y: 0, r: 10 },
                        labels: [],
                        isSelected: true,
                    }),
                ];

                const { result } = renderHook(() => useAnnotationScene(), {
                    wrapper,
                    initialProps: { tasks, annotations, selectedTask },
                });

                act(() => {
                    result.current.addLabel(detectionLabel, [annotations[0].id, annotations[1].id]);
                });

                expect(result.current.annotations).toHaveLength(2);
                expect(result.current.annotations[0].labels).toHaveLength(0);
                expect(result.current.annotations[1].labels).toHaveLength(0);
            });
        });
    });
});

describe('Anomaly localization tasks', () => {
    const normalLabel = getMockedLabel({
        id: 'normal-label-id',
        name: 'Normal',
        behaviour: LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL,
    });

    const anomalousLabel = getMockedLabel({
        id: 'anomalous-label-id',
        name: 'Anomalous',
        behaviour: LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.ANOMALOUS,
    });

    const tasks = [
        getMockedTask({
            id: 'anomaly-segmentation',
            domain: DOMAIN.ANOMALY_SEGMENTATION,
            labels: [normalLabel, anomalousLabel],
        }),
    ];

    it('Adds a global anomalous label', () => {
        const selectedTask = tasks[0];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations: [], selectedTask },
        });

        act(() => {
            result.current.addLabel(anomalousLabel, []);
        });

        expect(result.current.annotations).toHaveLength(1);
        expect(result.current.annotations[0].shape).toEqual(EMPTY_SHAPE);
        expect(result.current.annotations[0].labels).toEqual([labelFromUser(anomalousLabel)]);
    });

    it('Does not remove existing anomalous annotations when attempting to add a global anomalous annotation', () => {
        const selectedTask = tasks[0];

        const annotations = [
            getMockedAnnotation({
                id: 'empty-normal-annotation',
                shape: EMPTY_SHAPE,
                labels: [labelFromUser(anomalousLabel)],
            }),
            getMockedAnnotation({ id: 'annotation-1', labels: [labelFromUser(anomalousLabel)] }),
        ];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations, selectedTask },
        });

        act(() => {
            result.current.addLabel(anomalousLabel, []);
        });

        expect(result.current.annotations).toHaveLength(2);
        expect(result.current.annotations).toEqual(annotations);
    });

    it('Does not remove existing anomalous annotations when adding a global anomalous annotation', () => {
        const selectedTask = tasks[0];

        const annotations = [getMockedAnnotation({ id: 'annotation-1', labels: [labelFromUser(anomalousLabel)] })];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations, selectedTask },
        });

        act(() => {
            result.current.addLabel(anomalousLabel, []);
        });

        expect(result.current.annotations).toHaveLength(2);
        expect(result.current.annotations[0]).toEqual(annotations[0]);
        expect(result.current.annotations[1].shape).toEqual(EMPTY_SHAPE);
    });

    it('Adds a global anomalous label when adding a local anomalous label', () => {
        const selectedTask = tasks[0];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations: [], selectedTask },
        });

        const shape = { shapeType: ShapeType.Rect, x: 10, y: 10, width: 30, height: 30 } as const;

        act(() => {
            result.current.addShapes([shape], anomalousLabel);
        });

        expect(result.current.annotations).toHaveLength(2);

        // First a global label should have been added
        expect(result.current.annotations[0].shape).toEqual(EMPTY_SHAPE);
        expect(result.current.annotations[0].labels).toEqual([labelFromUser(anomalousLabel)]);

        // Next the shape we wanted to add should have been added
        expect(result.current.annotations[1].shape).toEqual(shape);
        expect(result.current.annotations[1].labels).toEqual([labelFromUser(anomalousLabel)]);
    });

    it('Does not add a second global anomalous label when adding a local anomalous label', () => {
        const selectedTask = tasks[0];
        const annotations = [
            getMockedAnnotation({
                id: 'global-anomalous-annotation',
                shape: EMPTY_SHAPE,
                labels: [labelFromUser(anomalousLabel)],
            }),
        ];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations, selectedTask },
        });

        const shape = { shapeType: ShapeType.Rect, x: 10, y: 10, width: 30, height: 30 } as const;

        act(() => {
            result.current.addShapes([shape], anomalousLabel);
        });

        expect(result.current.annotations).toHaveLength(2);

        // The global anomalous label should have remained
        expect(result.current.annotations[0].shape).toEqual(EMPTY_SHAPE);
        expect(result.current.annotations[0].labels).toEqual([labelFromUser(anomalousLabel)]);

        // Next the shape we wanted to add should have been added
        expect(result.current.annotations[1].shape).toEqual(shape);
        expect(result.current.annotations[1].labels).toEqual([labelFromUser(anomalousLabel)]);
    });

    it('Replaces a global nomral label when adding a local anomalous label', () => {
        const selectedTask = tasks[0];
        const annotations = [
            getMockedAnnotation({
                id: 'empty-normal-annotation',
                shape: EMPTY_SHAPE,
                labels: [labelFromUser(normalLabel)],
            }),
        ];

        const { result } = renderHook(() => useAnnotationScene(), {
            wrapper,
            initialProps: { tasks, annotations, selectedTask },
        });

        const shape = { shapeType: ShapeType.Rect, x: 10, y: 10, width: 30, height: 30 } as const;

        act(() => {
            result.current.addShapes([shape], anomalousLabel);
        });

        expect(result.current.annotations).toHaveLength(2);

        // The normal label should have been replaced by a global anomalous label
        expect(result.current.annotations[0].shape).toEqual(EMPTY_SHAPE);
        expect(result.current.annotations[0].labels).toEqual([labelFromUser(anomalousLabel)]);

        // Next the shape we wanted to add should have been added
        expect(result.current.annotations[1].shape).toEqual(shape);
        expect(result.current.annotations[1].labels).toEqual([labelFromUser(anomalousLabel)]);
    });
});
