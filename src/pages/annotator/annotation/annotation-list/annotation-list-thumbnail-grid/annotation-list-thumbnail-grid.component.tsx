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

import { useMemo } from 'react';

import { Grid, repeat, View } from '@adobe/react-spectrum';
import sortBy from 'lodash/sortBy';

import { Annotation } from '../../../../../core/annotations';
import { AnnotationToolContext } from '../../../core';
import { AnnotationListItemThumbnail } from '../annotation-list-item/annotation-list-item-thumbnail.component';
import classes from './annotation-list-thumbnail-grid.module.scss';
import { EmptyAnnotationsGrid } from './empty-annotations-grid.component';

interface AnnotationListThumbnailGridProps {
    annotations: ReadonlyArray<Annotation>;
    annotationToolContext: AnnotationToolContext;
    onSelectAnnotation: (annotationId: string) => (isSelected: boolean) => void;
}

export const AnnotationListThumbnailGrid = ({
    annotationToolContext,
    annotations,
    onSelectAnnotation,
}: AnnotationListThumbnailGridProps): JSX.Element => {
    const thumbnails = useMemo(
        () =>
            // Sort annotations by descending zIndex so that next and previous buttons behave consistently
            sortBy(annotations, ({ zIndex }) => -zIndex).map((annotation) => {
                return (
                    <AnnotationListItemThumbnail
                        key={`annotation-grid-item-${annotation.id}`}
                        annotationId={annotation.id}
                        annotationShape={annotation.shape}
                        image={annotationToolContext.image}
                        isSelected={annotation.isSelected}
                        onSelectAnnotation={onSelectAnnotation(annotation.id)}
                    />
                );
            }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [annotations]
    );

    return (
        <View UNSAFE_className={classes.gridWrapper} data-testid='annotation-list-thumbnail-grid'>
            {annotations.length > 0 ? (
                <Grid columns={repeat(4, '1fr')} gap='size-50'>
                    {thumbnails}
                </Grid>
            ) : (
                <EmptyAnnotationsGrid annotationToolContext={annotationToolContext} />
            )}
        </View>
    );
};
