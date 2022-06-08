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

import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { Point, Polygon, Rect } from '../../../../core/annotations';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useGrabcut } from '../../hooks';
import { StateProviderProps } from '../tools.interface';
import UndoRedoProvider from '../undo-redo/undo-redo-provider.component';
import useUndoRedoState, { SetStateWrapper } from '../undo-redo/use-undo-redo-state';
import { GrabcutToolType } from './grabcut-tool.enums';
import { sensitivityConfig } from './util';

export interface GrabcutStateContextProps {
    isLoading: boolean;
    toolsState: GrabcutState;
    activeTool: GrabcutToolType;
    resetConfig: () => void;
    setToolsState: SetStateWrapper<GrabcutState>;
    setActiveTool: (activeTool: GrabcutToolType) => void;
    inputRect: React.MutableRefObject<Rect | null>;
    foregroundMarkers: React.MutableRefObject<Point[][]>;
    backgroundMarkers: React.MutableRefObject<Point[][]>;
    runGrabcut: (image: HTMLImageElement, strokeWidth: number, sensitivity: number) => void;
}

const GrabcutStateContext = createContext<GrabcutStateContextProps | undefined>(undefined);

export interface GrabcutState {
    polygon: Polygon | null;
    inputRect: Rect | null;
    background: Point[][];
    foreground: Point[][];
    sensitivity: number;
}

const initialState = (sensitivity = sensitivityConfig.default): GrabcutState => ({
    polygon: null,
    foreground: [],
    background: [],
    inputRect: null,
    sensitivity,
});

export const GrabcutStateProvider = ({ children }: StateProviderProps): JSX.Element => {
    const inputRect = useRef<Rect | null>(null);
    const { addNotification } = useNotification();
    const foregroundMarkers = useRef<Point[][]>([]);
    const backgroundMarkers = useRef<Point[][]>([]);
    const [toolsState, setToolsState, undoRedoActions] = useUndoRedoState<GrabcutState>(initialState());
    const [activeTool, setActiveTool] = useState<GrabcutToolType>(GrabcutToolType.InputTool);

    const showNotificationError = () => {
        addNotification('Failed to select the shape boundaries, could you please try again?', NOTIFICATION_TYPE.ERROR);
        resetConfig();
    };

    const { mutation, cleanModels, isLoadingGrabcut } = useGrabcut({
        showNotificationError,
        onSuccess: ({ shapeType, points }, { foreground, background, sensitivity, ...variables }) => {
            if (points?.length) {
                setToolsState({
                    foreground: [...foreground],
                    background: [...background],
                    sensitivity,
                    inputRect: variables.inputRect,
                    polygon: { shapeType, points },
                });
            } else {
                resetConfig();
            }
        },
    });

    useEffect(() => {
        if (mutation.isLoading) {
            return;
        }

        foregroundMarkers.current = [...toolsState.foreground];
        backgroundMarkers.current = [...toolsState.background];
        inputRect.current = toolsState.inputRect;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toolsState.foreground, toolsState.background, toolsState.inputRect]);

    const runGrabcut = (image: HTMLImageElement, strokeWidth: number, sensitivity: number): void => {
        if (inputRect.current) {
            mutation.mutate({
                image,
                activeTool,
                strokeWidth,
                sensitivity,
                inputRect: inputRect.current,
                foreground: foregroundMarkers.current,
                background: backgroundMarkers.current,
            });
        }
    };

    const resetConfig = () => {
        cleanModels();

        inputRect.current = null;
        foregroundMarkers.current = [];
        backgroundMarkers.current = [];
        undoRedoActions.reset(initialState(toolsState.sensitivity));

        setActiveTool(GrabcutToolType.InputTool);
    };

    return (
        <GrabcutStateContext.Provider
            value={{
                toolsState,
                inputRect,
                activeTool,
                resetConfig,
                setActiveTool,
                setToolsState,
                foregroundMarkers,
                backgroundMarkers,
                runGrabcut,
                isLoading: isLoadingGrabcut || mutation.isLoading,
            }}
        >
            <UndoRedoProvider state={undoRedoActions}>{children}</UndoRedoProvider>
        </GrabcutStateContext.Provider>
    );
};

export const useGrabcutState = (): GrabcutStateContextProps => {
    const context = useContext(GrabcutStateContext);

    if (context === undefined) {
        throw new MissingProviderError('useGrabcutState', 'GrabcutStateProvider');
    }

    return context;
};
