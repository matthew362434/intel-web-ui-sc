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
import { PointerEvent } from 'react';

import { renderHook, act } from '@testing-library/react-hooks';
import { useMutation, UseMutationResult } from 'react-query';

import { Point } from '../../../core/annotations';
import { BUTTON_LEFT, BUTTON_RIGHT } from '../tools/buttons-utils';
import { PolygonStateContextProps, usePolygonState } from '../tools/polygon-tool/polygon-state-provider.component';
import { PolygonMode } from '../tools/polygon-tool/polygon-tool.enum';
import { IntelligentScissorsWorker } from '../tools/polygon-tool/polygon-tool.interface';
import { PointerType } from '../tools/tools.interface';
import { IntelligentScissorsProps, useIntelligentScissors } from './use-intelligent-scissors.hook';

jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useMutation: jest.fn(),
}));

jest.mock('../../../notification', () => ({
    ...jest.requireActual('../../../notification'),
    useNotification: () => ({
        addNotification: jest.fn(),
    }),
}));

jest.mock('../tools/polygon-tool/polygon-state-provider.component', () => ({
    ...jest.requireActual('../tools/polygon-tool/polygon-state-provider.component'),
    usePolygonState: jest.fn(),
}));

const intelligentScissorMock: unknown = () => {
    return {
        isModuleLoaded: jest.fn(),
        IntelligentScissors: jest.fn(() => ({
            applyImage: jest.fn(),
        })),
    };
};

const mockProps = ({ canPathBeClosed = false }: { canPathBeClosed?: boolean }): IntelligentScissorsProps => ({
    zoom: 1,
    polygon: null,
    lassoSegment: [],
    image: new Image(),
    complete: jest.fn(),
    setPointerLine: jest.fn(() => []),
    setLassoSegment: jest.fn(() => []),
    canPathBeClosed: () => canPathBeClosed,
    setPointFromEvent: jest.fn(
        (callback: (point: Point) => void) => (event: PointerEvent<SVGSVGElement>) =>
            callback({ x: event.clientX, y: event.clientY })
    ),
    worker: intelligentScissorMock as IntelligentScissorsWorker,
});

interface iMockEvent {
    button?: number;
    buttons?: number;
    pointerType?: PointerType;
}

const mockEvent = ({
    button = BUTTON_LEFT.button,
    buttons = BUTTON_LEFT.buttons,
    pointerType = PointerType.Mouse,
}: iMockEvent): unknown => ({
    preventDefault: jest.fn(),
    pointerType,
    button,
    buttons,
    clientX: 10,
    clientY: 20,
});

const updateUseMutation = () => {
    const mocks: unknown = {
        mutate: jest.fn(),
    };

    jest.mocked(useMutation).mockImplementationOnce(() => mocks as UseMutationResult);
    return mocks as UseMutationResult;
};

const updateUsePolygonState = ({ segments = [] }: { segments?: Point[] }) => {
    const mocks: unknown = {
        segments,
        mode: PolygonMode.MagneticLasso,
        setMode: jest.fn(),
        setSegments: jest.fn(),
        undoRedoActions: jest.fn(),
        isIntelligentScissorsLoaded: false,
        setIsIntelligentScissorsLoaded: jest.fn(),
    };

    jest.mocked(usePolygonState).mockImplementationOnce(() => mocks as PolygonStateContextProps);
    return mocks as PolygonStateContextProps;
};

describe('useIntelligentScissors', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('onPointerDown', () => {
        it('call preventDefault when pointerType is "Touch"', () => {
            const hookProps = mockProps({});
            const polygonState = updateUsePolygonState({});
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({ ...BUTTON_RIGHT, pointerType: PointerType.Touch }) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
            });

            expect(event.preventDefault).toBeCalled();
            expect(polygonState.setMode).not.toHaveBeenCalled();
            expect(hookProps.setLassoSegment).not.toHaveBeenCalled();
            expect(polygonState.setSegments).not.toHaveBeenCalled();
        });

        it('call setMode Eraser when is right chick', () => {
            const hookProps = mockProps({});
            const polygonState = updateUsePolygonState({});
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({ ...BUTTON_RIGHT }) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
            });

            expect(event.preventDefault).toBeCalled();
            expect(hookProps.setLassoSegment).not.toHaveBeenCalled();
            expect(polygonState.setSegments).not.toHaveBeenCalled();
            expect(polygonState.setMode).toHaveBeenCalledWith(PolygonMode.Eraser);
        });

        it('call setLassoSegment and setSegments when buildMapPoint is empty', () => {
            const hookProps = mockProps({});
            const polygonState = updateUsePolygonState({});
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({}) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
            });

            expect(hookProps.complete).not.toHaveBeenCalledWith(PolygonMode.MagneticLasso);
            expect(hookProps.setLassoSegment).toHaveBeenCalledWith([]);
            expect(polygonState.setSegments).toHaveBeenCalledWith([[{ x: event.clientX, y: event.clientY }]]);
        });
    });

    describe('onPointerMove', () => {
        it('unless segments have info do nothing', () => {
            const hookProps = mockProps({});
            updateUsePolygonState({});
            const mutationData = updateUseMutation();
            const { result } = renderHook(() => useIntelligentScissors(hookProps));

            act(() => {
                result.current.onPointerMove(mockEvent({}) as PointerEvent<SVGSVGElement>);
            });

            expect(hookProps.complete).not.toHaveBeenCalled();
            expect(hookProps.setPointerLine).not.toHaveBeenCalled();
            expect(hookProps.setLassoSegment).not.toHaveBeenCalled();
            expect(mutationData.mutate).not.toHaveBeenCalled();
        });

        it('call mutation handler when sections are not empty', () => {
            const hookProps = mockProps({});
            const mutationData = updateUseMutation();
            const point = { x: 10, y: 20 };
            updateUsePolygonState({ segments: [point] });
            const { result } = renderHook(() => useIntelligentScissors(hookProps));

            act(() => {
                result.current.onPointerMove(mockEvent({}) as PointerEvent<SVGSVGElement>);
            });

            expect(mutationData.mutate).toHaveBeenCalledWith(point);
            expect(hookProps.complete).not.toHaveBeenCalled();
            expect(hookProps.setPointerLine).not.toHaveBeenCalled();
            expect(hookProps.setLassoSegment).not.toHaveBeenCalled();
        });

        it('call setLassoSegment and setSegments when isFreeDrawing is true', () => {
            const hookProps = mockProps({});
            const point = { x: 10, y: 20 };
            updateUsePolygonState({ segments: [point] });
            const mutationData = updateUseMutation();
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({}) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
                jest.mocked(hookProps.setLassoSegment).mockReset();
                result.current.onPointerMove(event);
            });

            expect(hookProps.complete).not.toHaveBeenCalled();
            expect(mutationData.mutate).not.toHaveBeenCalled();
            expect(hookProps.setPointerLine).toHaveBeenCalledTimes(1);
            expect(hookProps.setLassoSegment).toHaveBeenCalledTimes(1);
        });
    });

    describe('onPointerUp', () => {
        it('call setLassoSegment and setSegments when isFreeDrawing and canPathBeClosed is false', () => {
            const hookProps = mockProps({});
            const polygonState = updateUsePolygonState({ segments: [{ x: 10, y: 20 }] });
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({}) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
                result.current.onPointerMove(event);
                jest.mocked(hookProps.setLassoSegment).mockReset();
                jest.mocked(polygonState.setSegments).mockReset();
                result.current.onPointerUp(event);
            });

            expect(hookProps.complete).not.toBeCalled();
            expect(hookProps.setLassoSegment).toHaveBeenCalledWith([]);
            expect(polygonState.setSegments).toHaveBeenCalledTimes(1);
        });

        it('call complete when canPathBeClosed', () => {
            updateUseMutation();
            const hookProps = mockProps({ canPathBeClosed: true });
            const polygonState = updateUsePolygonState({ segments: [{ x: 10, y: 20 }] });
            const { result } = renderHook(() => useIntelligentScissors(hookProps));
            const event = mockEvent({}) as PointerEvent<SVGSVGElement>;
            act(() => {
                result.current.onPointerDown(event);
                result.current.onPointerMove(event);
                jest.mocked(hookProps.setLassoSegment).mockReset();
                jest.mocked(polygonState.setSegments).mockReset();
                result.current.onPointerUp(event);
            });

            expect(polygonState.setSegments).not.toHaveBeenCalled();
            expect(hookProps.setLassoSegment).not.toHaveBeenCalled();
            expect(hookProps.complete).toBeCalledWith(PolygonMode.MagneticLasso);
        });
    });
});
