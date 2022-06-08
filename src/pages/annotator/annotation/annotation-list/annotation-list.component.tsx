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

import { Annotation } from '../../../../core/annotations';
import { AnnotationToolContext } from '../../core';
import { AnnotationListItem } from './annotation-list-item/annotation-list-item.component';

export interface AnnotationListProps {
    annotations: Annotation[];
    annotationToolContext: AnnotationToolContext;
}

export const AnnotationList = ({ annotations, annotationToolContext }: AnnotationListProps): JSX.Element => {
    return (
        <View height={'100%'}>
            {annotations.map((annotation: Annotation) => (
                <AnnotationListItem
                    key={annotation.id}
                    annotation={annotation}
                    annotationToolContext={annotationToolContext}
                />
            ))}
        </View>
    );
};
