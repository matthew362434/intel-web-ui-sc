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

import { fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { Annotation } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { DOMAIN, Task } from '../../../../core/projects';
import { fakeAnnotationToolContext, getById } from '../../../../test-utils';
import { getMockedAnnotation, getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { ToolType } from '../../core';
import { annotatorRender } from '../../test-utils/annotator-render';
import SecondaryToolbar from './secondary-toolbar.component';
import { SelectingStateProvider } from './selecting-state-provider.component';
import { SelectingToolLabel, SelectingToolType } from './selecting-tool.enums';
import { getBrushMaxSize } from './utils';

jest.mock('./selecting-state-provider.component', () => {
    const actual = jest.requireActual('./selecting-state-provider.component');
    return {
        ...actual,
        useSelectingState: jest.fn(() => actual.useSelectingState()),
    };
});

const renderToolbar = async (annotations: Annotation[] = [], selectedTask?: Task) => {
    const tasks = selectedTask ? [selectedTask] : [getMockedTask({ labels: [], domain: DOMAIN.SEGMENTATION })];
    const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, selectedTask: tasks[0] });

    const { container } = annotatorRender(
        <SelectingStateProvider>
            <SecondaryToolbar annotationToolContext={annotationToolContext} />
        </SelectingStateProvider>
    );
    await waitForElementToBeRemoved(screen.getByLabelText(/loading/i));
    return { annotationToolContext, container };
};

describe('Selector Toolbar', () => {
    it('has title "Selector"', async () => {
        await renderToolbar();
        expect(screen.getByText('Selector')).toBeInTheDocument();
    });

    it('has SelectionTool selected by default', async () => {
        const { container } = await renderToolbar();
        const selectionTool = getById(container, SelectingToolType.SelectionTool);
        expect(selectionTool).toBeInTheDocument();
        expect(selectionTool).toHaveAttribute('aria-pressed', 'true');
    });

    it('Classification project do not have subtools', async () => {
        const testTaskDomain = {
            id: '123',
            title: 'test',
            labels: [],
            domain: DOMAIN.CLASSIFICATION,
        };

        const { container } = await renderToolbar([], testTaskDomain);
        const selectionTool = getById(container, SelectingToolType.SelectionTool);
        expect(selectionTool).not.toBeInTheDocument();
        expect(screen.queryByLabelText(SelectingToolLabel.BrushTool)).not.toBeInTheDocument();
    });

    describe('Brush tool', () => {
        const polygonAnnotation = getMockedAnnotation({ isSelected: true }, ShapeType.Polygon);
        it('render brush tool when one polygon shape annotation is selected', async () => {
            await renderToolbar([polygonAnnotation]);
            const button = screen.getByLabelText(SelectingToolLabel.BrushTool);
            fireEvent.click(button);

            expect(screen.queryByLabelText(SelectingToolLabel.BrushTool)).toBeInTheDocument();
            expect(screen.queryByLabelText('brush-size')).toBeInTheDocument();
        });

        it('isBrushSubTool is set to false when multiple annotations are selected', async () => {
            const { annotationToolContext } = await renderToolbar([polygonAnnotation, polygonAnnotation]);

            expect(screen.queryByLabelText(SelectingToolLabel.BrushTool)).not.toBeInTheDocument();
            expect(screen.queryByLabelText('brush-size')).not.toBeInTheDocument();
            expect(annotationToolContext.updateToolSettings).toHaveBeenLastCalledWith(ToolType.SelectTool, {
                isBrushSubTool: false,
            });
        });

        it('use RegionOfInterest to calc "maxBrushSize"', async () => {
            const { annotationToolContext } = await renderToolbar([polygonAnnotation]);
            const button = screen.getByLabelText(SelectingToolLabel.BrushTool);
            fireEvent.click(button);

            const roi = annotationToolContext.image;
            const slider = screen.getByLabelText('brush-size');
            const input = slider.querySelector('input') as HTMLInputElement;

            expect(input.max).toBe(`${getBrushMaxSize(roi)}`);
        });
    });
});
