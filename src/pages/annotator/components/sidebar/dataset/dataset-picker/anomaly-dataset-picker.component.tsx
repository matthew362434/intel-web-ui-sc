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

import { useEffect, useMemo, useState } from 'react';

import { Item, Picker, Text } from '@adobe/react-spectrum';

import { isAnomalous, isExclusive, Label } from '../../../../../../core/labels';
import { isClassificationDomain, isDetectionDomain, Task } from '../../../../../../core/projects';
import { idMatchingFormat } from '../../../../../../test-utils';
import {
    AdvancedFilterOptions,
    AnnotationSceneState,
    SearchRuleField,
    SearchRuleOperator,
} from '../../../../../media/media-filter.interface';
import { addOrUpdateFilterRule } from '../../../../../media/util';
import { useDataset } from '../../../../providers/dataset-provider/dataset-provider.component';

enum FilterKey {
    DATASET = 'dataset',
    NORMAL = 'normal',
    ANOMALOUS = 'anomalous',
    PARTIALLY_ANOMALOUS = 'partially_anomalous',
}

const PARTIAL_ANOMALOUS_TEXT_DETECTION = 'Missing anomalous boxes';
const PARTIAL_ANOMALOUS_TEXT_SEGMENTATION = 'Missing anomalous region';

const filterByRuleOption = (labelId: string) =>
    addOrUpdateFilterRule({}, { field: SearchRuleField.LabelId, operator: SearchRuleOperator.In, value: [labelId] });

const getMediaFilterOptions = (filter: FilterKey, normalLabel: Label, anomalousLabel: Label): AdvancedFilterOptions => {
    switch (filter) {
        case FilterKey.DATASET:
            return {};
        case FilterKey.NORMAL:
            return filterByRuleOption(normalLabel.id);

        case FilterKey.ANOMALOUS:
            return filterByRuleOption(anomalousLabel.id);

        case FilterKey.PARTIALLY_ANOMALOUS:
            return addOrUpdateFilterRule(filterByRuleOption(anomalousLabel.id), {
                field: SearchRuleField.AnnotationSceneState,
                operator: SearchRuleOperator.Equal,
                value: AnnotationSceneState.PARTIALLY_ANNOTATED,
            });
    }
};

// This hook is assumed to always return an normal and anomalous label as the
// AnomalyDatasetPicker should only be rendered when a anomaly task is selected
const useAnomalyLabels = (selectedTask: Task): (Label | undefined)[] => {
    const [normalLabel, anomalousLabel] = useMemo(() => {
        const labels = selectedTask?.labels ?? [];

        return [labels.find(isExclusive), labels.find(isAnomalous)];
    }, [selectedTask]);

    return [normalLabel, anomalousLabel];
};

export const AnomalyDatasetPicker = ({ selectedTask }: { selectedTask: Task }): JSX.Element => {
    const { setMediaFilterOptions, setIsDatasetMode } = useDataset();
    const [filter, setFilter] = useState<FilterKey>(FilterKey.DATASET);
    const [normalLabel, anomalousLabel] = useAnomalyLabels(selectedTask);

    useEffect(() => {
        if (normalLabel === undefined || anomalousLabel === undefined) {
            return;
        }

        const options = getMediaFilterOptions(filter, normalLabel, anomalousLabel);
        setMediaFilterOptions(options);
    }, [filter, anomalousLabel, normalLabel, setMediaFilterOptions]);

    useEffect(() => {
        setIsDatasetMode(filter === FilterKey.DATASET);
    }, [filter, setIsDatasetMode]);

    const partialAnomalousText = isDetectionDomain(selectedTask.domain)
        ? PARTIAL_ANOMALOUS_TEXT_DETECTION
        : PARTIAL_ANOMALOUS_TEXT_SEGMENTATION;

    const items = [
        { key: FilterKey.DATASET, text: 'Data set' },
        { key: FilterKey.NORMAL, text: 'Normal' },
        { key: FilterKey.ANOMALOUS, text: 'Anomalous' },
    ];

    if (!isClassificationDomain(selectedTask.domain)) {
        items.push({ key: FilterKey.PARTIALLY_ANOMALOUS, text: partialAnomalousText });
    }

    return (
        <Picker
            id={'selected-dataset-filter-id'}
            aria-label='Choose a filter for the dataset'
            UNSAFE_style={{ fontWeight: 'bold' }}
            isQuiet
            items={items}
            selectedKey={filter}
            onSelectionChange={(selected) => {
                setFilter(selected as FilterKey);
            }}
        >
            {(item) => (
                <Item key={item.key} textValue={item.text}>
                    <Text id={`${idMatchingFormat(item.key)}-id`}>{item.text}</Text>
                </Item>
            )}
        </Picker>
    );
};
