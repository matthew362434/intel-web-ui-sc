// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { useMemo } from 'react';

import { Item, Picker, Text } from '@adobe/react-spectrum';

import { AnnotationSceneState, SearchRuleOperator, SearchRuleValue } from '../../media-filter.interface';

interface MediaFilterValueAnnotationSceneStateProps {
    value: string;
    isAnomalyProject: boolean;
    onSelectionChange: (key: SearchRuleValue) => void;
}

export const annotationSceneItems: { key: AnnotationSceneState; text: string }[] = [
    { key: AnnotationSceneState.NONE, text: 'None' },
    { key: AnnotationSceneState.ANNOTATED, text: 'Annotated' },
    { key: AnnotationSceneState.PARTIALLY_ANNOTATED, text: 'Partially annotated' },
    { key: AnnotationSceneState.REVISIT, text: 'Revisit' },
];

export const anomalyItems = [AnnotationSceneState.ANNOTATED, AnnotationSceneState.PARTIALLY_ANNOTATED];

export const MediaFilterValueAnnotationSceneState = ({
    value,
    isAnomalyProject,
    onSelectionChange,
}: MediaFilterValueAnnotationSceneStateProps): JSX.Element => {
    const options = useMemo(() => {
        return !isAnomalyProject
            ? annotationSceneItems
            : annotationSceneItems.filter(({ key }) => anomalyItems.includes(key));
    }, [isAnomalyProject]);

    return (
        <Picker
            isQuiet
            items={options}
            selectedKey={value}
            aria-label='media-filter-operator'
            onSelectionChange={(key) => onSelectionChange(key as SearchRuleOperator)}
        >
            {({ key, text }) => (
                <Item textValue={text} key={key}>
                    <Text>{text}</Text>
                </Item>
            )}
        </Picker>
    );
};
