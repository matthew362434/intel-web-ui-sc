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

import { labelFromUser } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedTask,
    labels as mockedLabels,
} from '../../../../test-utils/mocked-items-factory';
import { getPreviousTask, getOutputFromTask, getInputForTask } from './utils';

describe('getPreviousTask', () => {
    describe('returns undefined if there is no previous task', () => {
        it('for single task projects', () => {
            const tasks = [getMockedTask({ id: '1' })];
            const selectedTask = tasks[0];
            const annotationToolContext = fakeAnnotationToolContext({
                tasks,
                selectedTask,
            });

            expect(getPreviousTask(annotationToolContext, selectedTask)).toBe(undefined);
        });

        it('when the first task in a chain is selected', () => {
            const tasks = [getMockedTask({ id: '1' }), getMockedTask({ id: '2' })];
            const selectedTask = tasks[0];
            const annotationToolContext = fakeAnnotationToolContext({
                tasks,
                selectedTask,
            });

            expect(getPreviousTask(annotationToolContext, selectedTask)).toEqual(undefined);
        });

        it('when the "All tasks" task is slected', () => {
            const tasks = [getMockedTask({ id: '1' }), getMockedTask({ id: '2' })];
            const selectedTask = null;
            const annotationToolContext = fakeAnnotationToolContext({
                tasks,
                selectedTask,
            });

            expect(getPreviousTask(annotationToolContext, selectedTask)).toEqual(undefined);
        });
    });

    it('returns the previous task', () => {
        const tasks = [getMockedTask({ id: '1' }), getMockedTask({ id: '2' })];
        const selectedTask = tasks[1];
        const annotationToolContext = fakeAnnotationToolContext({
            tasks,
            selectedTask,
        });

        expect(getPreviousTask(annotationToolContext, selectedTask)).toEqual(tasks[0]);
    });
});

describe('getOutputFromTask', () => {
    describe('single tasks projects', () => {
        it('returns annotations from the single task', () => {
            const tasks = [getMockedTask({ id: '1' })];
            const selectedTask = tasks[0];
            const annotations = [
                getMockedAnnotation({ id: '1' }),
                getMockedAnnotation({ id: '2' }),
                getMockedAnnotation({ id: '3' }),
                getMockedAnnotation({ id: '4' }),
            ];
            const annotationToolContext = fakeAnnotationToolContext({
                tasks,
                selectedTask,
                annotations,
            });

            expect(getOutputFromTask(annotationToolContext, selectedTask)).toEqual(annotations);
        });
    });

    const [firstLabel, ...otherLabels] = mockedLabels;
    //
    // local -> global task chains
    describe.each([
        [
            'detection -> classification',
            getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: [firstLabel] }),
            getMockedTask({ id: '2', domain: DOMAIN.CLASSIFICATION, labels: otherLabels }),
        ],
        [
            'segmentation -> classification',
            getMockedTask({ id: '1', domain: DOMAIN.SEGMENTATION, labels: [firstLabel] }),
            getMockedTask({ id: '2', domain: DOMAIN.CLASSIFICATION, labels: otherLabels }),
        ],
    ])('local -> global task chains (%s)', (_, localTask, globalTask) => {
        const selectedTask = localTask;
        const annotations = [
            getMockedAnnotation({ id: '1', labels: [] }),
            getMockedAnnotation({ id: '2', labels: [labelFromUser(firstLabel)] }),
            getMockedAnnotation({ id: '3', labels: [labelFromUser(firstLabel)], isSelected: true }),
            getMockedAnnotation({
                id: '4',
                labels: [labelFromUser(firstLabel), labelFromUser(otherLabels[0])],
            }),
            getMockedAnnotation({
                id: '5',
                labels: [labelFromUser(firstLabel), labelFromUser(otherLabels[0])],
            }),
        ];
        const annotationToolContext = fakeAnnotationToolContext({
            tasks: [localTask, globalTask],
            selectedTask,
            annotations,
        });

        it('returns all annotations if "All tasks" is selected', () => {
            expect(getOutputFromTask(annotationToolContext, null)).toEqual(annotations);
        });

        it('returns the annotations from the first task', () => {
            expect(getOutputFromTask(annotationToolContext, localTask)).toEqual(annotations);
            expect(getInputForTask(annotationToolContext, localTask)).toEqual([]);
        });

        it('returns the annotations from the second task if they are inside selected annotaitons of the first task', () => {
            expect(getOutputFromTask(annotationToolContext, globalTask)).toEqual(annotations);
            expect(getInputForTask(annotationToolContext, globalTask)).toEqual(annotations);
        });
    });

    describe.each([
        [
            'detection -> segmentation',
            getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: [firstLabel] }),
            getMockedTask({ id: '2', domain: DOMAIN.SEGMENTATION, labels: otherLabels }),
        ],
        [
            'segmentation -> detection',
            getMockedTask({ id: '1', domain: DOMAIN.SEGMENTATION, labels: [firstLabel] }),
            getMockedTask({ id: '2', domain: DOMAIN.DETECTION, labels: otherLabels }),
        ],
    ])('global -> global task chains (%s)', (_, firstTask, secondTask) => {
        const tasks = [firstTask, secondTask];
        const selectedTask = tasks[0];
        const annotations = [
            getMockedAnnotation({ id: '1', labels: [] }),
            getMockedAnnotation({
                id: '2',
                labels: [labelFromUser(firstLabel)],
                shape: {
                    shapeType: ShapeType.Rect,
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                },
            }),
            getMockedAnnotation({ id: '3', labels: [labelFromUser(firstLabel)], isSelected: true }),
            getMockedAnnotation({
                id: '4',
                labels: [labelFromUser(otherLabels[0])],
            }),
            getMockedAnnotation({
                id: '5',
                labels: [labelFromUser(otherLabels[0])],
                shape: {
                    shapeType: ShapeType.Rect,
                    x: 110,
                    y: 110,
                    width: 10,
                    height: 10,
                },
            }),
            getMockedAnnotation({
                id: '6',
                labels: [],
                shape: {
                    shapeType: ShapeType.Circle,
                    x: 20,
                    y: 20,
                    r: 10,
                },
            }),
        ];
        const annotationToolContext = fakeAnnotationToolContext({
            tasks,
            selectedTask,
            annotations,
        });

        it('returns all annotations if "All tasks" is selected', () => {
            expect(getOutputFromTask(annotationToolContext, null)).toEqual(annotations);
            expect(getInputForTask(annotationToolContext, null)).toEqual([]);
        });

        it('returns the annotations from the first task', () => {
            // Only annotations that have a detection label, or no labels at all are returned
            const expectedAnnotations =
                firstTask.domain === DOMAIN.DETECTION
                    ? [annotations[0], annotations[1], annotations[2]]
                    : [annotations[0], annotations[1], annotations[2], annotations[5]];

            expect(getOutputFromTask(annotationToolContext, tasks[0])).toEqual(expectedAnnotations);
            expect(getInputForTask(annotationToolContext, tasks[0])).toEqual([]);
        });

        it('returns the annotations from the second task if they are inside selected annotaitons of the first task', () => {
            // Only annotations that have a detection label, or no labels at all are returned
            const expectedAnnotations =
                firstTask.domain === DOMAIN.DETECTION
                    ? [annotations[0], annotations[3], annotations[5]]
                    : [annotations[0], annotations[3]];

            expect(getOutputFromTask(annotationToolContext, tasks[1])).toEqual(expectedAnnotations);
            expect(getInputForTask(annotationToolContext, tasks[1])).toEqual([annotations[1], annotations[2]]);
        });

        it('does not consider an unlabeled annotation from a parent task as its output', () => {
            const ctx = fakeAnnotationToolContext({
                tasks: [firstTask, secondTask],
                selectedTask: firstTask,
                annotations: [getMockedAnnotation({ id: '1', labels: [], isSelected: true })],
            });

            expect(getOutputFromTask(ctx, firstTask)).toEqual(ctx.scene.annotations);
            expect(getOutputFromTask(ctx, secondTask)).toEqual([]);

            expect(getInputForTask(ctx, tasks[1])).toEqual([]);
        });
    });
});
