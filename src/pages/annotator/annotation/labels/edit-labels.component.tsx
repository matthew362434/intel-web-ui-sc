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

import { Annotation } from '../../../../core/annotations';
import { Label } from '../../../../core/labels';
import { LabelSearch } from '../../components/labels/label-search/label-search.component';
import { SelectionIndicator } from '../../components/labels/label-search/selection-indicator.component';
import { AnnotationToolContext } from '../../core';
import { getAvailableLabelsWithoutEmpty } from './utils';

interface EditLabelsProps {
    setEditLabels: (editLabels: boolean) => void;
    annotation: Annotation;
    annotationToolContext: AnnotationToolContext;
}

export const EditLabels = ({ annotation, annotationToolContext, setEditLabels }: EditLabelsProps): JSX.Element => {
    const { addLabel, removeLabels } = annotationToolContext.scene;

    const availableLabels = getAvailableLabelsWithoutEmpty(annotationToolContext, annotation);

    const onLabelSearchClick = (label: Label) => {
        const hasLabel = annotation.labels.some(({ id }) => id === label.id);

        if (hasLabel) {
            removeLabels([label], [annotation.id]);
        } else {
            addLabel(label, [annotation.id]);
        }

        setEditLabels(false);
    };

    return (
        <LabelSearch
            id={annotation.id}
            labels={availableLabels}
            onClick={onLabelSearchClick}
            onReset={() => setEditLabels(false)}
            textAriaLabel='Select label'
            shouldFocusTextInput={true}
            suffix={(label, state) => {
                const isSelected = annotation.labels.some(({ id: labelId }) => labelId === label.id);

                return <SelectionIndicator isHovered={state.isHovered} isSelected={isSelected} />;
            }}
        />
    );
};
