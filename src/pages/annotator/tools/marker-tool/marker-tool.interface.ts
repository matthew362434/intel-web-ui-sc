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
import { CSSProperties } from 'react';

import { Point } from '../../../../core/annotations';
import { Label } from '../../../../core/labels';
import { StrokeLinecap, StrokeLinejoin } from '../../annotation/shapes/line.component';

export type Marker = {
    label: Label;
    points: Point[];
    brushSize: number;
    id: number;
};

export interface MarkerToolProps {
    image: HTMLImageElement;
    zoom: number;
    brushSize: number;
    label: Label;
    markerId: number;
    strokeLinecap?: StrokeLinecap;
    strokeLinejoin?: StrokeLinejoin;
    onComplete: (marker: Marker) => void;
    styles?: CSSProperties;
}
