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

import { Point, Polygon, Rect } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import { useAddUnfinishedShape } from '../../hooks/use-add-unfinished-shape.hook';
import { annotatorRender } from '../../test-utils/annotator-render';
import {
    GrabcutState,
    GrabcutStateContextProps,
    GrabcutStateProvider,
    useGrabcutState,
} from './grabcut-state-provider.component';
import { GrabcutTool } from './grabcut-tool.component';
import { GrabcutToolType } from './grabcut-tool.enums';

jest.mock('./grabcut-state-provider.component', () => {
    const actual = jest.requireActual('./grabcut-state-provider.component');
    return {
        ...actual,
        useGrabcutState: jest.fn(),
    };
});

jest.mock('../../hooks', () => ({
    useGrabcut: () => ({
        mutation: {},
        cleanModels: jest.fn(),
    }),
}));

jest.mock('../../hooks/use-add-unfinished-shape.hook', () => ({
    useAddUnfinishedShape: jest.fn(),
}));

const sensitivity = 10;
const strokeWidth = 10;
const annotationToolContext = fakeAnnotationToolContext();
const mockRect: Rect = { x: 10, y: 10, width: 100, height: 100, shapeType: ShapeType.Rect };

const renderGrabcutTool = async () => {
    const { container } = annotatorRender(
        <GrabcutStateProvider>
            <GrabcutTool annotationToolContext={annotationToolContext} />
        </GrabcutStateProvider>
    );
    await waitForElementToBeRemoved(screen.getByLabelText(/loading/i));
    return { container };
};

const expectRunGrabcutOnce = (mockGrabcutState: GrabcutStateContextProps) => {
    expect(mockGrabcutState.runGrabcut).toHaveBeenNthCalledWith(
        1,
        annotationToolContext.image,
        expect.any(Number),
        mockGrabcutState.toolsState.sensitivity
    );
};

interface GrabcutStateImplementation {
    isLoading?: boolean;
    runGrabcut?: jest.Mock;
    toolsState?: GrabcutState;
    activeTool?: GrabcutToolType;
    inputRect?: React.MutableRefObject<Rect>;
    backgroundMarkers?: React.MutableRefObject<Point[][]>;
    foregroundMarkers?: React.MutableRefObject<Point[][]>;
}

const updateGrabcutStateImplementation = (data: GrabcutStateImplementation): GrabcutStateContextProps => {
    const mock: unknown = {
        sensitivity,
        strokeWidth,
        isLoading: false,
        runGrabcut: jest.fn(),
        resetConfig: jest.fn(),
        inputRect: { current: null },
        toolsState: { polygon: null },
        foregroundMarkers: { current: [] },
        backgroundMarkers: { current: [] },
        ...data,
    };
    jest.mocked(useGrabcutState).mockReturnValueOnce(mock as GrabcutStateContextProps);
    return mock as GrabcutStateContextProps;
};

const drawRect = (editor: HTMLElement, data: { x: number; y: number; width: number; height: number }) => {
    fireEvent.pointerMove(editor, { clientX: data.x, clientY: data.y });
    fireEvent.pointerDown(editor, { buttons: 1, clientX: data.x, clientY: data.y });
    fireEvent.pointerMove(editor, { clientX: data.x + data.width, clientY: data.y + data.height });
    fireEvent.pointerUp(editor, { buttons: 1, clientX: data.x + data.width, clientY: data.y + data.height });
};

const drawMarkers = (editor: HTMLElement, markers: { x: number; y: number }[]) => {
    const [first, ...others] = markers;

    fireEvent.pointerDown(editor, { clientX: first.x, clientY: first.y, button: 0, buttons: 1 });
    others.forEach(({ x, y }) => fireEvent.pointerMove(editor, { clientX: x, clientY: y, button: 0, buttons: 1 }));

    fireEvent.pointerUp(editor);
};

describe('GrabcutTool', () => {
    it('has useAddUnfinishedShape', async () => {
        const mockGrabcutState = updateGrabcutStateImplementation({
            activeTool: GrabcutToolType.ForegroundTool,
        });
        await renderGrabcutTool();
        jest.mocked(mockGrabcutState.runGrabcut).mockReset();

        expect(useAddUnfinishedShape).toHaveBeenCalled();
    });

    it('ForegroundTool, save the points and call runGrabcut', async () => {
        const mockGrabcutState = updateGrabcutStateImplementation({
            activeTool: GrabcutToolType.ForegroundTool,
        });
        const { container } = await renderGrabcutTool();
        jest.mocked(mockGrabcutState.runGrabcut).mockReset();

        const editor = screen.getByRole('editor');
        const points = [
            { x: 4, y: 42 },
            { x: 5, y: 43 },
        ];
        drawMarkers(editor, points);

        expect(container.querySelector('polyline.inputTool')).not.toBeInTheDocument();
        expect(mockGrabcutState.foregroundMarkers).toEqual({ current: [points] });
        expectRunGrabcutOnce(mockGrabcutState);
    });

    it('BackgroundTool multiple points, save the points and call runGrabcut', async () => {
        const mockGrabcutState = updateGrabcutStateImplementation({
            activeTool: GrabcutToolType.BackgroundTool,
        });
        const { container } = await renderGrabcutTool();
        jest.mocked(mockGrabcutState.runGrabcut).mockReset();

        const editor = screen.getByRole('editor');

        const [pointsOne, pointsTwo] = [
            [
                { x: 4, y: 42 },
                { x: 5, y: 43 },
            ],
            [
                { x: 14, y: 62 },
                { x: 15, y: 63 },
            ],
        ];
        drawMarkers(editor, pointsOne);
        drawMarkers(editor, pointsTwo);

        expect(container.querySelector('polyline.inputTool')).not.toBeInTheDocument();
        expect(mockGrabcutState.backgroundMarkers).toEqual({ current: [pointsOne, pointsTwo] });
        expectRunGrabcutOnce(mockGrabcutState);
    });

    it('render PolygonDraw with ".inputTool" when loading is true', async () => {
        updateGrabcutStateImplementation({
            isLoading: true,
            toolsState: {
                inputRect: mockRect,
                sensitivity,
                background: [],
                foreground: [],
                polygon: {
                    shapeType: ShapeType.Polygon,
                    points: [
                        { x: 4, y: 42 },
                        { x: 5, y: 43 },
                    ],
                },
            },
            activeTool: GrabcutToolType.BackgroundTool,
        });
        const { container } = await renderGrabcutTool();
        const loadingPolyline = container.querySelector('polyline.inputTool') as SVGAElement;

        expect(loadingPolyline).toBeInTheDocument();
    });

    describe('InputTool', () => {
        it('call resetConfig and run runGrabcut after drawing an inputRect', async () => {
            const mockGrabcutState = updateGrabcutStateImplementation({
                activeTool: GrabcutToolType.InputTool,
            });
            await renderGrabcutTool();
            jest.mocked(mockGrabcutState.runGrabcut).mockReset();

            const editor = await screen.findByRole('editor');
            const rectValues = { x: 10, y: 10, width: 50, height: 50 };
            drawRect(editor, rectValues);

            expect(mockGrabcutState.inputRect.current).toEqual({ ...rectValues, shapeType: ShapeType.Rect });
            expect(mockGrabcutState.resetConfig).toHaveBeenCalled();
            expectRunGrabcutOnce(mockGrabcutState);
            expect(annotationToolContext.scene.addShapes).not.toHaveBeenCalled();
        });

        it('accept the previous annotation (call addShapes) with annotation selected false', async () => {
            const polygon: Polygon = { shapeType: ShapeType.Polygon, points: [{ x: 10, y: 10 }] };
            const mockGrabcutState = updateGrabcutStateImplementation({
                toolsState: {
                    polygon,
                    sensitivity,
                    background: [],
                    foreground: [],
                    inputRect: mockRect,
                },
                activeTool: GrabcutToolType.InputTool,
            });

            await renderGrabcutTool();
            jest.mocked(mockGrabcutState.runGrabcut).mockReset();

            const editor = await screen.findByRole('editor');
            const rectValues = { x: 10, y: 10, width: 50, height: 50 };
            drawRect(editor, rectValues);

            expect(mockGrabcutState.resetConfig).toHaveBeenCalled();
            expectRunGrabcutOnce(mockGrabcutState);
            expect(annotationToolContext.scene.addShapes).toHaveBeenCalledWith([polygon], undefined, false);
            expect(mockGrabcutState.inputRect.current).toEqual({ ...rectValues, shapeType: ShapeType.Rect });
        });

        it('render a loadingRect when loading is true', async () => {
            const rect: Rect = {
                x: 10,
                y: 10,
                width: 100,
                height: 100,
                shapeType: ShapeType.Rect,
            };
            const mockGrabcutState = updateGrabcutStateImplementation({
                isLoading: true,
                inputRect: {
                    current: rect,
                },
                activeTool: GrabcutToolType.InputTool,
            });

            const { container } = await renderGrabcutTool();
            jest.mocked(mockGrabcutState.runGrabcut).mockReset();

            const loadingRect = container.querySelector('rect.inputTool') as SVGAElement;

            expect(loadingRect.getAttribute('x')).toBe(`${rect.x}`);
            expect(loadingRect.getAttribute('y')).toBe(`${rect.y}`);
            expect(loadingRect.getAttribute('width')).toBe(`${rect.width}`);
            expect(loadingRect.getAttribute('height')).toBe(`${rect.height}`);
        });
    });
});
