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

import { useCallback, useEffect, useMemo } from 'react';

import isEqual from 'lodash/isEqual';

import { getShapesBoundingBox } from '../../../core/annotations';
import { AnnotationToolContext } from '../core';
import { useTask, useAnnotationScene } from '../providers';
import { useSelectedMediaItem } from '../providers/selected-media-item-provider/selected-media-item-provider.component';
import { getPreviousTask, getInputForTask } from '../providers/task-chain-provider/utils';
import { useZoom, ZoomTarget } from './zoom-provider.component';

export const useZoomIntoAnnotation = (): void => {
    const { setZoomTarget, zoomTarget } = useZoom();
    const { selectedMediaItem } = useSelectedMediaItem();
    const { tasks, selectedTask } = useTask();
    const { annotations } = useAnnotationScene();
    const previousTask = getPreviousTask({ tasks }, selectedTask);

    const taskAnnotations = getInputForTask(
        { tasks, scene: { annotations }, selectedTask } as AnnotationToolContext,
        selectedTask
    );

    const selectedAnnotations = useMemo(
        () => taskAnnotations.filter(({ isSelected }) => isSelected),
        [taskAnnotations]
    );

    const zoomIntoAnnotation = useCallback(() => {
        // Suppose we are in a Detection -> Classification or Detection -> Segmentation task, then
        // we want to zoom into selected annotations if the user selected the Classification,
        // or Segmentation tasks
        const shapes = selectedAnnotations.map(({ shape }) => shape);

        // If there are no previous annotations, there is nothing to zoom into
        if (!shapes.length) {
            return;
        }

        const boundingBox = getShapesBoundingBox(shapes);

        setZoomTarget((oldTarget) => {
            return isEqual(oldTarget, boundingBox) ? oldTarget : boundingBox;
        });
    }, [selectedAnnotations, setZoomTarget]);

    const resetZoom = useCallback(() => {
        if (!selectedMediaItem) {
            return;
        }

        const { x, y, width, height } = selectedMediaItem.image;

        // Initially the zoomTarget is the image target, so before we actually reset the state
        // We need to compare the image target (which is the initial target) with the current zoomTarget
        const imageTargetConfig = { x, y, width, height } as ZoomTarget;

        const targetChanged = !isEqual(imageTargetConfig, zoomTarget);

        if (targetChanged) {
            setZoomTarget(imageTargetConfig);
        }
    }, [zoomTarget, selectedMediaItem, setZoomTarget]);

    // If the user changes to from a global to a local task we zoom into the annotation
    // Otherwise we reset the zoomTarget
    useEffect(() => {
        const previousTaskWasLocalTask =
            previousTask !== undefined || (previousTask === undefined && tasks.length === 2);

        if (previousTaskWasLocalTask && selectedAnnotations.length) {
            zoomIntoAnnotation();
        } else {
            resetZoom();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previousTask, selectedAnnotations.length, tasks.length, zoomIntoAnnotation]);
};
