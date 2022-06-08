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

import { ReactNode, useEffect } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Annotation, labelFromModel, labelFromUser } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { DOMAIN, ProjectProps, Task } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedLabel,
    getMockedProject,
    getMockedTask,
} from '../../../../test-utils/mocked-items-factory';
import {
    ProjectContextProps,
    useProject,
} from '../../../project-details/providers/project-provider/project-provider.component';
import { AnnotationSceneProvider } from '../annotation-scene-provider/annotation-scene-provider.component';
import { TaskChainProvider } from '../task-chain-provider/task-chain-provider.component';
import { TaskProvider, useTask } from '../task-provider/task-provider.component';
import { PredictionProvider, usePrediction } from './prediction-provider.component';

jest.mock('../../providers/annotator-provider/annotator-provider.component', () => ({
    useAnnotator: () => ({ setMode: jest.fn() }),
}));

jest.mock('../../../project-details/providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../../project-details/providers/project-provider/project-provider.component'),
    useProject: jest.fn(),
}));

// This component automatically selects the given task so that we don't need to mock
// the TaskProvider's `useTask` hook
const SelectTask = ({ task }: { task: Task | null }) => {
    const { selectedTask, setSelectedTask } = useTask();

    useEffect(() => {
        if (task?.id !== selectedTask?.id) {
            setSelectedTask(task);
        }
    }, [selectedTask, setSelectedTask, task]);

    return <></>;
};

const wrapper = ({
    children,
    saveAnnotations,
    tasks,
    selectedTask = tasks[0],
    userAnnotations = [],
    predictionAnnotations = [],
    project,
}: {
    children?: ReactNode;
    project: ProjectProps;
    saveAnnotations: (annotations: ReadonlyArray<Annotation>) => Promise<void>;
    tasks: Task[];
    selectedTask?: Task | null;
    userAnnotations: Annotation[];
    predictionAnnotations: Annotation[];
}) => {
    const labels = tasks.flatMap((task) => task.labels);
    const { scene: predictionScene } = fakeAnnotationToolContext({ annotations: predictionAnnotations });
    const { scene: userScene } = fakeAnnotationToolContext({ annotations: userAnnotations });
    const refresh = jest.fn();

    // For these tests we only care that the prediction provider uses the correct project
    jest.mocked(useProject).mockImplementation(() => {
        return {
            isSingleDomainProject: (domain: DOMAIN) => project.tasks.length === 1 && project.tasks[0].domain === domain,
            project,
        } as ProjectContextProps;
    });

    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <TaskProvider>
                <SelectTask task={selectedTask} />
                <AnnotationSceneProvider annotations={predictionAnnotations} labels={labels}>
                    <TaskChainProvider tasks={tasks} selectedTask={selectedTask} defaultLabel={null}>
                        <PredictionProvider
                            initialPredictionAnnotations={predictionAnnotations}
                            predictionAnnotationScene={predictionScene}
                            userAnnotationScene={userScene}
                            maps={[]}
                            refreshPredictions={refresh}
                            saveAnnotations={saveAnnotations}
                        >
                            {children}
                        </PredictionProvider>
                    </TaskChainProvider>
                </AnnotationSceneProvider>
            </TaskProvider>
        </QueryClientProvider>
    );
};

describe('PredictionProvider', () => {
    const detectionLabels = [getMockedLabel({ id: 'detection-1', group: 'detection' })];
    const segmentationLabels = [getMockedLabel({ id: 'segmentation-1', group: 'segmentation' })];
    const classificationLabels = [
        getMockedLabel({ id: 'classification-1', group: 'classification', parentLabelId: 'detection-1' }),
        getMockedLabel({ id: 'classification-2', group: 'classification', parentLabelId: 'detection-1' }),
        getMockedLabel({ id: 'classification-3', group: 'classification-group-2', parentLabelId: 'detection-1' }),
    ];

    describe('single classification task', () => {
        const tasks = [getMockedTask({ id: '1', domain: DOMAIN.CLASSIFICATION, labels: classificationLabels })];
        const project = getMockedProject({
            tasks,
            domains: tasks.map(({ domain }) => domain),
        });

        it('replaces predictions from classification', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [getMockedAnnotation({ id: 'prediction-1' })];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            // Since this is a classification project its annotation is automatically selected
            expect(saveAnnotations).toHaveBeenCalledWith([
                {
                    ...predictionAnnotations[0],
                    isSelected: true,
                },
            ]);
        });

        // NOTE: this is a hacky test, mergin classification annotations is not supported as this would not make sense,
        // for our current design: a classification scene can only have 1 annotation
        it('merges predictions from classification', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [
                getMockedAnnotation({ id: 'user-1', labels: [labelFromModel(classificationLabels[0], 0.2)] }),
            ];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            // Since this is a classification project its annotation is automatically selected
            const expectedAnnotations = [
                {
                    ...predictionAnnotations[0],
                    isSelected: true,
                },
            ];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });
    });

    describe('single detection task', () => {
        const tasks = [getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: detectionLabels })];
        const project = getMockedProject({ tasks, domains: tasks.map(({ domain }) => domain) });

        it('replaces predictions from detection', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [getMockedAnnotation({ id: 'prediction-1' })];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            expect(saveAnnotations).toHaveBeenCalledWith(predictionAnnotations);
        });

        it('merges predictions from detection', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [getMockedAnnotation({ id: 'prediction-1' })];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [userAnnotations[0], predictionAnnotations[0]];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });
    });

    describe('single segmentation', () => {
        const tasks = [getMockedTask({ id: '1', domain: DOMAIN.SEGMENTATION, labels: segmentationLabels })];
        const project = getMockedProject({ tasks, domains: tasks.map(({ domain }) => domain) });

        it('replaces predictions from segmentation', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [getMockedAnnotation({ id: 'prediction-1' })];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            expect(saveAnnotations).toHaveBeenCalledWith(predictionAnnotations);
        });

        it('merges predictions from segmentation', () => {
            const userAnnotations = [getMockedAnnotation({ id: 'user-1' })];
            const predictionAnnotations = [getMockedAnnotation({ id: 'prediction-1' })];

            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [userAnnotations[0], predictionAnnotations[0]];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });
    });

    describe('detection -> classification', () => {
        const tasks = [
            getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: detectionLabels }),
            getMockedTask({ id: '2', domain: DOMAIN.CLASSIFICATION, labels: classificationLabels }),
        ];

        const project = getMockedProject({ tasks, domains: tasks.map(({ domain }) => domain) });

        // These inputs are used by most of these tests by both the user and prediction annotations
        const inputs = [
            getMockedAnnotation({
                id: 'user-1',
                shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                labels: [labelFromUser(detectionLabels[0])],
                isSelected: true,
            }),
            getMockedAnnotation({
                id: 'user-2',
                shape: { shapeType: ShapeType.Rect, x: 100, y: 100, width: 100, height: 100 },
                labels: [labelFromUser(detectionLabels[0])],
            }),
        ];

        it('replaces annotations in "All tasks" mode', () => {
            const saveAnnotations = jest.fn();

            const userAnnotations = [
                inputs[0],
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[2])] },
            ];

            const predictionAnnotations = [
                { ...inputs[0], labels: [...inputs[0].labels, labelFromUser(classificationLabels[0])] },
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[1])] },
            ];

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                    selectedTask: null,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            expect(saveAnnotations).toHaveBeenCalledWith(predictionAnnotations);
        });

        it('replaces detection annotations', () => {
            const saveAnnotations = jest.fn();

            // Replace the single detection annotation with two detection annotations
            const userAnnotations = [inputs[0]];
            const predictionAnnotations = [inputs[0], inputs[1]];

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            // Any outputs will have been removed
            const expectedAnnotations = predictionAnnotations;
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('replaces classification annotations inside a selected input', () => {
            const selectedTask = tasks[1];

            const saveAnnotations = jest.fn();

            const userAnnotations = [
                inputs[0],
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[2])] },
            ];

            const predictionAnnotations = [
                { ...inputs[0], labels: [...inputs[0].labels, labelFromUser(classificationLabels[0])] },
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[1])] },
            ];

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            const expectedAnnotations = [predictionAnnotations[0], userAnnotations[1]];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges annotations in "All tasks" mode', () => {
            const saveAnnotations = jest.fn();
            const userAnnotations = [
                inputs[0],
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[2])] },
            ];

            const predictionAnnotations = [
                { ...inputs[0], labels: [...inputs[0].labels, labelFromUser(classificationLabels[0])] },
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[1])] },
                getMockedAnnotation({
                    id: 'prediction-3',
                    shape: { shapeType: ShapeType.Rect, x: 200, y: 200, width: 100, height: 100 },
                    labels: [labelFromUser(detectionLabels[0])],
                }),
            ];

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                    selectedTask: null,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [
                predictionAnnotations[0],
                // Check that we include both the classification label from the user's annotation and prediction annotation
                {
                    ...inputs[1],
                    labels: [
                        ...inputs[1].labels,
                        labelFromUser(classificationLabels[2]),
                        labelFromUser(classificationLabels[1]),
                    ],
                },
                predictionAnnotations[2],
            ];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges detection annotations', () => {
            const saveAnnotations = jest.fn();
            const userAnnotations = [
                inputs[0],
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[2])] },
            ];

            const predictionAnnotations = [
                { ...inputs[1], labels: [labelFromModel(detectionLabels[0], 0.2)] },
                getMockedAnnotation({
                    id: 'prediction-3',
                    shape: { shapeType: ShapeType.Rect, x: 200, y: 200, width: 100, height: 100 },
                    labels: [labelFromUser(detectionLabels[0])],
                }),
            ];

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            // NOTE: The score from the first predicted annotation does not replace the user's annotation
            const expectedAnnotations = [...userAnnotations, predictionAnnotations[1]];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges classification annotations inside a selected input', () => {
            const saveAnnotations = jest.fn();
            const userAnnotations = [
                inputs[0],
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[2])] },
            ];

            const predictionAnnotations = [
                { ...inputs[0], labels: [...inputs[0].labels, labelFromUser(classificationLabels[0])] },
                { ...inputs[1], labels: [...inputs[1].labels, labelFromUser(classificationLabels[1])] },
                getMockedAnnotation({
                    id: 'prediction-3',
                    shape: { shapeType: ShapeType.Rect, x: 200, y: 200, width: 100, height: 100 },
                    labels: [labelFromUser(detectionLabels[0])],
                }),
            ];

            const selectedTask = tasks[1];
            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [predictionAnnotations[0], userAnnotations[1]];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });
    });

    describe('detection -> segmentation', () => {
        const tasks = [
            getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: detectionLabels }),
            getMockedTask({ id: '2', domain: DOMAIN.SEGMENTATION, labels: segmentationLabels }),
        ];

        const project = getMockedProject({ tasks, domains: tasks.map(({ domain }) => domain) });

        // These inputs are used by most of these tests by both the user and prediction annotations
        const inputs = [
            getMockedAnnotation({
                id: 'user-1',
                shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 100, height: 100 },
                labels: [labelFromUser(detectionLabels[0])],
                isSelected: true,
            }),
            getMockedAnnotation({
                id: 'user-2',
                shape: { shapeType: ShapeType.Rect, x: 100, y: 100, width: 100, height: 100 },
                labels: [labelFromUser(detectionLabels[0])],
            }),
        ];
        const userAnnotations = [
            ...inputs,
            getMockedAnnotation({
                id: 'circle-user-1-1',
                shape: { shapeType: ShapeType.Circle, x: 50, y: 50, r: 10 },
                labels: [labelFromUser(segmentationLabels[0])],
            }),
            getMockedAnnotation({
                id: 'circle-user-1-2',
                shape: { shapeType: ShapeType.Circle, x: 20, y: 20, r: 10 },
                labels: [labelFromUser(segmentationLabels[0])],
            }),

            // A segmentation annotation outside of the selected detection annotation
            getMockedAnnotation({
                id: 'circle-user-2-1',
                shape: { shapeType: ShapeType.Circle, x: 120, y: 120, r: 10 },
                labels: [labelFromUser(segmentationLabels[0])],
            }),
        ];

        const predictedDetectionAnnotations = [
            ...inputs,
            getMockedAnnotation({
                id: 'user-3',
                shape: { shapeType: ShapeType.Rect, x: 200, y: 200, width: 100, height: 100 },
                labels: [labelFromUser(detectionLabels[0])],
            }),
        ];

        const predictedSegmentationInputsSelectedInput = [
            getMockedAnnotation({
                id: 'prediction-1-user-1-1',
                shape: { shapeType: ShapeType.Circle, x: 20, y: 20, r: 10 },
                labels: [labelFromUser(segmentationLabels[0])],
            }),
        ];
        const predictionAnnotations = [
            ...predictedDetectionAnnotations,
            ...predictedSegmentationInputsSelectedInput,
            getMockedAnnotation({
                id: 'prediction-1-user-2-1',
                shape: { shapeType: ShapeType.Circle, x: 120, y: 120, r: 10 },
                labels: [labelFromUser(segmentationLabels[0])],
            }),
        ];

        it('replaces annotations in "All tasks" mode', () => {
            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                    selectedTask: null,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            expect(saveAnnotations).toHaveBeenCalledWith(predictionAnnotations);
        });

        it('replaces detection annotations', () => {
            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            // Any outputs will have been removed
            expect(saveAnnotations).toHaveBeenCalledWith(predictedDetectionAnnotations);
        });

        // TODO: this contains ambiguity?
        it('replaces segmentation annotations inside a selected input', () => {
            const saveAnnotations = jest.fn();

            const selectedTask = tasks[1];
            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            const expectedAnnotations = [
                ...inputs,
                userAnnotations[userAnnotations.length - 1],
                ...predictedSegmentationInputsSelectedInput,
            ];

            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        // NOTE: later on we will refactor inputs of the annotator so that the user annotation
        // and prediction scene always have the same input
        it('replaces segmentation annotations if the input is a predicted annotation', () => {
            const saveAnnotations = jest.fn();

            const userAnnotationsWithoutPredictionInput = [
                inputs[1],
                getMockedAnnotation({
                    id: 'circle-user-2-1',
                    shape: { shapeType: ShapeType.Circle, x: 120, y: 120, r: 10 },
                    labels: [labelFromUser(segmentationLabels[0])],
                }),
            ];

            const predictionAnnotationWithNewInput = [
                inputs[0],
                getMockedAnnotation({
                    id: 'prediction-1-user-1-1',
                    shape: { shapeType: ShapeType.Circle, x: 20, y: 20, r: 10 },
                    labels: [labelFromUser(segmentationLabels[0])],
                }),
            ];

            const selectedTask = tasks[1];
            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations: predictionAnnotationWithNewInput,
                    userAnnotations: userAnnotationsWithoutPredictionInput,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(false);

            const expectedAnnotations = [
                ...userAnnotationsWithoutPredictionInput,
                predictionAnnotationWithNewInput[0],
                predictionAnnotationWithNewInput[1],
            ];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges annotations in "All tasks" mode', () => {
            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                    selectedTask: null,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [
                ...userAnnotations,
                predictionAnnotations[2],
                predictedSegmentationInputsSelectedInput[0],
                predictionAnnotations[predictionAnnotations.length - 1],
            ];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges detection annotations', () => {
            const saveAnnotations = jest.fn();

            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: { project, tasks, predictionAnnotations, userAnnotations, saveAnnotations },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            // Any outputs will have been removed
            const expectedAnnotations = [
                ...userAnnotations,
                predictedDetectionAnnotations[predictedDetectionAnnotations.length - 1],
            ];

            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        it('merges segmentation annotations inside a selected input', () => {
            const saveAnnotations = jest.fn();

            const selectedTask = tasks[1];
            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations,
                    userAnnotations,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [...userAnnotations, ...predictedSegmentationInputsSelectedInput];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });

        // NOTE: later on we will refactor inputs of the annotator so that the user annotation
        // and prediction scene always have the same input
        it('merges segmentation annotations if the input is a predicted annotation', () => {
            const saveAnnotations = jest.fn();

            const userAnnotationsWithoutPredictionInput = [
                inputs[1],
                getMockedAnnotation({
                    id: 'circle-user-2-1',
                    shape: { shapeType: ShapeType.Circle, x: 120, y: 120, r: 10 },
                    labels: [labelFromUser(segmentationLabels[0])],
                }),
            ];

            const predictionAnnotationWithNewInput = [
                inputs[0],
                getMockedAnnotation({
                    id: 'prediction-1-user-1-1',
                    shape: { shapeType: ShapeType.Circle, x: 20, y: 20, r: 10 },
                    labels: [labelFromUser(segmentationLabels[0])],
                }),
            ];

            const selectedTask = tasks[1];
            const { result } = renderHook(() => usePrediction(), {
                wrapper,
                initialProps: {
                    project,
                    tasks,
                    selectedTask,
                    predictionAnnotations: predictionAnnotationWithNewInput,
                    userAnnotations: userAnnotationsWithoutPredictionInput,
                    saveAnnotations,
                },
            });

            // Check that only the prediction annotations have been saved
            expect(saveAnnotations).not.toHaveBeenCalled();
            result.current.acceptPrediction(true);

            const expectedAnnotations = [
                ...userAnnotationsWithoutPredictionInput,
                predictionAnnotationWithNewInput[0],
                predictionAnnotationWithNewInput[1],
            ];
            expect(saveAnnotations).toHaveBeenCalledWith(expectedAnnotations);
        });
    });
});
