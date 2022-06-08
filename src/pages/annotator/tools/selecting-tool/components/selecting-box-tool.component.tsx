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

import { useCallback, useState } from 'react';

import { Annotation, Shape, isRect } from '../../../../../core/annotations';
import { useEventListener } from '../../../../../hooks';
import { KeyboardEvents, KeyMap } from '../../../../../shared/keyboard-events';
import { getOutputFromTask } from '../../../providers/task-chain-provider/utils';
import { DrawingBox } from '../../drawing-box';
import { ToolAnnotationContextProps } from '../../tools.interface';
import { SELECT_ANNOTATION_STYLES } from '../../utils';
import { areAnnotationsIdentical, shapesIntersection } from '../utils';

export const SelectingBoxTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { setSelectedAnnotations },
        zoomState: { zoom },
        image,
    } = annotationToolContext;
    const selectableAnnotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask);

    const [isShiftKeyDown, setIsShiftKeyDown] = useState<boolean>(false);

    const handleManyAnnotations = useCallback(
        (shapes: Shape[]): void => {
            const [shape] = shapes;
            if (isRect(shape)) {
                // NOTE: this returns a copy of the selectable annotations, where
                // their selection status has been updated
                const newAnnotations: Annotation[] = shapesIntersection(
                    selectableAnnotations as Annotation[],
                    shape,
                    isShiftKeyDown
                );

                const identicalAnnotations = areAnnotationsIdentical(
                    selectableAnnotations as Annotation[],
                    newAnnotations
                );

                if (!identicalAnnotations) {
                    setSelectedAnnotations((annotation) => {
                        const isSelected = newAnnotations.find(({ id }) => id === annotation.id);

                        if (isSelected) {
                            return isSelected.isSelected;
                        }

                        return annotation.isSelected;
                    });
                }
            }
        },
        [selectableAnnotations, isShiftKeyDown, setSelectedAnnotations]
    );

    useEventListener(KeyboardEvents.KeyDown, (event) => {
        if (event.shiftKey && !isShiftKeyDown) {
            setIsShiftKeyDown(event.shiftKey);
        }
    });

    useEventListener(KeyboardEvents.KeyUp, (event) => {
        if (event.key === KeyMap.Shift && isShiftKeyDown && !event.shiftKey) {
            setIsShiftKeyDown(event.shiftKey);
        }
    });

    return (
        <DrawingBox
            onComplete={handleManyAnnotations}
            image={image}
            zoom={zoom}
            styles={SELECT_ANNOTATION_STYLES}
            withCrosshair={false}
        />
    );
};
