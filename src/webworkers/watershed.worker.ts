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

// Dependencies get bundled into the worker
import { expose } from 'comlink';
import type OpenCVTypes from 'OpenCVTypes';

import { Point } from '../core/annotations';
import { Marker } from '../pages/annotator/tools/marker-tool/marker-tool.interface';
import { WatershedPolygon } from '../pages/annotator/tools/watershed-tool/watershed-tool.interface';
import { approximateShape, formatContourToPoints } from './utils';

let CV: OpenCVTypes.cv | null = null;
declare const self: DedicatedWorkerGlobalScope;

// Request from within web-worker must be done with self.importScripts,
// it will let the service-worker to take over, save and serve it later from cache
self.importScripts(new URL('../../public/assets/opencv/4.5.5/opencv.js', import.meta.url).toString());
cv.then((cvInstance: OpenCVTypes.cv) => {
    CV = cvInstance;
});

export const terminate = (): void => {
    self.close();
};

class Watershed {
    imageData: OpenCVTypes.Mat;
    mask: OpenCVTypes.Mat;
    originalHeight: number;
    originalWidth: number;
    originalImage: OpenCVTypes.Mat;

    constructor(imageData: ImageData) {
        this.originalImage = CV.matFromImageData(imageData);

        // Convert image colors
        CV.cvtColor(this.originalImage, this.originalImage, CV.COLOR_RGBA2RGB, 0);

        this.imageData = this.originalImage.clone();

        this.originalHeight = this.originalImage.rows;
        this.originalWidth = this.originalImage.cols;

        // Create a mask
        this.mask = new CV.Mat();
    }

    drawMarkers(markers: Marker[]): void {
        this.mask?.delete();

        this.mask = new CV.Mat(this.imageData.rows, this.imageData.cols, CV.CV_32S, new CV.Scalar(0));

        markers.forEach((marker) => {
            const line = new CV.Mat(marker.points.length, 1, CV.CV_32SC2);

            // Convert all lines into a matrix
            // [A x x x x x]     A = marker[markerIndex].points[0].x
            // [B y y y y y]     B = marker[markerIndex].points[0].y
            marker.points.forEach(({ x, y }, idx) => {
                line.intPtr(idx, 0)[0] = (x / this.originalWidth) * this.mask.cols;
                line.intPtr(idx, 0)[1] = (y / this.originalHeight) * this.mask.rows;
            });

            const markersVector = new CV.MatVector();

            markersVector.push_back(line);

            CV.polylines(this.mask, markersVector, false, new CV.Scalar(marker.id), 4);

            line.delete();
            markersVector.delete();
        });
    }

    getPolygons(markers: Marker[]): WatershedPolygon[] {
        const polygons: WatershedPolygon[] = [];

        for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
            let shapeMat: OpenCVTypes.Mat | null = null;
            const contours: OpenCVTypes.MatVector = new CV.MatVector();
            const hierachy: OpenCVTypes.Mat = new CV.Mat();

            try {
                const markerPolygon = polygons.find((polygon) => polygon.id === markers[markerIndex].id);

                // Discard the background marker and duplicate polygons
                if (markerPolygon || markers[markerIndex].id === 1) {
                    continue;
                }

                shapeMat = this.mask.clone();

                shapeMat.convertTo(shapeMat, CV.CV_8U);

                CV.threshold(shapeMat, shapeMat, markers[markerIndex].id - 1, 0, CV.THRESH_TOZERO);
                CV.threshold(shapeMat, shapeMat, markers[markerIndex].id, 0, CV.THRESH_TOZERO_INV);

                CV.findContours(shapeMat, contours, hierachy, CV.RETR_CCOMP, CV.CHAIN_APPROX_NONE);

                for (let idx = 0; idx < contours.size(); idx++) {
                    const optimazedContours = approximateShape(CV, contours.get(idx));
                    const points: Point[] = formatContourToPoints(
                        this.mask,
                        optimazedContours,
                        this.originalWidth,
                        this.originalHeight
                    );
                    optimazedContours?.delete();
                    polygons.push({ id: markers[markerIndex].id, label: markers[markerIndex].label, points });
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('Something went wrong while trying to execute getPolygons.\n Error: ', error);
            } finally {
                // Cleanup
                shapeMat?.delete();
                contours?.delete();
                hierachy?.delete();
            }
        }

        return polygons;
    }

    scaleImage(sensitivity: number): void {
        const scale = Math.max(this.originalImage.cols, this.originalImage.rows) / sensitivity;
        const size = new CV.Size(this.originalImage.cols / scale, this.originalImage.rows / scale);
        const hasSameSize = size.width === this.imageData.cols && size.height === this.imageData.rows;

        if (scale > 1 && !hasSameSize) {
            // Delete previous imageData
            this.imageData?.delete();

            // Create a new placeholder matrix
            this.imageData = new CV.Mat();

            CV.resize(this.originalImage, this.imageData, size, 0, 0, CV.INTER_AREA);
        }
    }

    clearMemory(): void {
        try {
            this.imageData?.delete();
            this.originalImage?.delete();
            this.mask?.delete();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Unable to clear memory.\n Error: ', error);
        }
    }

    executeWatershed(markers: Marker[], sensitivity: number): WatershedPolygon[] {
        let polygons: WatershedPolygon[] = [];

        try {
            // Create a new scaled image based on the sensitivity input
            this.scaleImage(sensitivity);

            // Draw markers
            this.drawMarkers(markers);

            // Run watershed
            CV.watershed(this.imageData, this.mask);

            // Get the resulting polygons
            polygons = this.getPolygons(markers);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Something went wrong while trying to execute Watershed.\n Error: ', error);
        }

        return polygons;
    }
}

export const WorkerApi = { Watershed, terminate };

expose(WorkerApi);
