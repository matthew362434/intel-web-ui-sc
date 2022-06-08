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

import { View } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

import { Annotation } from '../../../../../core/annotations';
import { AnnotationToolContext } from '../../../core';
import { AnnotationListItemContent } from './annotation-list-item-content.component';
import classes from './annotation-list-item.module.scss';

interface AnnotationListItemProps {
    annotation: Annotation;
    annotationToolContext: AnnotationToolContext;
}

export const AnnotationListItem = ({ annotation, annotationToolContext }: AnnotationListItemProps): JSX.Element => {
    const { id, zIndex, isSelected } = annotation;

    const { hoverAnnotation } = annotationToolContext.scene;

    const { hoverProps, isHovered } = useHover({
        onHoverStart: () => {
            hoverAnnotation(id);
        },
        onHoverEnd: () => {
            hoverAnnotation(null);
        },
    });

    return (
        <Draggable draggableId={id} index={-1 * zIndex}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot): JSX.Element => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    {...hoverProps}
                    id={`annotation-list-item-${id}`}
                    className={classes.annotationItem}
                >
                    <View
                        borderTopColor='gray-50'
                        borderTopWidth='thin'
                        padding='size-100'
                        backgroundColor={isHovered || snapshot.isDragging ? 'gray-300' : 'gray-200'}
                        UNSAFE_className={isSelected && !isHovered ? classes.selectedAnnotation : ''}
                    >
                        <AnnotationListItemContent
                            annotation={annotation}
                            isHovered={isHovered}
                            annotationToolContext={annotationToolContext}
                        />
                    </View>
                </div>
            )}
        </Draggable>
    );
};
