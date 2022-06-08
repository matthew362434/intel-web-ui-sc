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

import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Point, Polygon } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import { AnnotationToolContext } from '../../core';
import { useIntelligentScissors } from '../../hooks';
import { removeOffLimitPoints } from '../utils';
import { PolygonStateProvider, usePolygonState } from './polygon-state-provider.component';
import { PolygonTool } from './polygon-tool.component';
import { PolygonMode } from './polygon-tool.enum';

jest.mock('../../hooks/use-intelligent-scissors.hook', () => ({
    useIntelligentScissors: jest.fn(() => [jest.fn(), jest.fn(), jest.fn()]),
}));

jest.mock('lodash', () => ({
    debounce: (callback: () => void) => callback,
}));

jest.mock('../../hooks/use-container-bondingbox.hook', () => ({
    useContainerBoundingBox: jest.fn((roi) => roi),
}));

jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    removeOffLimitPoints: jest.fn((shape) => shape),
}));

const mockOptimizePolygon = jest.fn((polygon) => polygon);
const mockOptimizeSegments = jest.fn((segments: Point[][]) => ({
    shapeType: ShapeType.Polygon,
    points: segments.flat(),
}));

jest.mock('../../../../hooks/use-worker/use-worker.hook', () => ({
    ...jest.requireActual('../../../../hooks/use-worker/use-worker.hook'),
    useWorker: () => ({
        worker: { optimizePolygon: mockOptimizePolygon, optimizeSegments: mockOptimizeSegments },
    }),
}));

const drawShape = async (): Promise<{ editor: HTMLElement; shape: Polygon }> => {
    const editor = await screen.findByRole('editor');

    fireEvent.pointerMove(editor, { clientX: 50, clientY: 50 });
    fireEvent.pointerDown(editor, { buttons: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(editor, { buttons: 1, clientX: 50, clientY: 50 });

    fireEvent.pointerMove(editor, { clientX: 10, clientY: 50 });
    fireEvent.pointerDown(editor, { buttons: 1, clientX: 10, clientY: 50 });

    fireEvent.pointerMove(editor, { clientX: 10, clientY: 10 });
    fireEvent.pointerDown(editor, { buttons: 1, clientX: 10, clientY: 10 });

    fireEvent.pointerMove(editor, { buttons: 1, clientX: 50, clientY: 10 });
    fireEvent.pointerDown(editor, { buttons: 1, clientX: 50, clientY: 10 });

    fireEvent.pointerMove(editor, { buttons: 1, clientX: 50, clientY: 50 });

    const shape: Polygon = {
        shapeType: ShapeType.Polygon,
        points: [
            { x: 50, y: 50 },
            { x: 10, y: 50 },
            { x: 10, y: 10 },
            { x: 50, y: 10 },
        ],
    };

    return { editor, shape };
};

const MagneticLassoPolygonTool = ({ annotationToolContext }: { annotationToolContext: AnnotationToolContext }) => {
    const { setMode } = usePolygonState();

    return (
        <>
            <button onClick={() => setMode(PolygonMode.MagneticLasso)}>change mode to MagneticLasso</button>
            <PolygonTool annotationToolContext={annotationToolContext} />
        </>
    );
};

describe('PolygonTool', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useIntelligentScissors).mockReset();
    });

    it('draws a polygon with segments optimization', async (): Promise<void> => {
        const annotationToolContext = fakeAnnotationToolContext();
        const onComplete = annotationToolContext.scene.addShapes;
        render(
            <PolygonStateProvider>
                <PolygonTool annotationToolContext={annotationToolContext} />
            </PolygonStateProvider>
        );

        const { shape, editor } = await drawShape();
        fireEvent.pointerUp(editor, { buttons: 1, clientX: 50, clientY: 50 });

        await waitFor(() => expect(onComplete).toBeCalledWith([shape]));
        expect(mockOptimizeSegments).toHaveBeenCalledWith(shape.points.map((point) => [point]));
        expect(removeOffLimitPoints).toHaveBeenCalledWith(shape, annotationToolContext.image);
    });

    it('draws a polygon with polygon optimization', async (): Promise<void> => {
        const annotationToolContext = fakeAnnotationToolContext();
        const onComplete = annotationToolContext.scene.addShapes;
        jest.mocked(useIntelligentScissors).mockImplementation((data) => ({
            onPointerUp: () => {
                data.complete(PolygonMode.MagneticLasso);
            },
            onPointerDown: jest.fn(),
            onPointerMove: jest.fn(),
        }));

        render(
            <PolygonStateProvider>
                <MagneticLassoPolygonTool annotationToolContext={annotationToolContext} />
            </PolygonStateProvider>
        );

        const { shape, editor } = await drawShape();
        userEvent.click(screen.getByText('change mode to MagneticLasso'));
        fireEvent.pointerUp(editor, { buttons: 1, clientX: 50, clientY: 50 });

        await waitFor(() => expect(onComplete).toBeCalledWith([shape]));
        expect(mockOptimizePolygon).toHaveBeenCalledWith(shape);
        expect(removeOffLimitPoints).toHaveBeenCalledWith(shape, annotationToolContext.image);
    });

    it('cancels a polygon if the user did not provide additional points', async (): Promise<void> => {
        const annotationToolContext = fakeAnnotationToolContext();
        const onComplete = annotationToolContext.scene.addShapes;
        const { container } = render(
            <PolygonStateProvider>
                <PolygonTool annotationToolContext={annotationToolContext} />
            </PolygonStateProvider>
        );

        const editor = await screen.findByRole('editor');
        fireEvent.pointerMove(editor, { clientX: 10, clientY: 10 });
        fireEvent.pointerDown(editor, { buttons: 1, clientX: 10, clientY: 10 });

        fireEvent.pointerMove(editor, { clientX: 11, clientY: 11 });
        fireEvent.pointerDown(editor, { buttons: 1, clientX: 11, clientY: 11 });
        fireEvent.pointerUp(editor, { buttons: 1, clientX: 11, clientY: 11 });

        expect(onComplete).not.toBeCalled();
        expect(removeOffLimitPoints).not.toHaveBeenCalled();
        expect(container.querySelector('polygon')).toBeNull();
    });
});
