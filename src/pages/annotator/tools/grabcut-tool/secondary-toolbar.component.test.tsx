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

import { Rect } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext, getById } from '../../../../test-utils';
import { annotatorRender } from '../../test-utils/annotator-render';
import { GrabcutStateContextProps, GrabcutStateProvider, useGrabcutState } from './grabcut-state-provider.component';
import { GrabcutToolType } from './grabcut-tool.enums';
import { SecondaryToolbar } from './secondary-toolbar.component';

jest.mock('./grabcut-state-provider.component', () => {
    const actual = jest.requireActual('./grabcut-state-provider.component');
    return {
        ...actual,
        useGrabcutState: jest.fn(() => ({
            ...actual.useGrabcutState(),
        })),
    };
});

jest.mock('../../hooks', () => ({
    useGrabcut: () => ({
        mutation: {},
        cleanModels: jest.fn(),
    }),
}));

const annotationToolContext = fakeAnnotationToolContext();
const mockRect: Rect = { x: 10, y: 10, width: 100, height: 100, shapeType: ShapeType.Rect };

const renderToolbar = async () => {
    const { container } = annotatorRender(
        <GrabcutStateProvider>
            <SecondaryToolbar annotationToolContext={annotationToolContext} />
        </GrabcutStateProvider>
    );
    await waitForElementToBeRemoved(screen.getByLabelText(/loading/i));
    return container;
};

const updateGrabcutStateImplementation = (data: Partial<GrabcutStateContextProps>) => {
    jest.mocked(useGrabcutState).mockImplementationOnce(() => {
        const actual = jest.requireActual('./grabcut-state-provider.component');
        const defaultOptions = { toolsState: { polygon: {}, sensitivity: 20 }, setSensitivity: jest.fn() };

        return {
            ...actual,
            ...defaultOptions,
            ...data,
        };
    });
};

const expectDisableTool = (container: HTMLElement, label: string) => {
    const tool = getById(container, label);
    expect(tool).toBeInTheDocument();
    expect(tool).toHaveAttribute('disabled');
};

describe('Grabcut Secondary Toolbar', () => {
    it('has title "Object selection"', async () => {
        await renderToolbar();
        expect(screen.getByText('Object selection')).toBeInTheDocument();
    });

    it('has InputTool selected by default', async () => {
        const container = await renderToolbar();
        const grabcutInputTool = getById(container, GrabcutToolType.InputTool);
        expect(grabcutInputTool).toBeInTheDocument();
        expect(grabcutInputTool).toHaveAttribute('aria-pressed', 'true');
    });

    it('InputTool is disabled when runGrabcut is loading', async () => {
        updateGrabcutStateImplementation({
            inputRect: { current: mockRect },
            isLoading: true,
        });
        const container = await renderToolbar();
        expectDisableTool(container, GrabcutToolType.InputTool);
    });

    it('has ForegroundTool disabled', async () => {
        const container = await renderToolbar();
        expectDisableTool(container, GrabcutToolType.ForegroundTool);
    });

    it('ForegroundTool is disabled when runGrabcut is loading', async () => {
        updateGrabcutStateImplementation({
            inputRect: { current: mockRect },
            isLoading: true,
        });
        const container = await renderToolbar();
        expectDisableTool(container, GrabcutToolType.ForegroundTool);
    });

    it('has BackgroundTool disabled', async () => {
        const container = await renderToolbar();
        expectDisableTool(container, GrabcutToolType.BackgroundTool);
    });

    it('BackgroundTool is disabled when runGrabcut is loading', async () => {
        updateGrabcutStateImplementation({
            inputRect: { current: mockRect },
            isLoading: true,
        });
        const container = await renderToolbar();
        expectDisableTool(container, GrabcutToolType.BackgroundTool);
    });

    it('has sensitivity slider', async () => {
        await renderToolbar();
        expect(screen.getByText('Sensitivity:')).toBeInTheDocument();
    });

    it('Sensitivity slider is disabled when runGrabcut is loading', async () => {
        updateGrabcutStateImplementation({
            inputRect: { current: mockRect },
            isLoading: true,
        });
        await renderToolbar();
        expect(screen.getByLabelText('Sensitivity button')).toHaveAttribute('disabled');
    });

    describe('has acceptanceTools and polygon', () => {
        const toolsState = {
            polygon: {
                shapeType: ShapeType.Polygon,
                points: [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                    { x: 3, y: 3 },
                ],
            },
        };
        const resetConfig = jest.fn();

        beforeEach(() => {
            updateGrabcutStateImplementation({
                toolsState: {
                    inputRect: { shapeType: ShapeType.Rect, x: 0, y: 10, width: 100, height: 110 },
                    sensitivity: 20,
                    polygon: {
                        shapeType: ShapeType.Polygon,
                        points: [
                            { x: 1, y: 1 },
                            { x: 2, y: 2 },
                            { x: 3, y: 3 },
                        ],
                    },
                    background: [],
                    foreground: [],
                },
                resetConfig,
                isLoading: true,
            });
        });

        it('has reject annotation option', async () => {
            await renderToolbar();
            expect(screen.getByLabelText('reject annotation')).toBeInTheDocument();
        });

        it('has accept annotation option', async () => {
            await renderToolbar();
            expect(screen.getByLabelText('accept annotation')).toBeInTheDocument();
        });

        it('should add the shape and reset the tools config', async () => {
            await renderToolbar();
            fireEvent.click(screen.getByLabelText('accept annotation'));

            expect(annotationToolContext.scene.addShapes).toHaveBeenCalledWith([toolsState.polygon]);
            expect(resetConfig).toHaveBeenCalled();
        });

        it('should reset the tools config', async () => {
            await renderToolbar();
            fireEvent.click(screen.getByLabelText('reject annotation'));

            expect(resetConfig).toHaveBeenCalled();
        });
    });

    describe('hotkeys', () => {
        it('ForegroundTool, should call setActiveTool', async () => {
            const setActiveTool = jest.fn();
            updateGrabcutStateImplementation({ setActiveTool, isLoading: false });
            const container = await renderToolbar();

            fireEvent.keyDown(container, {
                key: 'Shift',
                code: 'ShiftLeft',
                keyCode: 16,
                charCode: 0,
            });

            expect(setActiveTool).toBeCalledWith(GrabcutToolType.ForegroundTool);
        });

        it('BackgroundTool, should call setActiveTool', async () => {
            const setActiveTool = jest.fn();
            updateGrabcutStateImplementation({ setActiveTool, isLoading: false });
            const container = await renderToolbar();

            fireEvent.keyDown(container, {
                key: 'Alt',
                code: 'AltLeft',
                keyCode: 18,
            });

            expect(setActiveTool).toBeCalledWith(GrabcutToolType.BackgroundTool);
        });

        it('should not call setActiveTool when toolsState is null', async () => {
            const setActiveTool = jest.fn();
            updateGrabcutStateImplementation({
                setActiveTool,
                toolsState: undefined,
                isLoading: false,
            });
            const container = await renderToolbar();

            fireEvent.keyDown(container, {
                key: 'Shift',
                code: 'ShiftLeft',
                keyCode: 16,
            });

            expect(setActiveTool).not.toBeCalled();

            fireEvent.keyDown(container, {
                key: 'Alt',
                code: 'AltLeft',
                keyCode: 18,
                charCode: 0,
            });

            expect(setActiveTool).not.toBeCalled();
        });
    });
});
