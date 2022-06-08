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
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import { BoundingBoxTool } from './bounding-box-tool.component';

describe('BoundingBoxTool', () => {
    it('renders', () => {
        const annotationToolContext = fakeAnnotationToolContext();
        render(<BoundingBoxTool annotationToolContext={annotationToolContext} />);
    });

    it('draws a rectangle', async () => {
        const annotationToolContext = fakeAnnotationToolContext();
        const onComplete = annotationToolContext.scene.addShapes;
        render(<BoundingBoxTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: 40, clientY: 80 });
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 40, clientY: 80 });

        const rect = screen.getByRole('application');
        expect(rect).toHaveAttribute('x', '40');
        expect(rect).toHaveAttribute('y', '80');
        expect(rect).toHaveAttribute('width', '0');
        expect(rect).toHaveAttribute('height', '0');

        fireEvent.pointerMove(svg, { clientX: 10, clientY: 30 });
        expect(rect).toHaveAttribute('x', '10');
        expect(rect).toHaveAttribute('y', '30');
        expect(rect).toHaveAttribute('width', '30');
        expect(rect).toHaveAttribute('height', '50');

        fireEvent.pointerUp(svg);

        expect(onComplete).toBeCalledWith([{ shapeType: ShapeType.Rect, x: 10, y: 30, width: 30, height: 50 }]);
    });

    it('creates rotated bounding boxs when in a rotated detection task', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            activeDomains: [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX],
        });
        const onComplete = annotationToolContext.scene.addShapes;

        render(<BoundingBoxTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: 40, clientY: 80 });
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 40, clientY: 80 });
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 30 });
        fireEvent.pointerUp(svg);

        expect(onComplete).toBeCalledWith([
            { shapeType: ShapeType.RotatedRect, x: 25, y: 55, width: 30, height: 50, angle: 0 },
        ]);
    });

    it('allows pressing esc to reset the tool', () => {
        const annotationToolContext = fakeAnnotationToolContext();
        const onComplete = annotationToolContext.scene.addShapes;

        render(<BoundingBoxTool annotationToolContext={annotationToolContext} />);

        const svg = screen.getByRole('editor');

        fireEvent.pointerMove(svg, { clientX: 40, clientY: 80 });
        fireEvent.pointerDown(svg, { buttons: 1, clientX: 40, clientY: 80 });
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 30 });

        // Cancel the bounding box
        fireEvent.keyDown(svg, { key: 'Escape', code: 'Escape', charCode: 27 });

        // Completing the bounding box should have been cancelled
        fireEvent.pointerUp(svg);
        expect(onComplete).not.toBeCalled();
    });
});
