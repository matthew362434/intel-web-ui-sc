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

import { useState } from 'react';

import { Label } from '../../../../core/labels';
import { getAvailableLabelsWithoutEmpty } from '../../annotation/labels/utils';
import { AnnotationToolContext } from '../../core';
import { HierarchicalLabelView } from '../labels/hierarchical-label-view/hierarchical-label-view.component';
import { LabelSearch } from '../labels/label-search/label-search.component';

interface DefaultLabelComboboxProps {
    annotationToolContext: AnnotationToolContext;
    setDefaultLabel: (label: Label | null) => void;
    defaultLabel?: Label | null;
}

export const DefaultLabelCombobox = ({
    annotationToolContext,
    setDefaultLabel,
    defaultLabel,
}: DefaultLabelComboboxProps): JSX.Element => {
    const [shouldFocusTextInput, setShouldFocusTextInput] = useState(false);

    const labels = getAvailableLabelsWithoutEmpty(annotationToolContext);

    if (!defaultLabel) {
        return (
            <LabelSearch
                textAriaLabel='Select default label'
                labels={labels}
                shouldFocusTextInput={shouldFocusTextInput}
                onClick={setDefaultLabel}
            />
        );
    }

    return (
        <div id='selected-default-label' aria-label='Selected default label'>
            <HierarchicalLabelView
                labels={labels}
                label={defaultLabel}
                resetHandler={() => {
                    setDefaultLabel(null);
                    setShouldFocusTextInput(true);
                }}
            />
        </div>
    );
};
