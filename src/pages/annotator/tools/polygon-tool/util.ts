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

import { PointerEvent } from 'react';

import { Point } from '../../../../core/annotations';
import { isEraserOrRightButton, isLeftButton, MouseButton } from '../buttons-utils';
import { PointerType } from '../tools.interface';

type PointerSVGElement = PointerEvent<SVGSVGElement>;
type CallbackPointerVoid = (event: PointerSVGElement) => void;

export const ERASER_FIELD_DEFAULT_RADIUS = 5;
export const START_POINT_FIELD_DEFAULT_RADIUS = 5;

const mouseButtonEventValidation =
    (callback: CallbackPointerVoid) => (predicate: (button: MouseButton) => boolean) => (event: PointerSVGElement) => {
        event.preventDefault();
        if (event.pointerType === PointerType.Touch) return;

        const button = {
            button: event.button,
            buttons: event.buttons,
        };

        if (predicate(button)) {
            callback(event);
        }
    };

export const leftMouseButtonHandler = (callback: CallbackPointerVoid): CallbackPointerVoid =>
    mouseButtonEventValidation(callback)(isLeftButton);

export const rightMouseButtonHandler = (callback: CallbackPointerVoid): CallbackPointerVoid =>
    mouseButtonEventValidation(callback)(isEraserOrRightButton);

export const leftRightMouseButtonHandler =
    (leftCallback: CallbackPointerVoid, rightCallback: CallbackPointerVoid) =>
    (event: PointerSVGElement): void => {
        leftMouseButtonHandler(leftCallback)(event);
        rightMouseButtonHandler(rightCallback)(event);
    };

export const isEqualPoint = (point: Point, sPoint: Point): boolean =>
    (point.x | 0) === (sPoint.x | 0) && (point.y | 0) === (sPoint.y | 0);

export const removeEmptySegments =
    (...newSegments: Point[][]) =>
    (prevSegments: Point[][]): Point[][] => {
        const validSegments = newSegments.filter((segment) => segment.length);
        return validSegments.length ? [...prevSegments, ...validSegments] : [...prevSegments];
    };

export const deleteSegments =
    (intersectionPoint: Point) =>
    (segments: Point[][]): Point[][] => {
        return segments
            .map((segment: Point[]) =>
                segment.filter((point: Point) => point.x !== intersectionPoint.x && point.y !== intersectionPoint.y)
            )
            .filter((segment) => segment.length);
    };
