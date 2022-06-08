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
import { useEffect, useMemo } from 'react';

import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { filterOutExclusiveLabel, getImageData } from '../../../../shared/utils';
import { Polygon } from '../../annotation/shapes';
import { Line } from '../../annotation/shapes/line.component';
import { ToolSettings, ToolType } from '../../core';
import { useAddUnfinishedShape } from '../../hooks/use-add-unfinished-shape.hook';
import { MarkerTool } from '../marker-tool/marker-tool.component';
import { Marker } from '../marker-tool/marker-tool.interface';
import { ToolAnnotationContextProps } from '../tools.interface';
import { drawingStyles } from '../utils';
import {
    BACKGROUND_LABEL,
    BACKGROUND_LABEL_MARKER_ID,
    CURSOR_OFFSET,
    formatAndAddAnnotations,
    getScaleValue,
} from './utils';
import { useWatershedState } from './watershed-state-provider.component';
import { WatershedLabel, WatershedPolygon } from './watershed-tool.interface';

export const WatershedTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { zoomState, getToolSettings, image, scene } = annotationToolContext;

    const { shapes, onComplete, runWatershed, reset } = useWatershedState();

    const imageData = useMemo(() => getImageData(image), [image]);

    useAddUnfinishedShape({
        shapes: shapes.watershedPolygons,
        addShapes: (watershedPolygons) =>
            formatAndAddAnnotations(watershedPolygons as WatershedPolygon[], scene.addAnnotations),
        reset,
    });

    const {
        brushSize: selectedBrushSize,
        label: selectedLabel,
        sensitivity: selectedSensitivity,
    } = getToolSettings(ToolType.WatershedTool) as ToolSettings[ToolType.WatershedTool];

    const availableLabels: WatershedLabel[] = [
        { markerId: BACKGROUND_LABEL_MARKER_ID, label: BACKGROUND_LABEL },
        ...filterOutExclusiveLabel(scene.labels).map((label, idx) => ({
            markerId: idx + 2,
            label,
        })),
    ];

    const triggerWatershed = (markers: Marker[]) => {
        // Get scaleValue based on the selected sensitivity
        const scaleValue = getScaleValue(selectedSensitivity);

        // Get number of unique markers (ids) on the canvas
        const uniqueMarkerIds = new Set([...shapes.markers, ...markers].map(({ id }) => id));

        // After we finish drawing, if we have at least two different markers, we run the algorithm
        if (uniqueMarkerIds.size >= 2) {
            runWatershed({
                imageData,
                markers: [...shapes.markers, ...markers],
                sensitivity: Number(scaleValue),
            });
        }
    };

    const handleOnComplete = (marker: Marker) => {
        onComplete([marker]);

        triggerWatershed([marker]);
    };

    useEffect(() => {
        triggerWatershed([]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSensitivity]);

    useEffect(() => {
        // Reset markers, polygons and imageData on the watershed worker
        reset();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image]);

    return (
        <g>
            {shapes.watershedPolygons?.length ? (
                shapes.watershedPolygons.map(({ id, points }, idx) => {
                    const polygonMarker = availableLabels.find((label) => label.markerId === id) || availableLabels[1];

                    // If there is no polygon corresponding to the marker id or if it's the background label (id 1)
                    // we shouldn't draw anything
                    if (id === BACKGROUND_LABEL_MARKER_ID || !polygonMarker) {
                        return null;
                    }

                    return (
                        <Polygon
                            key={idx}
                            shape={{ shapeType: ShapeType.Polygon, points }}
                            styles={drawingStyles(polygonMarker.label)}
                        />
                    );
                })
            ) : (
                <></>
            )}

            {shapes.markers.length ? (
                shapes.markers.map(({ points, label, brushSize }, idx) => (
                    <Line key={idx} points={points} brushSize={brushSize} color={label?.color} />
                ))
            ) : (
                <></>
            )}

            {selectedLabel ? (
                <MarkerTool
                    styles={{ cursor: `url(/icons/cursor/circle.svg) ${CURSOR_OFFSET}, auto` }}
                    label={selectedLabel.label}
                    brushSize={selectedBrushSize}
                    image={image}
                    markerId={selectedLabel.markerId}
                    zoom={zoomState.zoom}
                    onComplete={handleOnComplete}
                />
            ) : null}
        </g>
    );
};
