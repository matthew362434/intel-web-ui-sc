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

import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { render, fireEvent, screen, fakeAnnotationToolContext } from '../../../../../test-utils';
import { ANCHOR_SIZE } from '../resize-anchor.component';
import { EditBoundingBox as EditBoundingBoxTool } from './edit-bounding-box.component';

describe('EditRectangleTool', (): void => {
    const annotation = {
        id: 'rect-1',
        labels: [],
        shape: { shapeType: ShapeType.Rect as const, x: 10, y: 10, width: 300, height: 200 },
        zIndex: 0,
        isHovered: false,
        isSelected: false,
        isHidden: false,
        isLocked: false,
    };
    const shape = annotation.shape;

    const zoom = 2.0;
    const roi = { x: 0, y: 0, width: 1000, height: 1000 };
    const annotationToolContext = fakeAnnotationToolContext({
        annotations: [annotation],
        roi,
        zoom,
    });
    const onComplete = annotationToolContext.scene.updateAnnotation;

    it('allows the user to translate a rectangle', async (): Promise<void> => {
        render(<EditBoundingBoxTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        // Move the shape
        const startPoint = { x: 90, y: 10 };
        const endPoint = { x: 80, y: 0 };

        const rect = screen.getByLabelText('Drag to move shape');
        fireEvent.pointerDown(rect, {
            buttons: 1,
            clientX: startPoint.x,
            clientY: startPoint.y,
        });

        fireEvent.pointerMove(rect, {
            buttons: 1,
            clientX: endPoint.x,
            clientY: endPoint.y,
        });
        fireEvent.pointerUp(rect, {
            buttons: 1,
            clientX: endPoint.x,
            clientY: endPoint.y,
        });

        const translate = {
            x: (startPoint.x - endPoint.x) / zoom,
            y: (startPoint.y - endPoint.y) / zoom,
        };
        expect(onComplete).toBeCalledWith({
            ...annotation,
            shape: {
                ...shape,
                x: shape.x - translate.x,
                y: shape.y - translate.y,
            },
        });
    });

    test.each([
        [
            { x: shape.x, y: shape.y },
            { x: -10, y: -10 },
            { x: 0, y: 0 },
        ],
        [
            { x: shape.x, y: shape.y },
            { x: -10, y: roi.height + 10 },
            { x: 0, y: roi.height - shape.height },
        ],
        [
            { x: shape.x, y: shape.y },
            { x: roi.width + 10, y: roi.height + 10 },
            { x: roi.width - shape.width, y: roi.height - shape.height },
        ],
        [
            { x: shape.x, y: shape.y },
            { x: roi.width + 10, y: -10 },
            { x: roi.width - shape.width, y: 0 },
        ],
    ])(
        'keeps the bounding box in bounds of the canvas when moving from %o to %o',
        (startPoint, endPoint, expectedEndPoint): void => {
            render(<EditBoundingBoxTool annotationToolContext={annotationToolContext} annotation={annotation} />);

            const rect = screen.getByLabelText('Drag to move shape');
            fireEvent.pointerDown(rect, {
                buttons: 1,
                clientX: zoom * startPoint.x,
                clientY: zoom * startPoint.y,
            });

            fireEvent.pointerMove(rect, {
                buttons: 1,
                clientX: zoom * endPoint.x,
                clientY: zoom * endPoint.y,
            });
            fireEvent.pointerUp(rect, {
                buttons: 1,
                clientX: zoom * endPoint.x,
                clientY: zoom * endPoint.y,
            });

            expect(onComplete).toBeCalledWith({
                ...annotation,
                shape: { ...shape, ...expectedEndPoint },
            });
        }
    );

    // These test validate that the user can resize a rectangle by moving one of
    // its anchor points.
    // Specifically we test each anchor point twice: ones where we move away from
    // the rectangle and another time where we move into the rectangle
    test.each([
        [
            'North west',
            { x: shape.x, y: shape.y },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x + 10,
                y: shape.y + 10,
                width: shape.width - 10,
                height: shape.height - 10,
            },
        ],
        [
            'North west',
            { x: shape.x, y: shape.y },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x - 10,
                y: shape.y - 10,
                width: shape.width + 10,
                height: shape.height + 10,
            },
        ],
        [
            'North',
            { x: shape.x + shape.width / 2, y: shape.y },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y + 10,
                width: shape.width,
                height: shape.height - 10,
            },
        ],
        [
            'North',
            { x: shape.x, y: shape.y },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y - 10,
                width: shape.width,
                height: shape.height + 10,
            },
        ],
        [
            'North east',
            { x: shape.x + shape.width, y: shape.y },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y + 10,
                width: shape.width + 10,
                height: shape.height - 10,
            },
        ],
        [
            'North east',
            { x: shape.x + shape.width, y: shape.y },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y - 10,
                width: shape.width - 10,
                height: shape.height + 10,
            },
        ],
        [
            'East',
            { x: shape.x + shape.width, y: shape.y + shape.height / 2 },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width + 10,
                height: shape.height,
            },
        ],
        [
            'East',
            { x: shape.x + shape.width, y: shape.y + shape.height / 2 },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width - 10,
                height: shape.height,
            },
        ],
        [
            'South east',
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width + 10,
                height: shape.height + 10,
            },
        ],
        [
            'South east',
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width - 10,
                height: shape.height - 10,
            },
        ],
        [
            'South',
            { x: shape.x + shape.width / 2, y: shape.y + shape.height },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height + 10,
            },
        ],
        [
            'South',
            { x: shape.x + shape.width / 2, y: shape.y + shape.height },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height - 10,
            },
        ],
        [
            'South west',
            { x: shape.x, y: shape.y + shape.height },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x + 10,
                y: shape.y,
                width: shape.width - 10,
                height: shape.height + 10,
            },
        ],
        [
            'South west',
            { x: shape.x, y: shape.y + shape.height },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x - 10,
                y: shape.y,
                width: shape.width + 10,
                height: shape.height - 10,
            },
        ],
        [
            'West',
            { x: shape.x, y: shape.y + shape.height / 2 },
            { x: 10, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x + 10,
                y: shape.y,
                width: shape.width - 10,
                height: shape.height,
            },
        ],
        [
            'West',
            { x: shape.x, y: shape.y + shape.height / 2 },
            { x: -10, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x - 10,
                y: shape.y,
                width: shape.width + 10,
                height: shape.height,
            },
        ],
        // Test that the bounding box isn't allowed to be moved outside of the canvas
        [
            'North west',
            { x: shape.x, y: shape.y },
            { x: -20, y: -20 },
            {
                shapeType: ShapeType.Rect,
                x: 0,
                y: 0,
                width: shape.width + shape.x,
                height: shape.height + shape.y,
            },
        ],
        [
            'North',
            { x: shape.x + shape.width / 2, y: shape.y },
            { x: 10, y: -20 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: 0,
                width: shape.width,
                height: shape.height + shape.y,
            },
        ],
        [
            'North east',
            { x: shape.x + shape.width, y: shape.y },
            { x: roi.width, y: -10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: 0,
                width: roi.width - shape.x,
                height: shape.height + shape.y,
            },
        ],
        [
            'East',
            { x: shape.x + shape.width, y: shape.y + shape.height / 2 },
            { x: roi.width, y: 10 },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: roi.width - shape.x,
                height: shape.height,
            },
        ],
        [
            'South east',
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: roi.width, y: roi.height },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: roi.width - shape.x,
                height: roi.height - shape.y,
            },
        ],
        [
            'South',
            { x: shape.x + shape.width / 2, y: shape.y + shape.height },
            { x: 10, y: roi.height },
            {
                shapeType: ShapeType.Rect,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: roi.height - shape.y,
            },
        ],
        [
            'South west',
            { x: shape.x, y: shape.y + shape.height },
            { x: -roi.width, y: roi.height },
            {
                shapeType: ShapeType.Rect,
                x: 0,
                y: shape.y,
                width: shape.width + shape.x,
                height: roi.height - shape.y,
            },
        ],
        [
            'West',
            { x: shape.x, y: shape.y + shape.height / 2 },
            { x: -roi.width, y: roi.height },
            {
                shapeType: ShapeType.Rect,
                x: 0,
                y: shape.y,
                width: shape.width + shape.x,
                height: shape.height,
            },
        ],
    ])('Translate using %s anchor from %o by %o', (anchor, startPoint, translate, expectedRect): void => {
        const endPoint = {
            x: startPoint.x + translate.x * zoom,
            y: startPoint.y + translate.y * zoom,
        };
        render(<EditBoundingBoxTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        const rect = screen.getByLabelText(`${anchor} resize anchor`);
        fireEvent.pointerDown(rect, {
            buttons: 1,
            clientX: startPoint.x,
            clientY: startPoint.y,
        });

        fireEvent.pointerMove(rect, {
            buttons: 1,
            clientX: endPoint.x,
            clientY: endPoint.y,
        });

        fireEvent.pointerUp(rect, {
            buttons: 1,
            clientX: endPoint.x,
            clientY: endPoint.y,
        });

        expect(onComplete).toBeCalledWith({ ...annotation, shape: expectedRect });
    });

    describe('Resizing to its minimum', () => {
        it('leaves a gap between anchor points', () => {
            const gap = (2 * ANCHOR_SIZE) / zoom;
            const startPoint = { x: shape.x, y: shape.y };
            const expectedRect = {
                shapeType: ShapeType.Rect,
                x: shape.x + shape.width - gap,
                y: shape.y + shape.height - gap,
                width: gap,
                height: gap,
            };

            const endPoint = {
                x: startPoint.x + shape.width * zoom,
                y: startPoint.y + shape.height * zoom,
            };
            render(<EditBoundingBoxTool annotationToolContext={annotationToolContext} annotation={annotation} />);

            const rect = screen.getByLabelText(`North west resize anchor`);
            fireEvent.pointerDown(rect, {
                buttons: 1,
                clientX: startPoint.x,
                clientY: startPoint.y,
            });

            fireEvent.pointerMove(rect, {
                buttons: 1,
                clientX: endPoint.x,
                clientY: endPoint.y,
            });

            fireEvent.pointerUp(rect, {
                buttons: 1,
                clientX: endPoint.x,
                clientY: endPoint.y,
            });

            expect(onComplete).toBeCalledWith({ ...annotation, shape: expectedRect });
        });
    });
});
