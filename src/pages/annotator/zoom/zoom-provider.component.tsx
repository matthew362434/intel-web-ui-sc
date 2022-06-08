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

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useState } from 'react';

import { TransformWrapper } from 'react-zoom-pan-pinch';

import { Rect } from '../../../core/annotations';
import { SelectedMediaItem } from '../../../core/media';
import { MissingProviderError } from '../../../shared/missing-provider-error';

export type ZoomTarget = Omit<Rect, 'shapeType'> | undefined;

export interface ZoomState {
    zoom: number;
    translation: {
        x: number;
        y: number;
    };
}

interface ZoomContextProps {
    zoomState: ZoomState;
    setZoomState: Dispatch<SetStateAction<ZoomState>>;

    zoomTarget: ZoomTarget;
    setZoomTarget: Dispatch<SetStateAction<ZoomTarget>>;
    getZoomStateForTarget: (target: Exclude<ZoomTarget, undefined>) => ZoomState;

    setZoomTargetOnImage: (selectedMediaItem?: SelectedMediaItem) => void;

    isPanning: boolean;
    isPanningDisabled: boolean;
    setIsPanningDisabled: (disabled: boolean) => void;

    screenSize: { width: number; height: number } | undefined;
    setScreenSize: Dispatch<SetStateAction<{ width: number; height: number } | undefined>>;
}

interface ZoomProviderProps {
    children: ReactNode;
}

const DEFAULT_SCREEN_ZOOM = 0.9;
const defaultZoomState = {
    zoom: 1.0,
    translation: { x: 0, y: 0 },
};

const ZoomContext = createContext<ZoomContextProps | undefined>(undefined);

export const ZoomProvider = ({ children }: ZoomProviderProps): JSX.Element => {
    const [isPanningDisabled, setIsPanningDisabled] = useState(true);
    const [isPanning, setIsPanning] = useState(false);
    const [zoomState, setZoomState] = useState<ZoomState>(defaultZoomState);

    // Once we set a new scale, it means the zoom bounds (min/max zoom) change
    // E.g. when we zoom into an annotation the new scale belongs to the annotation's bounding box dimensions,
    // and not the original image
    const [initialZoomState, setInitialZoomState] = useState<ZoomState>(defaultZoomState);

    const [zoomTarget, setZoomTarget] = useState<ZoomTarget>();
    const [screenSize, setScreenSize] = useState<{ width: number; height: number } | undefined>();

    const getZoomStateForTarget = useCallback(
        (target: Exclude<ZoomTarget, undefined>): ZoomState => {
            if (!screenSize || !target) {
                return zoomState;
            }

            const scale =
                DEFAULT_SCREEN_ZOOM * Math.min(screenSize.width / target.width, screenSize.height / target.height);

            // Center the target in the middle of the screen
            const centerOffsetX = (screenSize.width - scale * target.width) / 2;
            const centerOffsetY = (screenSize.height - scale * target.height) / 2;
            const x = -scale * target.x + centerOffsetX;
            const y = -scale * target.y + centerOffsetY;

            return { translation: { x, y }, zoom: scale };
        },
        [screenSize, zoomState]
    );

    const setZoomTargetOnImage = useCallback(
        (selectedMediaItem?: SelectedMediaItem): void => {
            if (!selectedMediaItem) {
                return;
            }

            const image = selectedMediaItem.image;

            const imageTarget = {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            };

            // By setting a new target, the `setTransform` from `TransformZoom` will apply the correct zoomState
            setZoomTarget(imageTarget);

            const imageZoomState = getZoomStateForTarget(image);

            setInitialZoomState(imageZoomState);
        },
        [getZoomStateForTarget]
    );

    const value: ZoomContextProps = {
        zoomState,
        setZoomState,

        isPanning,
        isPanningDisabled,
        setIsPanningDisabled,

        zoomTarget,
        setZoomTarget,
        getZoomStateForTarget,

        setZoomTargetOnImage,

        screenSize,
        setScreenSize,
    };

    return (
        <ZoomContext.Provider value={value}>
            <TransformWrapper
                panning={{
                    disabled: isPanningDisabled,
                    velocityDisabled: true,
                }}
                minScale={Math.min(1, initialZoomState.zoom)}
                maxScale={initialZoomState.zoom * 10}
                initialScale={initialZoomState.zoom}
                initialPositionX={initialZoomState.translation.x}
                initialPositionY={initialZoomState.translation.y}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setIsPanning(false)}
                limitToBounds={false}
                doubleClick={{ mode: 'reset' }}
            >
                {children}
            </TransformWrapper>
        </ZoomContext.Provider>
    );
};

export const useZoom = (): ZoomContextProps => {
    const context = useContext(ZoomContext);

    if (context === undefined) {
        throw new MissingProviderError('useZoom', 'ZoomProvider');
    }

    return context;
};
