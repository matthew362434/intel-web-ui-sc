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

import { Annotation, getBoundingBox, Shape } from '../../../../core/annotations';

export const reorder = (annotations: Annotation[], startIndex: number, endIndex: number): Annotation[] => {
    const newAnnotations = [...annotations];
    const [draggedAnnotation] = newAnnotations.splice(startIndex, 1);

    newAnnotations.splice(endIndex, 0, draggedAnnotation);

    return newAnnotations.map((annotation: Annotation, index) => ({ ...annotation, zIndex: index }));
};

export const extractAnnotationFromImage = (
    image: HTMLImageElement,
    annotationShape: Shape,
    destinationCanvas: HTMLCanvasElement | null
): void => {
    if (!destinationCanvas) {
        return;
    }

    const canvas = destinationCanvas;

    const crop = getBoundingBox(annotationShape);

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    if (ctx === null) {
        return;
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
    );
};
