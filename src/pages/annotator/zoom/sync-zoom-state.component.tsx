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

import { useEffect } from 'react';

import isEqual from 'lodash/isEqual';
import { useTransformContext } from 'react-zoom-pan-pinch';

import { usePrevious } from '../../../hooks/use-previous/use-previous.hook';
import { useSelectedMediaItem } from '../providers/selected-media-item-provider/selected-media-item-provider.component';
import { useZoom } from './zoom-provider.component';

export const SyncZoomTarget = () => {
    const { setZoomTargetOnImage, getZoomStateForTarget } = useZoom();
    const { selectedMediaItem } = useSelectedMediaItem();

    const previousSelectedMediaItem = usePrevious(selectedMediaItem);

    const { setTransform } = useTransformContext();

    // Everytime the user changes images, we adjust the zoomTarget
    useEffect(() => {
        if (
            !isEqual(selectedMediaItem?.identifier, previousSelectedMediaItem?.identifier) &&
            selectedMediaItem !== undefined
        ) {
            setZoomTargetOnImage(selectedMediaItem);

            const image = selectedMediaItem.image;
            const imageTarget = {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            };

            const {
                zoom,
                translation: { x, y },
            } = getZoomStateForTarget(imageTarget);

            setTransform(x, y, zoom, 200);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMediaItem, previousSelectedMediaItem, setZoomTargetOnImage]);

    return <></>;
};

/*
    This component is responsible for:

    - Reset the zoomState if the selectedMedia changes
    - Reset the zoomState if the selectedTask is a global task
    - Zoom in on the annotation if the selectedTask is a local task
*/
export const SyncZoomState = (): JSX.Element => {
    const { zoomTarget, zoomState, setZoomState, getZoomStateForTarget, screenSize } = useZoom();

    const {
        state: { scale, positionX, positionY },
        setTransform,
    } = useTransformContext();

    // To keep the 'react-zoom-pan-pinch' zoomState in sync with the ZoomProvider
    useEffect(() => {
        const { zoom } = zoomState;

        if (scale !== zoom) {
            setZoomState(() => ({
                zoom: scale,
                translation: { x: positionX, y: positionY },
            }));
        }
    }, [setZoomState, scale, positionX, positionY, zoomState]);

    // Everytime the target changes, we need to adjust the zoom level
    const previousZoomTarget = usePrevious(zoomTarget);
    useEffect(() => {
        if (
            zoomTarget &&
            zoomTarget.width !== 0 &&
            zoomTarget.height !== 0 &&
            zoomTarget.width !== previousZoomTarget?.width &&
            zoomTarget.height !== previousZoomTarget?.height
        ) {
            const {
                zoom,
                translation: { x, y },
            } = getZoomStateForTarget(zoomTarget);

            setTransform(x, y, zoom, 200);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getZoomStateForTarget, zoomTarget]);

    // Reset zoom if screen size changes
    useEffect(() => {
        if (zoomTarget !== previousZoomTarget) {
            return;
        }

        if (screenSize !== undefined && zoomTarget !== undefined) {
            const {
                zoom,
                translation: { x, y },
            } = getZoomStateForTarget(zoomTarget);

            setTransform(x, y, zoom, 200);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenSize, zoomTarget, previousZoomTarget]);

    return <></>;
};
