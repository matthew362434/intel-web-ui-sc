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

import { useEffect, useMemo } from 'react';

import { Item, Picker, Text } from '@adobe/react-spectrum';

import { SearchRuleField, SearchRuleOperator } from '../media-filter.interface';

interface MediaFilterOperatorProps {
    isDisabled?: boolean;
    field: SearchRuleField | '';
    value: SearchRuleOperator | '';
    isAnomalyProject: boolean;
    onSelectionChange: (key: SearchRuleOperator) => void;
}

const options: { key: SearchRuleOperator; text: string; fields: SearchRuleField[] }[] = [
    { key: SearchRuleOperator.In, text: 'In', fields: [SearchRuleField.LabelId] },
    { key: SearchRuleOperator.NotIn, text: 'Not In', fields: [SearchRuleField.LabelId] },
    {
        key: SearchRuleOperator.Equal,
        text: 'Equal',
        fields: [
            SearchRuleField.MediaWidth,
            SearchRuleField.MediaHeight,
            SearchRuleField.MediaName,
            SearchRuleField.AnnotationSceneState,
        ],
    },
    {
        key: SearchRuleOperator.NotEqual,
        text: 'Not Equal',
        fields: [
            SearchRuleField.MediaWidth,
            SearchRuleField.MediaHeight,
            SearchRuleField.MediaName,
            SearchRuleField.AnnotationSceneState,
        ],
    },
    {
        key: SearchRuleOperator.Less,
        text: 'Less',
        fields: [
            SearchRuleField.MediaWidth,
            SearchRuleField.MediaHeight,
            SearchRuleField.AnnotationCreationDate,
            SearchRuleField.MediaUploadDate,
        ],
    },
    {
        key: SearchRuleOperator.LessOrEqual,
        text: 'Less or equal',
        fields: [SearchRuleField.MediaWidth, SearchRuleField.MediaHeight],
    },
    {
        key: SearchRuleOperator.Greater,
        text: 'Greater',
        fields: [
            SearchRuleField.MediaWidth,
            SearchRuleField.MediaHeight,
            SearchRuleField.AnnotationCreationDate,
            SearchRuleField.MediaUploadDate,
        ],
    },
    {
        key: SearchRuleOperator.GreaterOrEqual,
        text: 'Greater or equal',
        fields: [SearchRuleField.MediaWidth, SearchRuleField.MediaHeight],
    },
];

const getAnomalyProjectOperator = (field: SearchRuleField | '') => {
    switch (field) {
        case SearchRuleField.LabelId:
            return SearchRuleOperator.In;
        case SearchRuleField.AnnotationSceneState:
            return SearchRuleOperator.Equal;
        default:
            return '';
    }
};

export const MediaFilterOperator = ({
    field,
    value,
    isDisabled,
    onSelectionChange,
    isAnomalyProject = false,
}: MediaFilterOperatorProps): JSX.Element => {
    const filteredItems = useMemo(() => {
        return field === '' ? [] : options.filter(({ fields }) => fields.includes(field));
    }, [field]);

    const isAnomalyAndFieldLabelOrAnnotation = useMemo(
        () =>
            field !== '' &&
            isAnomalyProject &&
            [SearchRuleField.LabelId, SearchRuleField.AnnotationSceneState].includes(field),
        [field, isAnomalyProject]
    );

    const selectedKey = isAnomalyAndFieldLabelOrAnnotation ? getAnomalyProjectOperator(field) : value;

    useEffect(() => {
        if (isAnomalyAndFieldLabelOrAnnotation) {
            onSelectionChange(selectedKey as SearchRuleOperator);
        }
    }, [isAnomalyAndFieldLabelOrAnnotation, onSelectionChange, selectedKey]);

    return (
        <Picker
            isQuiet
            items={filteredItems}
            selectedKey={selectedKey}
            aria-label='media-filter-operator'
            isDisabled={isDisabled || field === '' || isAnomalyAndFieldLabelOrAnnotation}
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
