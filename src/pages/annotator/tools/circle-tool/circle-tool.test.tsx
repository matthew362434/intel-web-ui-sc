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

import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import { ToolType } from '../../core';
import { CircleTool } from './circle-tool.component';

describe('CircleTool', (): void => {
    const annotationToolContext = fakeAnnotationToolContext();
    const getToolSettings = annotationToolContext.getToolSettings as jest.Mock;

    const defaultCircleSize = 10;
    beforeEach(() => {
        getToolSettings.mockReturnValue({ size: defaultCircleSize });

        // Reset the spy
        annotationToolContext.scene.addShapes = jest.fn();
    });

    it('renders a cricle with default radius', async (): Promise<void> => {
        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: 40, clientY: 80 });
        const circle = container.querySelector('circle');

        expect(circle).toHaveAttribute('cx', '40');
        expect(circle).toHaveAttribute('cy', '80');
        expect(circle).toHaveAttribute('r', `${defaultCircleSize}`);
    });

    it('draws a circle of fixed size', async (): Promise<void> => {
        const onComplete = annotationToolContext.scene.addShapes;

        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);
        expect(container.querySelector('circle')).toBeNull();

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 10, clientY: 20 });

        const circle = container.querySelector('circle');
        expect(circle).toHaveAttribute('cx', '10');
        expect(circle).toHaveAttribute('cy', '20');
        expect(circle).toHaveAttribute('r', `${defaultCircleSize}`);
        fireEvent.pointerUp(svg);

        expect(onComplete).toBeCalledWith([{ shapeType: ShapeType.Circle, x: 10, y: 20, r: defaultCircleSize }]);
    });

    it('draws a circle of fixed size even when moving the mouse a little bit', async (): Promise<void> => {
        const onComplete = annotationToolContext.scene.addShapes;

        render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(svg, { buttons: 1, clientX: 10, clientY: 20 });
        fireEvent.pointerUp(svg, { buttons: 1, clientX: 10, clientY: 20 });

        expect(onComplete).toBeCalledWith([{ shapeType: ShapeType.Circle, x: 10, y: 20, r: 2 }]);
    });

    it('draws a circle of larger size', async (): Promise<void> => {
        const onComplete = annotationToolContext.scene.addShapes;

        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerDown(svg, { buttons: 1, clientX: 40, clientY: 80 });

        const circle = container.querySelector('circle');
        expect(circle).toHaveAttribute('cx', '40');
        expect(circle).toHaveAttribute('cy', '80');

        // The radius is increased after moving the pointer
        expect(circle).toHaveAttribute('r', `${defaultCircleSize}`);
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 80 });
        expect(circle).toHaveAttribute('r', '30');

        fireEvent.pointerUp(svg);

        expect(onComplete).toBeCalledWith([{ shapeType: ShapeType.Circle, x: 40, y: 80, r: 30 }]);
    });

    it('allows changing the default circle radius', async (): Promise<void> => {
        const onComplete = annotationToolContext.scene.addShapes;

        render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { button: 2, buttons: 2, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(svg, { clientX: 50, clientY: 20 });
        fireEvent.pointerUp(svg, { button: 2, buttons: 2, clientX: 50, clientY: 20 });

        expect(onComplete).toBeCalledWith([{ shapeType: ShapeType.Circle, x: 10, y: 20, r: 40 }]);
        expect(annotationToolContext.updateToolSettings).toBeCalledWith(ToolType.CircleTool, { size: 40 });
    });

    it('uses the default circle radius size when stamping', async (): Promise<void> => {
        const defaultRadius = 40;
        getToolSettings.mockReturnValue({ size: defaultRadius });

        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: 50, clientY: 50 });

        const circle = container.querySelector('circle');
        expect(circle).toHaveAttribute('r', `${defaultRadius}`);
    });

    it('not draws smaller circle than MIN_RADIUS', async (): Promise<void> => {
        const MIN_RADIUS = 2;
        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 10, clientY: 10 });
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 10 });

        const circle = container.querySelector('circle');
        expect(circle).toHaveAttribute('r', `${MIN_RADIUS}`);
    });

    it('allows pressing esc to reset the tool', () => {
        const onComplete = annotationToolContext.scene.addShapes;

        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);
        expect(container.querySelector('circle')).toBeNull();

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { button: 2, buttons: 2, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(svg, { clientX: 50, clientY: 20 });

        // Cancel the circle
        fireEvent.keyDown(svg, { key: 'Escape', code: 'Escape', charCode: 27 });

        // Completing the circle should have been cancelled
        fireEvent.pointerUp(svg, { button: 2, buttons: 2, clientX: 50, clientY: 20 });
        expect(onComplete).not.toBeCalled();
    });

    it('allows pressing esc to reset the tool after moving the cursor', () => {
        const onComplete = annotationToolContext.scene.addShapes;

        const { container } = render(<CircleTool annotationToolContext={annotationToolContext} />);
        expect(container.querySelector('circle')).toBeNull();

        const svg = screen.getByRole('editor');
        fireEvent.pointerDown(svg, { button: 2, buttons: 2, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(svg, { clientX: 50, clientY: 20 });

        // Cancel the circle
        fireEvent.keyDown(svg, { key: 'Escape', code: 'Escape', charCode: 27 });
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 10 });

        // Completing the circle should have been cancelled
        fireEvent.pointerUp(svg, { button: 2, buttons: 2, clientX: 50, clientY: 20 });
        expect(onComplete).not.toBeCalled();
    });
});
