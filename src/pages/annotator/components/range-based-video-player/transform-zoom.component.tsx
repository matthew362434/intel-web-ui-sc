// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { CSSProperties, FC, useEffect } from 'react';

import { TransformComponent, useTransformContext } from 'react-zoom-pan-pinch';

import { MediaItem } from '../../../../core/media';
import { SyncZoomState, useZoom } from '../../../../pages/annotator/zoom';
import zoomClasses from '../../../../pages/annotator/zoom/transform-zoom.module.scss';
import { useSyncScreenSize } from '../../../../pages/annotator/zoom/utils';

export const TransformZoom: FC<{ mediaItem: MediaItem }> = ({ children, mediaItem }): JSX.Element => {
    const {
        resetTransform,
        state: { scale },
    } = useTransformContext();
    const ref = useSyncScreenSize();
    const { isPanning, isPanningDisabled, zoomTarget, screenSize, setZoomTargetOnImage } = useZoom();

    const style = { '--zoom-level': scale } as CSSProperties;
    const enableDragCursorIcon = !isPanningDisabled && isPanning;

    useEffect(() => {
        const width = mediaItem.metadata.width;
        const height = mediaItem.metadata.height;

        const image = new Image();
        image.width = width;
        image.height = height;
        setZoomTargetOnImage({ ...mediaItem, image, annotations: [], predictions: undefined });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenSize]);

    useEffect(() => {
        resetTransform();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoomTarget]);

    return (
        <div
            id='canvas'
            data-testid='transform-zoom-canvas'
            style={style}
            ref={ref}
            className={`${zoomClasses.canvasComponent} ${enableDragCursorIcon ? zoomClasses.isPanning : ''}`}
        >
            <SyncZoomState />
            <TransformComponent wrapperClass={zoomClasses.transformWrapper} contentClass={zoomClasses.transformContent}>
                {children}
            </TransformComponent>
        </div>
    );
};
