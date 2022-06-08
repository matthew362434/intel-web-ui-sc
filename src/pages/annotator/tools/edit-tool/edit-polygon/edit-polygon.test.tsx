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

import userEvent from '@testing-library/user-event';

import { Annotation, Polygon } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext, render, fireEvent, screen } from '../../../../../test-utils';
import { getMockedAnnotation } from '../../../../../test-utils/mocked-items-factory';
import { removeOffLimitPoints } from '../../utils';
import { EditPolygon as EditPolygonTool } from './edit-polygon.component';

const roi = { x: 0, y: 0, width: 1000, height: 1000 };

jest.mock('../../../providers', () => ({
    useAnnotationScene: () => ({ hasShapePointSelected: { current: false } }),
}));

jest.mock('../../../hooks/use-container-bondingbox.hook', () => ({
    useContainerBoundingBox: jest.fn(() => roi),
}));

jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    removeOffLimitPoints: jest.fn((shape) => shape),
}));

interface Point {
    x: number;
    y: number;
}

const moveLine = (rect: HTMLElement, startPoint: Point, endPoint: Point) => {
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

describe('EditPolygonTool', () => {
    const annotation = getMockedAnnotation({
        id: 'polygon-1',
        shape: {
            shapeType: ShapeType.Polygon,
            points: [
                { x: 20, y: 10 },
                { x: 70, y: 30 },
                { x: 80, y: 90 },
            ],
        },
    }) as Annotation & { shape: Polygon };
    const shape = annotation.shape;

    const annotationToolContext = fakeAnnotationToolContext({
        annotations: [annotation],
        roi,
    });
    const onComplete = annotationToolContext.scene.updateAnnotation;

    it('allows the user to translate a polygon', async () => {
        render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        // Move the shape
        const startPoint = { x: 90, y: 10 };
        const endPoint = { x: 80, y: 0 };

        const rect = screen.getByLabelText('Drag to move shape');
        moveLine(rect, startPoint, endPoint);
        const translate = {
            x: startPoint.x - endPoint.x,
            y: startPoint.y - endPoint.y,
        };

        const finalShape = {
            ...shape,
            points: shape.points.map((point) => ({
                x: point.x - translate.x,
                y: point.y - translate.y,
            })),
        };

        expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
        expect(onComplete).toBeCalledWith({
            ...annotation,
            shape: finalShape,
        });
    });

    it("allows the user to move one of the polygon's anchor points", () => {
        const startPoint = { x: 70, y: 30 };
        const translate = { x: 10, y: 10 };

        const endPoint = {
            x: startPoint.x + translate.x,
            y: startPoint.y + translate.y,
        };
        render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={annotation} />);

        const rect = screen.getByLabelText('Resize polygon 1 anchor');
        moveLine(rect, startPoint, endPoint);

        const finalShape = {
            ...shape,
            points: [
                { x: 20, y: 10 },
                { x: 80, y: 40 },
                { x: 80, y: 90 },
            ],
        };
        expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
        expect(onComplete).toBeCalledWith({
            ...annotation,
            shape: finalShape,
        });
    });

    describe('adding a point to an existing polygon', () => {
        const mockAnnotation = getMockedAnnotation({
            id: 'polygon-1',
            shape: {
                shapeType: ShapeType.Polygon,
                points: [
                    { x: 10, y: 10 },
                    { x: 50, y: 50 },
                    { x: 10, y: 50 },
                ],
            },
        }) as Annotation & { shape: Polygon };
        const mockShape = mockAnnotation.shape;

        const hoverPoint = { clientX: 40, clientY: 50 };

        it('can add a point between two lines', () => {
            const expectedProjectedPoint = { x: 45, y: 45 };

            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={mockAnnotation} />);

            const line = screen.getByLabelText('Line between point 0 and 1');
            fireEvent.pointerMove(line, { ...hoverPoint });
            fireEvent.pointerDown(line, { buttons: 1, ...hoverPoint });

            const ghostPoint = screen.getByLabelText('Add a point between point 0 and 1');
            fireEvent.pointerDown(ghostPoint, { buttons: 1, ...hoverPoint });
            fireEvent.pointerUp(ghostPoint, { buttons: 1, ...hoverPoint });

            const finalShape = {
                ...mockShape,
                points: [mockShape.points[0], expectedProjectedPoint, mockShape.points[1], mockShape.points[2]],
            };
            expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
            expect(onComplete).toBeCalledWith({
                ...mockAnnotation,
                shape: finalShape,
            });
        });

        it('can move the new point before adding it', () => {
            const expectedProjectedPoint = { x: 45, y: 45 };
            const moveBy = { x: 5, y: 15 };

            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={mockAnnotation} />);

            const line = screen.getByLabelText('Line between point 0 and 1');
            fireEvent.pointerMove(line, { ...hoverPoint });
            fireEvent.pointerDown(line, { buttons: 1, ...hoverPoint });

            const ghostPoint = screen.getByLabelText('Add a point between point 0 and 1');
            fireEvent.pointerDown(ghostPoint, { buttons: 1, ...hoverPoint });
            fireEvent.pointerMove(ghostPoint, {
                clientX: hoverPoint.clientX + moveBy.x,
                clientY: hoverPoint.clientY + moveBy.y,
            });
            fireEvent.pointerUp(ghostPoint, { buttons: 1, ...hoverPoint });

            const finalShape = {
                ...shape,
                points: [
                    mockShape.points[0],
                    {
                        x: expectedProjectedPoint.x + moveBy.x,
                        y: expectedProjectedPoint.y + moveBy.y,
                    },
                    mockShape.points[1],
                    mockShape.points[2],
                ],
            };
            expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
            expect(onComplete).toBeCalledWith({
                ...mockAnnotation,
                shape: finalShape,
            });
        });
    });

    describe('removing points from a polygon', () => {
        const mockAnnotation = getMockedAnnotation({
            id: 'polygon-1',
            shape: {
                shapeType: ShapeType.Polygon,
                points: [
                    { x: 10, y: 10 },
                    { x: 30, y: 10 },
                    { x: 50, y: 30 },
                    { x: 50, y: 50 },
                    { x: 10, y: 50 },
                ],
            },
        }) as Annotation & { shape: Polygon };
        const mockShape = mockAnnotation.shape;

        it('removes a point from a polygon', () => {
            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={mockAnnotation} />);

            const pointToRemove = screen.getByLabelText('Click to select point 0');
            fireEvent.click(pointToRemove);

            expect(pointToRemove).toHaveAttribute('aria-selected', 'true');
            userEvent.keyboard('{Delete}');

            const finalShape = {
                ...mockShape,
                points: [mockShape.points[1], mockShape.points[2], mockShape.points[3], mockShape.points[4]],
            };
            expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
            expect(onComplete).toBeCalledWith({
                ...mockAnnotation,
                shape: finalShape,
            });

            expect(pointToRemove).toHaveAttribute('aria-selected', 'false');
        });

        it('deselects points', () => {
            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={mockAnnotation} />);

            const pointToRemove0 = screen.getByLabelText('Click to select point 0');
            const pointToRemove1 = screen.getByLabelText('Click to select point 1');
            const pointToRemove2 = screen.getByLabelText('Click to select point 2');

            fireEvent.click(pointToRemove0);
            expect(pointToRemove0).toHaveAttribute('aria-selected', 'true');

            fireEvent.click(pointToRemove1);
            expect(pointToRemove0).toHaveAttribute('aria-selected', 'false');
            expect(pointToRemove1).toHaveAttribute('aria-selected', 'true');

            fireEvent.click(pointToRemove0, { shiftKey: true });
            fireEvent.click(pointToRemove1, { shiftKey: true });
            fireEvent.click(pointToRemove2, { shiftKey: true });

            expect(pointToRemove0).toHaveAttribute('aria-selected', 'true');
            expect(pointToRemove1).toHaveAttribute('aria-selected', 'false');
            expect(pointToRemove2).toHaveAttribute('aria-selected', 'true');

            expect(pointToRemove0).toHaveAttribute('aria-selected', 'true');
            userEvent.keyboard('{Delete}');

            const finalShape = {
                ...mockShape,
                points: [mockShape.points[1], mockShape.points[3], mockShape.points[4]],
            };
            expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
            expect(onComplete).toBeCalledWith({
                ...mockAnnotation,
                shape: finalShape,
            });
        });

        it('removes the polygon if it ends up with 2 points or less', () => {
            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={annotation} />);

            const pointToRemove = screen.getByLabelText('Click to select point 0');
            fireEvent.click(pointToRemove);
            expect(pointToRemove).toHaveAttribute('aria-selected', 'true');

            const otherPointToRemove = screen.getByLabelText('Shift click to select point 1');
            fireEvent.click(otherPointToRemove, { shiftKey: true });
            expect(otherPointToRemove).toHaveAttribute('aria-selected', 'true');

            fireEvent.click(screen.getByLabelText('Shift click to select point 2'), { shiftKey: true });

            userEvent.keyboard('{Delete}');

            expect(annotationToolContext.scene.removeAnnotations).toBeCalledWith([annotation]);
        });

        it('removes the polygon with the context menu option "delete"', async () => {
            render(<EditPolygonTool annotationToolContext={annotationToolContext} annotation={mockAnnotation} />);

            const pointToRemove = screen.getByLabelText('Resize polygon 2 anchor');

            fireEvent.contextMenu(pointToRemove);

            const removeButton = screen.getByText('delete');
            fireEvent.click(removeButton);

            const finalShape = {
                ...mockShape,
                points: [mockShape.points[0], mockShape.points[1], mockShape.points[3], mockShape.points[4]],
            };
            expect(removeOffLimitPoints).toHaveBeenCalledWith(finalShape, roi);
            expect(onComplete).toBeCalledWith({
                ...mockAnnotation,
                shape: finalShape,
            });
        });
    });
});
