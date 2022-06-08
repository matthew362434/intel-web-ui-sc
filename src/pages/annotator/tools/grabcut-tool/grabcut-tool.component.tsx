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

import { MutableRefObject, useEffect } from 'react';

import { Point, Polygon, Shape } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { Rectangle } from '../../annotation';
import { Line } from '../../annotation/shapes/line.component';
import { useAddUnfinishedShape } from '../../hooks/use-add-unfinished-shape.hook';
import { DrawingBox } from '../drawing-box';
import { MarkerTool } from '../marker-tool/marker-tool.component';
import { Marker } from '../marker-tool/marker-tool.interface';
import { PolygonDraw } from '../polygon-draw.component';
import { ToolAnnotationContextProps } from '../tools.interface';
import { drawingStyles, SELECT_ANNOTATION_STYLES } from '../utils';
import { useGrabcutState } from './grabcut-state-provider.component';
import { GrabcutToolIconsOffset, GrabcutToolType } from './grabcut-tool.enums';
import classes from './grabcut-tool.module.scss';
import { calcStrokeWidth, getLabel, isBackgroundTool, isForegroundTool } from './util';

type OrderMarkers = [{ marker: Point[][]; color: string }, { marker: Point[][]; color: string }];

const ShowMarkers = ({ markers, strokeWidth }: { markers: OrderMarkers; strokeWidth: number }): JSX.Element => (
    <>
        {markers?.map(({ marker, color }) =>
            marker?.map((points, idx) => (
                <Line key={`line-${idx}`} points={points} brushSize={strokeWidth} color={color} />
            ))
        )}
    </>
);

export const GrabcutTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { scene, image, zoomState, defaultLabel } = annotationToolContext;
    const {
        toolsState,
        inputRect,
        activeTool,
        resetConfig,
        runGrabcut,
        isLoading,
        foregroundMarkers,
        backgroundMarkers,
    } = useGrabcutState();

    useAddUnfinishedShape({
        shapes: toolsState?.polygon ? [toolsState.polygon] : [],
        addShapes: (polygonShape) => scene.addShapes(polygonShape as Shape[]),
        reset: resetConfig,
    });

    useEffect(() => {
        resetConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image]);

    const strokeWidth = calcStrokeWidth(inputRect.current?.width ?? 0);

    const onRectComplete = (shapes: Shape[]) => {
        const [shape] = shapes;

        resetConfig();
        acceptPrevShape(toolsState.polygon);

        if (shape.shapeType === ShapeType.Rect) {
            inputRect.current = shape;

            runGrabcut(image, strokeWidth, toolsState.sensitivity);
        }
    };

    const onStrokeComplete = (marker: MutableRefObject<Point[][]>) => (newMarker: Marker) => {
        marker.current.push(newMarker.points);
        runGrabcut(image, strokeWidth, toolsState.sensitivity);
    };

    const acceptPrevShape = (prevPolygon: Polygon | null): void => {
        if (prevPolygon) {
            scene.addShapes([prevPolygon], undefined, false);
        }
    };

    // markers must be applied in a specific order depending on the currently active tool,
    // if the activetool is ForegroundTool- first apply backgroundMarkers and then apply foregroundMarkers
    const foregroundMarkerAndColor = {
        marker: toolsState.foreground,
        color: ' var(--brand-moss)',
    };
    const backgroundMarkerAndColor = {
        marker: toolsState.background,
        color: 'var(--brand-coral-cobalt)',
    };
    const markersByToolType: { [Key: string]: OrderMarkers } = {
        [GrabcutToolType.ForegroundTool]: [backgroundMarkerAndColor, foregroundMarkerAndColor],
        [GrabcutToolType.BackgroundTool]: [foregroundMarkerAndColor, backgroundMarkerAndColor],
    };

    return (
        <>
            {toolsState.polygon?.points.length && (
                <PolygonDraw
                    indicatorRadius={0}
                    shape={toolsState.polygon}
                    className={isLoading ? classes.inputTool : ''}
                    styles={drawingStyles(defaultLabel)}
                />
            )}
            {activeTool === GrabcutToolType.InputTool && (
                <>
                    {!isLoading && (
                        <DrawingBox
                            image={image}
                            withCrosshair={true}
                            zoom={zoomState.zoom}
                            onComplete={onRectComplete}
                            styles={SELECT_ANNOTATION_STYLES}
                        />
                    )}
                    {inputRect?.current && isLoading && (
                        <Rectangle
                            shape={inputRect.current}
                            styles={SELECT_ANNOTATION_STYLES}
                            className={classes.inputTool}
                        />
                    )}
                </>
            )}

            {(isForegroundTool(activeTool) || isBackgroundTool(activeTool)) && (
                <ShowMarkers markers={markersByToolType[activeTool]} strokeWidth={strokeWidth}></ShowMarkers>
            )}

            {isForegroundTool(activeTool) && (
                <MarkerTool
                    markerId={0}
                    image={image}
                    zoom={zoomState.zoom}
                    brushSize={strokeWidth}
                    label={getLabel('foreground', 'var(--brand-moss)')}
                    onComplete={onStrokeComplete(foregroundMarkers)}
                    styles={{ cursor: `url(/icons/cursor/pencil-plus.svg) ${GrabcutToolIconsOffset.Foreground}, auto` }}
                />
            )}
            {isBackgroundTool(activeTool) && (
                <MarkerTool
                    markerId={1}
                    image={image}
                    zoom={zoomState.zoom}
                    brushSize={strokeWidth}
                    label={getLabel('background', 'var(--brand-coral-cobalt')}
                    onComplete={onStrokeComplete(backgroundMarkers)}
                    styles={{
                        cursor: `url(/icons/cursor/pencil-minus.svg) ${GrabcutToolIconsOffset.Background}, auto`,
                    }}
                />
            )}
        </>
    );
};
