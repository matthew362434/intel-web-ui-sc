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

import { memo, useEffect, useRef, useState } from 'react';

import { Flex } from '@react-spectrum/layout';

import { Shape } from '../../../../../core/annotations';
import { Loading } from '../../../../../shared/components';
import { extractAnnotationFromImage } from '../utils';
import classes from './annotation-list-thumbnail.module.scss';

interface AnnotationListItemThumbnailProps {
    annotationShape: Shape;
    annotationId: string;
    isSelected: boolean;
    onSelectAnnotation: (isSelected: boolean) => void;
    image: HTMLImageElement;
    width?: number;
    height?: number;
}

const THUMBNAIL_DIMENSIONS = {
    width: 78, // Plus 2px from borders
    height: 78,
};

export const AnnotationListItemThumbnail = memo(
    ({
        annotationShape,
        annotationId,
        isSelected,
        onSelectAnnotation,
        image,
        width = THUMBNAIL_DIMENSIONS.width,
        height = THUMBNAIL_DIMENSIONS.height,
    }: AnnotationListItemThumbnailProps): JSX.Element => {
        const [isDrawing, setIsDrawing] = useState<boolean>(false);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);

        useEffect(() => {
            setIsDrawing(true);

            // While we wait for:
            //      - offScreenCanvas support (https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
            //      - React 18 useTransition (https://reactjs.org/docs/concurrent-mode-patterns.html)
            // I had to use an event loop hack to avoid canvas drawing for locking the main thread.
            const drawingTimeout = setTimeout(() => {
                extractAnnotationFromImage(image, annotationShape, canvasRef.current);

                setIsDrawing(false);
            }, 0);

            return () => {
                clearTimeout(drawingTimeout);
            };

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <Flex
                alignItems='center'
                justifyContent='center'
                UNSAFE_className={`${classes.thumbnailWrapper} ${isSelected ? classes.isSelected : ''}`}
                UNSAFE_style={{ width, height, position: 'relative' }}
                data-testid={`annotation-${annotationId}-thumbnailWrapper`}
            >
                {isDrawing && <Loading size='S' overlay />}
                <canvas
                    id={`annotation-${annotationId}-thumbnail`}
                    data-testid={`annotation-${annotationId}-thumbnail`}
                    style={{ objectFit: 'contain', width, height }}
                    ref={canvasRef}
                    onClick={() => onSelectAnnotation(!isSelected)}
                />
            </Flex>
        );
    }
);
