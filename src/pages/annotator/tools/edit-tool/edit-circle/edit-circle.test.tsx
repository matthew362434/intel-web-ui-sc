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

import { Circle, Point } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { render, fireEvent, screen, fakeAnnotationToolContext } from '../../../../../test-utils';
import { EditCircle as EditCircleTool } from './edit-circle.component';

jest.mock('../../../hooks/use-container-bondingbox.hook', () => ({
    useContainerBoundingBox: jest.fn((roi) => roi),
}));

const defaultRoi = { x: 0, y: 0, width: 200, height: 200 };
const annotation = {
    id: 'circle-1',
    labels: [],
    shape: {
        shapeType: ShapeType.Circle,
        x: defaultRoi.width / 2,
        y: defaultRoi.height / 2,
        r: 20,
    } as Circle,
    zIndex: 0,
    isHovered: false,
    isSelected: false,
    isHidden: false,
    isLocked: false,
};

describe('EditCircleTool', () => {
    const shape = annotation.shape;
    const annotationToolContext = fakeAnnotationToolContext({
        annotations: [annotation],
        roi: defaultRoi,
    });
    const { updateAnnotation, removeAnnotations } = annotationToolContext.scene;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows the user to translate a circle', async () => {
        render(<EditCircleTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        const startPoint = { x: 90, y: 10 };
        const endPoint = { x: 80, y: 0 };
        const rect = screen.getByLabelText('Drag to move shape');
        moveShape(rect, startPoint, endPoint);

        expect(updateAnnotation).toBeCalledWith({
            ...annotation,
            shape: {
                ...shape,
                x: shape.x + endPoint.x - startPoint.x,
                y: shape.y + endPoint.y - startPoint.y,
            },
        });
    });

    it('allows the user to resize a circle', async () => {
        const { container } = render(
            <EditCircleTool annotationToolContext={annotationToolContext} annotation={annotation} />
        );

        const startPoint = { x: shape.x + shape.r, y: shape.y };
        const endPoint = { x: shape.x + shape.r + 10, y: shape.y + 10 };
        const expectedRadius = Math.sqrt(Math.pow(shape.x - endPoint.x, 2) + Math.pow(shape.y - endPoint.y, 2));
        const anchor = screen.getByLabelText('Resize circle anchor');
        // Move the resize anchor from its starting point
        moveShape(anchor, startPoint, endPoint);

        const movedAnchor = screen.getByLabelText('Resize circle anchor');
        const anchorPoint = {
            x: movedAnchor.getAttribute('cx'),
            y: movedAnchor.getAttribute('cy'),
        };
        expect(Number(anchorPoint.x)).toBeCloseTo(endPoint.x);
        expect(Number(anchorPoint.y)).toBeCloseTo(endPoint.y);

        // The line should start from the circle's origin and end at the anchor point
        const radiusLine = container.querySelector('line');
        expect(radiusLine).toHaveAttribute('x1', `${shape.x}`);
        expect(radiusLine).toHaveAttribute('y1', `${shape.y}`);
        expect(radiusLine).toHaveAttribute('x2', anchorPoint.x);
        expect(radiusLine).toHaveAttribute('y2', anchorPoint.y);

        expect(updateAnnotation).toBeCalledWith({
            ...annotation,
            shape: { ...shape, r: expectedRadius },
        });
    });

    it('removes circle out of roi limits', async () => {
        render(<EditCircleTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        const startPoint = { x: 0, y: 0 };
        const endPoint = { x: defaultRoi.width * 2, y: 0 };
        const rect = screen.getByLabelText('Drag to move shape');
        moveShape(rect, startPoint, endPoint);

        expect(updateAnnotation).not.toBeCalled();
        expect(removeAnnotations).toBeCalledWith([
            {
                ...annotation,
                shape: {
                    ...shape,
                    x: shape.x,
                    y: shape.y + endPoint.y - startPoint.y,
                },
            },
        ]);
    });
});

const moveShape = (rect: HTMLElement, startPoint: Point, endPoint: Point) => {
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
};
