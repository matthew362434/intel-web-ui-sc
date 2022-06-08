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
import type OpenCVTypes from 'OpenCVTypes';

import { Point } from '../core/annotations';

export const drawRectangle = (CV: OpenCVTypes.cv, src: OpenCVTypes.Mat, rect: OpenCVTypes.RectLike): void => {
    const color = new CV.Scalar(255, 0, 0);
    const startPoint = new CV.Point(rect.x, rect.y);
    const endPoint = new CV.Point(rect.x + rect.width, rect.y + rect.height);

    CV.rectangle(src, startPoint, endPoint, color);
};

export const formatContourToPoints = (
    mask: OpenCVTypes.Mat,
    contour: OpenCVTypes.Mat,
    width: number,
    height: number
): Point[] => {
    const points: Point[] = [];

    if (!contour?.rows) {
        return points;
    }

    for (let row = 0; row < contour.rows; row++) {
        points.push({
            x: (contour.intAt(row, 0) / mask.cols) * width,
            y: (contour.intAt(row, 1) / mask.rows) * height,
        });
    }

    return points;
};

export const isPointOutsideOfBounds = (limit: OpenCVTypes.Rect, point: OpenCVTypes.Point | Point): boolean =>
    point.x <= limit.x || point.x >= limit.width || point.y <= limit.y || point.y >= limit.height;

export const optimizePolygonAndCV = (CV: OpenCVTypes.cv, points: Point[], isClose = true): Point[] => {
    const pointsMat = getMatFromPoints(CV, points);
    const newContour = approximateShape(CV, pointsMat, isClose);
    return getPointsFromMat(newContour);
};

//It approximates a contour shape to another shape with less number of vertices
export const approximateShape = (CV: OpenCVTypes.cv, contour: OpenCVTypes.Mat, isClose = true): OpenCVTypes.Mat => {
    const epsilon = 0.5;
    const newContour = new CV.Mat();
    CV.approxPolyDP(contour, newContour, epsilon, isClose);
    return newContour;
};

export const getMatFromPoints = (CV: OpenCVTypes.cv, points: Point[], offset = { x: 0, y: 0 }): OpenCVTypes.Mat => {
    const pointsMat = new CV.Mat(points.length, 1, CV.CV_32SC2);
    points.forEach(({ x, y }, idx) => {
        pointsMat.intPtr(idx, 0)[0] = x + offset.x;
        pointsMat.intPtr(idx, 0)[1] = y + offset.y;
    });
    return pointsMat;
};

export const getPointsFromMat = (mat: OpenCVTypes.Mat, offset = { x: 0, y: 0 }): Point[] => {
    const points: Point[] = [];
    for (let row = 0; row < mat.rows; row++) {
        points.push({
            x: Math.round(mat.intAt(row, 0) + offset.x),
            y: Math.round(mat.intAt(row, 1) + offset.y),
        });
    }
    return points;
};

/* CV mask debuggers helpers */
export const formatImageData = (CV: OpenCVTypes.cv, mat: OpenCVTypes.Mat): ImageData => {
    const img = new CV.Mat();
    const depth = mat.type() % 8;
    const scale = depth <= CV.CV_8S ? 1 : depth <= CV.CV_32S ? 1 / 256 : 255;
    const shift = depth === CV.CV_8S || depth === CV.CV_16S ? 128 : 0;

    mat.convertTo(img, CV.CV_8U, scale, shift);

    switch (img.type()) {
        case CV.CV_8UC1:
            CV.cvtColor(img, img, CV.COLOR_GRAY2RGBA);
            break;
        case CV.CV_8UC3:
            CV.cvtColor(img, img, CV.COLOR_RGB2RGBA);
            break;
        case CV.CV_8UC4:
            break;
        default:
            throw new Error('Bad number of channels (Source image must have 1, 3 or 4 channels)');
    }

    return new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);
};

export const logMat = (mat: OpenCVTypes.Mat, name: string): void => {
    // eslint-disable-next-line no-console
    console.log(
        `${name} width: ${mat.cols}
        ${name} height: ${mat.rows}
        ${name} size: ${mat.size().width * mat.size().height}
        ${name} depth: ${mat.depth()}
        ${name} channels: ${mat.channels()}
        ${name} type:${mat.type()}`
    );
};
