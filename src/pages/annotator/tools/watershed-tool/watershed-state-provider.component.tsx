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
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

import { UseMutateFunction, useMutation } from 'react-query';

import { AlgorithmType, useWorker } from '../../../../hooks/use-worker/use-worker.hook';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { UndoRedoActions } from '../../core';
import { Marker } from '../marker-tool/marker-tool.interface';
import { StateProviderProps } from '../tools.interface';
import UndoRedoProvider from '../undo-redo/undo-redo-provider.component';
import useUndoRedoState, { SetStateWrapper } from '../undo-redo/use-undo-redo-state';
import { RunWatershedProps, WatershedMethods, WatershedPolygon, WatershedWorker } from './watershed-tool.interface';

interface WatershedState {
    markers: Marker[];
    watershedPolygons: WatershedPolygon[];
}
interface WatershedStateContextProps {
    shapes: WatershedState;
    setShapes: SetStateWrapper<WatershedState>;
    watershedPolygons?: WatershedPolygon[];
    undoRedoActions: UndoRedoActions<WatershedState>;
    onComplete: (markers: Marker[]) => void;
    runWatershed: UseMutateFunction<WatershedPolygon[], unknown, RunWatershedProps, unknown>;
    reset: () => void;
}

const WatershedStateContext = createContext<WatershedStateContextProps | undefined>(undefined);

export const WatershedStateProvider = ({ children }: StateProviderProps): JSX.Element => {
    const { worker } = useWorker(AlgorithmType.WATERSHED) as {
        worker: WatershedWorker;
    };

    const wsInstance = useRef<WatershedMethods | null>(null);

    const { addNotification } = useNotification();

    const [shapes, setShapes, undoRedoActions] = useUndoRedoState<WatershedState>({
        markers: [],
        watershedPolygons: [],
    });

    const runWatershed = async (runWatershedProps: RunWatershedProps) => {
        // Create a new Watershed instance or use the previously instanciated one
        if (!wsInstance.current) {
            wsInstance.current = await new worker.Watershed(runWatershedProps.imageData);
        }

        if (wsInstance.current) {
            return wsInstance.current.executeWatershed(runWatershedProps.markers, runWatershedProps.sensitivity);
        }

        return [];
    };

    const { mutate, reset: resetMutation } = useMutation(runWatershed, {
        onError: () => {
            addNotification('Failed to run watershed algorithm, could you please try again?', NOTIFICATION_TYPE.ERROR);
        },
        onSuccess: (data) => {
            setShapes((previousShapes) => ({
                markers: [...previousShapes.markers],
                watershedPolygons: data,
            }));
        },
    });

    const reset = useCallback(async () => {
        undoRedoActions.reset();
        resetMutation();

        // Clear instance memory and delete it afterwards
        if (wsInstance.current) {
            await wsInstance.current.clearMemory();

            wsInstance.current = null;
        }
    }, [resetMutation, undoRedoActions, wsInstance]);

    const handleComplete = (newMarkers: Marker[]) => {
        setShapes(
            (previousShapes) => ({
                markers: [...previousShapes.markers, ...newMarkers],
                watershedPolygons: [...previousShapes.watershedPolygons],
            }),
            false
        );
    };

    useEffect(() => {
        const previousInstance = wsInstance.current;

        // Clear previous instance and terminate the current worker
        return () => {
            if (previousInstance) {
                previousInstance.clearMemory();
            }

            wsInstance.current = null;
        };
    }, [worker, wsInstance]);

    return (
        <WatershedStateContext.Provider
            value={{
                shapes,
                setShapes,
                undoRedoActions,
                runWatershed: mutate,
                reset,
                onComplete: handleComplete,
            }}
        >
            <UndoRedoProvider state={undoRedoActions}>{children}</UndoRedoProvider>
        </WatershedStateContext.Provider>
    );
};

export const useWatershedState = (): WatershedStateContextProps => {
    const context = useContext(WatershedStateContext);

    if (context === undefined) {
        throw new MissingProviderError('useWatershedState', 'WatershedStateProvider');
    }

    return context;
};
