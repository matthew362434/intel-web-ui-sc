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

// the source code ("Material") are owned by Intel Corporation or its suppliers
// or licensors. Title to the Material remains with Intel Corporation or its
// suppliers and licensors. The Material contains trade secrets and proprietary
// and confidential information of Intel or its suppliers and licensors. The
// Material is protected by worldwide copyright and trade secret laws and `treaty
// provisions. No part of the Material may be used, copied, reproduced, modified,
// published, uploaded, posted, transmitted, distributed, or disclosed in any way
// without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be express
// and approved by Intel in writing.

import { useMemo } from 'react';

import intersectionBy from 'lodash/intersectionBy';
import polylabel from 'polylabel';

import { Annotation, AnnotationLabel, Point, roiFromImage } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { isExclusive, Label } from '../../../../core/labels';
import { isAnomalyDomain, isClassificationDomain, isDetectionDomain, Task } from '../../../../core/projects';
import { AnnotationToolContext } from '../../core';
import { getGlobalAnnotations } from '../../providers/task-chain-provider/utils';
import classes from './labels.module.scss';

export const LABEL_CLASS: Record<ShapeType, string> = {
    [ShapeType.Rect]: classes.boundingBoxLabel,
    [ShapeType.RotatedRect]: classes.boundingBoxLabel,
    [ShapeType.Circle]: classes.circleLabel,
    [ShapeType.Polygon]: classes.polygonLabel,
};

export const useLabelPosition = (annotation: Annotation): Point => {
    return useMemo(() => {
        if (annotation.shape.shapeType === ShapeType.Polygon) {
            const [x, y] = polylabel([annotation.shape.points.map((point) => [point.x, point.y])]);
            return { x, y };
        }

        return {
            x: annotation.shape.x,
            y: annotation.shape.y,
        };
    }, [annotation]);
};

export const getAvailableLabels = (annotationToolContext: AnnotationToolContext): ReadonlyArray<Label> => {
    const { selectedTask, scene } = annotationToolContext;
    const { labels: projectLabels } = scene;

    return selectedTask === null ? projectLabels : selectedTask.labels;
};

// Get the available labels for the current selected task and the given shape type
export const getAvailableLabelsWithoutEmpty = (
    annotationToolContext: AnnotationToolContext,
    annotation?: Annotation
): ReadonlyArray<Label> => {
    const labels = getAvailableLabels(annotationToolContext);
    const shapeType = annotation?.shape.shapeType;

    const selectedTask = annotationToolContext.selectedTask;
    const roi = roiFromImage(annotationToolContext.image);

    const globalAnnotations = getGlobalAnnotations(annotationToolContext.scene.annotations, roi, selectedTask);
    const isGlobalAnnotation = globalAnnotations.some(({ id }) => annotation?.id === id);

    return labels.filter((label) => {
        if (shapeType === ShapeType.Circle || shapeType === ShapeType.Polygon) {
            const isDetectionLabel = annotationToolContext.tasks.some(
                (task) => isDetectionDomain(task.domain) && task.labels.some(({ id }) => label.id === id)
            );

            if (isDetectionLabel) {
                return false;
            }
        }

        if (selectedTask !== null && isGlobalAnnotation) {
            if (isClassificationDomain(selectedTask.domain) || isAnomalyDomain(selectedTask.domain)) {
                return true;
            }
        }

        return !isExclusive(label) || label.parentLabelId !== null;
    });
};

export const getLabelsFromTask = (annotation: Annotation, task: Task | null): ReadonlyArray<AnnotationLabel> => {
    if (!task) {
        return [];
    }

    return intersectionBy(annotation.labels, task.labels, 'id');
};
