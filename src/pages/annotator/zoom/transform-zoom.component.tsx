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

import { CSSProperties, FC, PointerEvent } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';
import { TransformComponent, useTransformContext } from 'react-zoom-pan-pinch';

import { useAnnotator } from '../providers';
import { isLeftButton, isWheelButton } from '../tools/buttons-utils';
import { PointerType } from '../tools/tools.interface';
import classes from './transform-zoom.module.scss';
import { useZoomIntoAnnotation } from './use-zoom-into-annotations.hook';
import { useSyncScreenSize } from './utils';
import { useZoom } from './zoom-provider.component';

/*
    This component is responsible for:

    - Keeping the 'react-zoom-pan-pinch' zoomState in sync with the ZoomProvider
    - Update the zoom state if the target or screenSize change
*/

export const TransformZoom: FC = ({ children }): JSX.Element => {
    const { hotKeys } = useAnnotator();
    const {
        resetTransform,
        state: { scale },
    } = useTransformContext();
    const ref = useSyncScreenSize();
    const { setIsPanningDisabled, isPanning, isPanningDisabled } = useZoom();

    const style = { '--zoom-level': scale } as CSSProperties;
    const enableDragCursorIcon = !isPanningDisabled && isPanning;

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const isPressingPanningHotKeys = (isLeftButton(event) && event.ctrlKey) || isWheelButton(event);

        if (isPressingPanningHotKeys || event.pointerType === PointerType.Touch) {
            setIsPanningDisabled(false);
        } else {
            setIsPanningDisabled(true);
        }

        return;
    };

    useHotkeys(
        hotKeys.zoom,
        (event) => {
            event.preventDefault();

            resetTransform();
        },
        [resetTransform]
    );

    useZoomIntoAnnotation();

    return (
        <div
            id='canvas'
            data-testid='transform-zoom-canvas'
            style={style}
            ref={ref}
            className={`${classes.canvasComponent} ${enableDragCursorIcon ? classes.isPanning : ''}`}
            onPointerDown={handlePointerDown}
        >
            <TransformComponent wrapperClass={classes.transformWrapper} contentClass={classes.transformContent}>
                {children}
            </TransformComponent>
        </div>
    );
};
