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

import { renderHook } from '@testing-library/react-hooks';

import { labelFromUser } from '../../../../core/annotations';
import { LABEL_SOURCE } from '../../../../core/labels';
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import { getMockedAnnotation, getMockedLabel, getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { ToolType } from '../../core';
import { SelectingTool } from '../../tools';
import { shouldDisableTools, useDrawingTools, useDisableTools } from './utils';

describe('Primary toolbar utils', () => {
    test.each(Object.keys(DOMAIN))(
        'useDrawingTools returns all supported tools for %o but the Select tool',
        async (domain) => {
            const tools = useDrawingTools([domain as DOMAIN]);

            expect(tools.includes(SelectingTool)).toBeFalsy();
        }
    );

    it('shouldDisableTools returns false if it is a single task project', () => {
        const fakeContext = fakeAnnotationToolContext({
            tasks: [getMockedTask({ id: 'mock-task' })],
        });

        expect(shouldDisableTools(fakeContext)).toEqual(false);
    });

    it('shouldDisableTools returns false there is no previousTask', () => {
        const fakeContext = fakeAnnotationToolContext({
            tasks: [getMockedTask({ id: 'mock-task-1' }), getMockedTask({ id: 'mock-task-2' })],
            selectedTask: null,
        });

        expect(shouldDisableTools(fakeContext)).toEqual(false);
    });

    it('shouldDisableTools returns false if previousTask has annotations', () => {
        const mockLabel = getMockedLabel({ id: 'some-label' });
        const mockTaskOne = getMockedTask({ id: 'mock-task-1', labels: [mockLabel] });
        const mockTaskTwo = getMockedTask({ id: 'mock-task-2' });
        const fakeContext = fakeAnnotationToolContext({
            tasks: [mockTaskOne, mockTaskTwo],
            selectedTask: mockTaskTwo,
            annotations: [getMockedAnnotation({ labels: [labelFromUser(mockLabel)] })],
        });

        expect(shouldDisableTools(fakeContext)).toEqual(false);
    });

    it('shouldDisableTools returns true if previousTask has no annotations', () => {
        const mockToggleTool = jest.fn();
        const mockTaskOne = getMockedTask({ id: 'mock-task-1' });
        const mockTaskTwo = getMockedTask({ id: 'mock-task-2' });
        const fakeContext = fakeAnnotationToolContext({
            tasks: [mockTaskOne, mockTaskTwo],
            toggleTool: mockToggleTool,
            selectedTask: mockTaskTwo,
            annotations: [],
        });

        expect(shouldDisableTools(fakeContext)).toEqual(true);
        expect(mockToggleTool).toHaveBeenCalledWith(ToolType.SelectTool);
    });

    it('useDisableTools should not toggle SelectTool if shouldDisableTools returns false', () => {
        const mockLabel = getMockedLabel({ id: 'some-label' });
        const mockTaskOne = getMockedTask({ id: 'mock-task-1', labels: [mockLabel] });
        const mockTaskTwo = getMockedTask({ id: 'mock-task-2' });
        const mockToggleTool = jest.fn();
        const fakeContext = fakeAnnotationToolContext({
            tasks: [mockTaskOne, mockTaskTwo],
            selectedTask: mockTaskTwo,
            toggleTool: mockToggleTool,
            annotations: [getMockedAnnotation({ labels: [{ ...mockLabel, source: { type: LABEL_SOURCE.USER } }] })],
        });

        renderHook(() => useDisableTools(fakeContext));

        expect(mockToggleTool).not.toHaveBeenCalled();
    });

    it('useDisableTools should toggle SelectTool if shouldDisableTools returns true', () => {
        const mockToggleTool = jest.fn();
        const mockTaskOne = getMockedTask({ id: 'mock-task-1' });
        const mockTaskTwo = getMockedTask({ id: 'mock-task-2' });
        const fakeContext = fakeAnnotationToolContext({
            tasks: [mockTaskOne, mockTaskTwo],
            toggleTool: mockToggleTool,
            selectedTask: mockTaskTwo,
            annotations: [],
        });

        renderHook(() => useDisableTools(fakeContext));

        expect(mockToggleTool).toHaveBeenCalledWith(ToolType.SelectTool);
    });
});
