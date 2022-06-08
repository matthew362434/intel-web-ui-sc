// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { getAnnotationStateForTask } from '../../../../../core/annotations';
import { AnnotationStatePerTask, MEDIA_ANNOTATION_STATUS } from '../../../../../core/media';

describe('dataset-list-item', () => {
    describe('getAnnotationStateForTask', () => {
        describe('partially annotated chainTask', () => {
            test('when all tasks are annotated it returns annotated', () => {
                expect(
                    getAnnotationStateForTask([
                        { task_id: 'task_a', state: MEDIA_ANNOTATION_STATUS.ANNOTATED },
                        { task_id: 'task_b', state: MEDIA_ANNOTATION_STATUS.ANNOTATED },
                    ])
                ).toBe(MEDIA_ANNOTATION_STATUS.ANNOTATED);
            });

            test('when one of the tasks is not annotated it returns partially_annotated', () => {
                expect(
                    getAnnotationStateForTask([
                        { task_id: 'task_a', state: MEDIA_ANNOTATION_STATUS.ANNOTATED },
                        { task_id: 'task_b', state: MEDIA_ANNOTATION_STATUS.NONE },
                    ])
                ).toBe(MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED);
            });

            test('when none of the tasks is annotated it returns none', () => {
                expect(
                    getAnnotationStateForTask([
                        { task_id: 'task_a', state: MEDIA_ANNOTATION_STATUS.NONE },
                        { task_id: 'task_b', state: MEDIA_ANNOTATION_STATUS.NONE },
                    ])
                ).toBe(MEDIA_ANNOTATION_STATUS.NONE);
            });
        });

        describe('completely annotated chainTask', () => {
            const chainTaskData: AnnotationStatePerTask[] = [
                { task_id: 'task_a', state: MEDIA_ANNOTATION_STATUS.ANNOTATED },
                { task_id: 'task_b', state: MEDIA_ANNOTATION_STATUS.ANNOTATED },
            ];

            test('when annotated task is selected returns annotated', () => {
                expect(getAnnotationStateForTask(chainTaskData)).toBe(MEDIA_ANNOTATION_STATUS.ANNOTATED);
            });

            test('when no task is selected returns annotated', () => {
                expect(getAnnotationStateForTask(chainTaskData)).toBe(MEDIA_ANNOTATION_STATUS.ANNOTATED);
            });
        });

        describe('completely not-annotated chainTask', () => {
            const chainTaskData: AnnotationStatePerTask[] = [
                { task_id: 'task_a', state: MEDIA_ANNOTATION_STATUS.NONE },
                { task_id: 'task_b', state: MEDIA_ANNOTATION_STATUS.NONE },
            ];

            test('when a task is selected returns none', () => {
                expect(getAnnotationStateForTask(chainTaskData)).toBe(MEDIA_ANNOTATION_STATUS.NONE);
                expect(getAnnotationStateForTask(chainTaskData)).toBe(MEDIA_ANNOTATION_STATUS.NONE);
            });

            test('when no task is selected returns none', () => {
                expect(getAnnotationStateForTask(chainTaskData)).toBe(MEDIA_ANNOTATION_STATUS.NONE);
            });
        });
    });
});
