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
import { v4 as uuidv4 } from 'uuid';

import { Annotation, labelFromUser, Shape } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { Label, LABEL_BEHAVIOUR } from '../../../../core/labels';
import { getLabeledShape } from '../../utils';
import { WatershedPolygon } from './watershed-tool.interface';

export const BACKGROUND_LABEL_MARKER_ID = 1;
const BACKGROUND_LABEL_ID = uuidv4();
export const CURSOR_OFFSET = '7 8';
export const MINUS_OFFSET = '2 8';

export const BACKGROUND_LABEL: Label = {
    id: BACKGROUND_LABEL_ID,
    name: 'Background',
    color: 'var(--spectrum-global-color-gray-500)',
    parentLabelId: '',
    group: '',
    behaviour: LABEL_BEHAVIOUR.LOCAL,
    hotkey: 'ctrl+b',
};

export const SensitivityConfig: { text: string; scaleValue: string }[] = [
    // ScaleValue = image dimension squared
    { text: '1', scaleValue: '484' }, // 22x22 = 484
    { text: '2', scaleValue: '1024' },
    { text: '3', scaleValue: '1764' },
    { text: '4', scaleValue: '2704' },
    { text: '5', scaleValue: '4900' },
];

export const getScaleValue = (sensitivity: number): string => {
    const config = SensitivityConfig.find(({ text }) => text === sensitivity.toString());
    const scaleValue = config?.scaleValue || SensitivityConfig[1].scaleValue;

    return scaleValue;
};

export const sensitivitySliderConfig = {
    defaultValue: 2,
    step: 1,
    min: 1,
    max: 5,
};

export const brushSizeSliderConfig = {
    defaultValue: 2,
    min: 1,
    max: 128,
    step: 1,
};

export const formatToPolygonShapesWithLabel = (watershedPolygons: WatershedPolygon[]): [Shape, Label][] => {
    return watershedPolygons.map((polygon) => [
        { shapeType: ShapeType.Polygon, points: polygon.points },
        polygon.label,
    ]);
};

export const formatAndAddAnnotations = (
    watershedPolygons: WatershedPolygon[],
    addAnnotations: (annotations: Annotation[]) => void
): Annotation[] => {
    const newAnnotations = formatToPolygonShapesWithLabel(watershedPolygons).map(([shape, label], index) => {
        return getLabeledShape(uuidv4(), shape, [labelFromUser(label)], false, index);
    });

    addAnnotations(newAnnotations);

    return newAnnotations;
};
