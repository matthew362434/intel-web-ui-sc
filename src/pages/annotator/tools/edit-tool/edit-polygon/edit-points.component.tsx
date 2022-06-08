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

import { useRef, useState, PointerEvent, useEffect } from 'react';

import { Text } from '@adobe/react-spectrum';
import isEmpty from 'lodash/isEmpty';

import { Point, Polygon } from '../../../../../core/annotations';
import { useEventListener } from '../../../../../hooks';
import { ContextMenu } from '../../../../../shared/components/context-menu';
import { KeyboardEvents, KeyMap } from '../../../../../shared/keyboard-events';
import { useAnnotationScene } from '../../../providers';
import { isLeftButton } from '../../buttons-utils';
import { getRelativePoint } from '../../utils';
import { ANCHOR_SIZE, ResizeAnchor } from '../resize-anchor.component';
import { projectPointOnLine, selectAnchorPointLabel } from './utils';

interface EditPointsProps {
    shape: Polygon;
    addPoint: (idx: number, x: number, y: number) => void;
    removePoints: (indexes: number[]) => void;
    roi: { width: number; height: number };
    zoom: number;
    onComplete: () => void;
    moveAnchorTo: (idx: number, x: number, y: number) => void;
}

export const EditPoints = ({
    shape,
    addPoint,
    removePoints,
    roi,
    zoom,
    onComplete,
    moveAnchorTo,
}: EditPointsProps): JSX.Element => {
    const ref = useRef<SVGRectElement>(null);
    const [ghostPoint, setGhostPoint] = useState<{ idx: number; point: Point }>();
    const removeGhostPoint = () => setGhostPoint(undefined);
    const { hasShapePointSelected } = useAnnotationScene();

    const [selectedAnchorIndexes, setSelectedAnchorIndexes] = useState<number[]>([]);

    useEventListener(KeyboardEvents.KeyDown, (event: KeyboardEvent) => {
        if (event.key === KeyMap.Delete) {
            event.preventDefault();
            removePoints(selectedAnchorIndexes);
            setSelectedAnchorIndexes([]);
        }
    });

    useEffect(() => {
        hasShapePointSelected.current = !isEmpty(selectedAnchorIndexes);
    }, [selectedAnchorIndexes, hasShapePointSelected]);

    const selectAnchorPoint = (idx: number, shiftKey: boolean) => {
        setSelectedAnchorIndexes((indexes) => {
            if (isEmpty(indexes) || !shiftKey) {
                return [idx];
            }

            // if shift key was pressed, toggle selection
            if (indexes.includes(idx)) {
                return indexes.filter((otherIdx) => otherIdx !== idx);
            }

            return [...indexes, idx];
        });
    };

    return (
        <>
            {/* Required to get correct relative mouse point */}
            <rect x={0} y={0} width={roi.width} height={roi.height} pointerEvents='none' fillOpacity={0} ref={ref} />

            {shape.points.map((point, idx) => {
                const nextPoint = idx + 1 >= shape.points.length ? shape.points[0] : shape.points[idx + 1];

                const onPointerMove = (event: PointerEvent) => {
                    if (ref.current === null) {
                        return;
                    }
                    const mouse = getRelativePoint(ref.current, { x: event.clientX, y: event.clientY }, zoom);

                    const pointOnLine = projectPointOnLine([point, nextPoint], mouse);

                    if (pointOnLine !== undefined) {
                        setGhostPoint({ idx: idx + 1, point: pointOnLine });
                    } else {
                        setGhostPoint(undefined);
                    }
                };

                const onPointerDown = (event: PointerEvent) => {
                    if (isLeftButton(event) && ghostPoint !== undefined) {
                        addPoint(ghostPoint.idx, ghostPoint.point.x, ghostPoint.point.y);
                    }
                };

                return (
                    <g onPointerLeave={removeGhostPoint} key={`${idx}`}>
                        <line
                            x1={point.x}
                            y1={point.y}
                            x2={nextPoint.x}
                            y2={nextPoint.y}
                            opacity={0}
                            stroke='black'
                            strokeWidth={`calc(${2 * ANCHOR_SIZE}px / var(--zoom-level))`}
                            onPointerMove={onPointerMove}
                            aria-label={`Line between point ${idx} and ${idx + 1}`}
                        />
                        {ghostPoint === undefined || ghostPoint.idx - 1 !== idx ? (
                            <></>
                        ) : (
                            <g onPointerDown={onPointerDown}>
                                <ResizeAnchor
                                    zoom={zoom}
                                    x={ghostPoint.point.x}
                                    y={ghostPoint.point.y}
                                    label={`Add a point between point ${idx} and ${idx + 1}`}
                                    onComplete={onComplete}
                                    moveAnchorTo={(x: number, y: number) => {
                                        setGhostPoint({ ...ghostPoint, point: { x, y } });
                                        moveAnchorTo(ghostPoint.idx, x, y);
                                    }}
                                    cursor='default'
                                    fill={'var(--energy-blue)'}
                                />
                            </g>
                        )}
                    </g>
                );
            })}
            {shape.points.map((point, idx) => {
                const isSelected = selectedAnchorIndexes.includes(idx);
                const label = selectAnchorPointLabel(idx, isSelected, selectedAnchorIndexes);

                return (
                    <g
                        key={idx}
                        onClick={(event) => {
                            selectAnchorPoint(idx, event.shiftKey);
                        }}
                        onContextMenu={() => selectAnchorPoint(idx, false)}
                        aria-selected={isSelected}
                        aria-label={label}
                    >
                        <ResizeAnchor
                            zoom={zoom}
                            x={point.x}
                            y={point.y}
                            label={`Resize polygon ${idx} anchor`}
                            onComplete={onComplete}
                            moveAnchorTo={(x: number, y: number) => moveAnchorTo(idx, x, y)}
                            fill={isSelected ? 'var(--energy-blue)' : undefined}
                        />
                    </g>
                );
            })}
            <ContextMenu
                roi={roi}
                isSvgParent
                matcher={(element: HTMLElement) =>
                    Boolean(element.getAttribute('aria-label')?.includes('Resize polygon'))
                }
            >
                <ContextMenu.Option label={'remove-point-button'} onPress={() => removePoints(selectedAnchorIndexes)}>
                    <Text>delete</Text>
                </ContextMenu.Option>
            </ContextMenu>
        </>
    );
};
