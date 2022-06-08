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

import { fireEvent, render, screen } from '@testing-library/react';

import { Annotation, Polygon } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext } from '../../../../../test-utils';
import { getMockedAnnotation } from '../../../../../test-utils/mocked-items-factory';
import { transformToClipperShape } from '../../utils';
import { BrushTool } from './brush-tool.component';

jest.mock('../../../providers/task-chain-provider/task-chain-provider.component', () => {
    const actual = jest.requireActual('../../../providers/task-chain-provider/task-chain-provider.component');
    return {
        ...actual,
        useTaskChain: jest.fn(() => ({ inputs: [] })),
    };
});

jest.mock('../../../../../hooks/use-worker/use-worker.hook', () => {
    const actual = jest.requireActual('../../../../../hooks/use-worker/use-worker.hook');
    return {
        ...actual,
        useWorker: jest.fn(() => ({
            worker: {
                optimizePolygon: jest.fn((shape) => shape),
            },
        })),
    };
});

const polygonAnnotation: Annotation = {
    id: 'test-polygon',
    labels: [],
    shape: {
        shapeType: ShapeType.Polygon,
        points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ],
    },
    zIndex: 0,
    isHovered: false,
    isSelected: true,
    isHidden: false,
    isLocked: false,
};
const circleAnnotation = getMockedAnnotation({}, ShapeType.Circle);
const rectAnnotation = getMockedAnnotation({}, ShapeType.Rect);

describe('BrushTool', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const annotationToolContext = fakeAnnotationToolContext({
        annotations: [polygonAnnotation, circleAnnotation, rectAnnotation],
    });

    const movePointer = (container: SVGElement, moveTo: number, { x, y }: { x: number; y: number }) => {
        Array.from({ length: moveTo }).forEach((_, index) => {
            fireEvent.pointerMove(container, { clientX: x + index, clientY: y });
        });
    };

    const expectShowGhostAndHideAnnotation = () => {
        expect(screen.queryByLabelText('ghostPolygon')).toBeInTheDocument();
        expect(annotationToolContext.scene.replaceAnnotations).toHaveBeenCalledWith(expect.any(Array), true);
    };

    it('deselect Polygon shapes', async () => {
        render(<BrushTool annotationToolContext={annotationToolContext} brushSize={10} showCirclePreview={false} />);
    });

    it('shape increases its size when the user clicks inside and moves the cursor', async () => {
        const spyUpdateAnnotation = annotationToolContext.scene.updateAnnotation as jest.Mock;
        const { container } = render(
            <BrushTool annotationToolContext={annotationToolContext} brushSize={10} showCirclePreview={false} />
        );
        const testPolygon = polygonAnnotation.shape as Polygon;
        const lastPoint = testPolygon.points[testPolygon.points.length - 1];
        const svgContainer = container.querySelector('svg') as SVGElement;
        const iniPoint = { x: lastPoint.x + 1, y: lastPoint.y - 1 };

        fireEvent.pointerDown(svgContainer, { clientX: iniPoint.x, clientY: iniPoint.y });
        movePointer(svgContainer, 40, iniPoint);

        expectShowGhostAndHideAnnotation();

        fireEvent.pointerUp(svgContainer);

        expect(spyUpdateAnnotation).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isHidden: false,
            })
        );
        expect(screen.queryByLabelText('ghostPolygon')).not.toBeInTheDocument();

        const newPolygon = (spyUpdateAnnotation.mock.calls[0][0] as Annotation).shape;

        expect(transformToClipperShape(newPolygon).totalArea()).toBeGreaterThan(
            transformToClipperShape(testPolygon).totalArea()
        );
    });

    it('shape decreases its size when the user clicks outside and touches the polygon', async () => {
        const spyUpdateAnnotation = annotationToolContext.scene.updateAnnotation as jest.Mock;
        const brushSize = 3;
        const { container } = render(
            <BrushTool annotationToolContext={annotationToolContext} brushSize={brushSize} showCirclePreview={false} />
        );
        const testPolygon = polygonAnnotation.shape as Polygon;
        const lastPoint = testPolygon.points[testPolygon.points.length - 1];
        const svgContainer = container.querySelector('svg') as SVGElement;
        const iniPoint = { x: -lastPoint.x, y: lastPoint.y };

        fireEvent.pointerDown(svgContainer, { clientX: iniPoint.x, clientY: iniPoint.y });
        movePointer(svgContainer, 40, iniPoint);
        expectShowGhostAndHideAnnotation();

        fireEvent.pointerUp(svgContainer);

        expect(spyUpdateAnnotation).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isHidden: false,
            })
        );
        expect(screen.queryByLabelText('ghostPolygon')).not.toBeInTheDocument();

        const newPolygon = (spyUpdateAnnotation.mock.calls[0][0] as Annotation).shape;

        expect(transformToClipperShape(testPolygon).totalArea()).toBeGreaterThan(
            transformToClipperShape(newPolygon).totalArea()
        );
    });
});
