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

import userEvent from '@testing-library/user-event';

import { LABEL_BEHAVIOUR } from '../../../../../../core/labels';
import { DOMAIN } from '../../../../../../core/projects';
import { providersRender as render, screen } from '../../../../../../test-utils';
import { getMockedLabel, getMockedTask } from '../../../../../../test-utils/mocked-items-factory';
import { AnnotationSceneState, SearchRuleField, SearchRuleOperator } from '../../../../../media/media-filter.interface';
import { useDataset } from '../../../../providers/dataset-provider/dataset-provider.component';
import { AnomalyDatasetPicker } from './anomaly-dataset-picker.component';

jest.mock('../../../../providers/dataset-provider/dataset-provider.component', () => ({
    ...jest.requireActual('../../../../providers/dataset-provider/dataset-provider.component'),
    useDataset: jest.fn(),
}));

describe('AnomalyDatasetPicker', () => {
    const mockUseDataset = () => {
        const setMediaFilterOptions = jest.fn();
        const setIsDatasetMode = jest.fn();
        // @ts-expect-error We're only interested in mocking properties used by AnomalyDatasetPicker
        jest.mocked(useDataset).mockImplementation(() => ({ setMediaFilterOptions, setIsDatasetMode }));
        return { setMediaFilterOptions, setIsDatasetMode };
    };

    const labels = [
        getMockedLabel({
            id: 'normal-id',
            name: 'Normal',
            behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
        }),
        getMockedLabel({
            id: 'anomalous-id',
            name: 'Anomalous',
            behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.ANOMALOUS,
        }),
    ];

    it('allows to filter the data set', () => {
        const { setMediaFilterOptions, setIsDatasetMode } = mockUseDataset();
        const task = getMockedTask({ labels, domain: DOMAIN.ANOMALY_DETECTION });

        render(<AnomalyDatasetPicker selectedTask={task} />);

        const picker = screen.getByRole('listbox', { hidden: true });

        userEvent.selectOptions(picker, screen.getByRole('option', { hidden: true, name: 'Data set' }));
        expect(setMediaFilterOptions).toHaveBeenCalledWith({});
        expect(setIsDatasetMode).toHaveBeenLastCalledWith(true);

        userEvent.selectOptions(picker, screen.getByRole('option', { hidden: true, name: 'Normal' }));
        expect(setMediaFilterOptions).toHaveBeenCalledWith({
            condition: 'and',
            rules: [
                {
                    id: expect.any(String),
                    field: SearchRuleField.LabelId,
                    operator: SearchRuleOperator.In,
                    value: ['normal-id'],
                },
            ],
        });

        userEvent.selectOptions(picker, screen.getByRole('option', { hidden: true, name: 'Anomalous' }));
        expect(setMediaFilterOptions).toHaveBeenCalledWith({
            condition: 'and',
            rules: [
                {
                    id: expect.any(String),
                    field: SearchRuleField.LabelId,
                    operator: SearchRuleOperator.In,
                    value: ['anomalous-id'],
                },
            ],
        });

        userEvent.selectOptions(picker, screen.getByRole('option', { hidden: true, name: 'Missing anomalous boxes' }));
        expect(setMediaFilterOptions).toHaveBeenCalledWith({
            condition: 'and',
            rules: [
                {
                    id: expect.any(String),
                    field: SearchRuleField.LabelId,
                    operator: SearchRuleOperator.In,
                    value: ['anomalous-id'],
                },
                {
                    id: expect.any(String),
                    field: SearchRuleField.AnnotationSceneState,
                    operator: SearchRuleOperator.Equal,
                    value: AnnotationSceneState.PARTIALLY_ANNOTATED,
                },
            ],
        });
    });

    it('allows to filter the data set with partially anomalous regions', () => {
        mockUseDataset();
        const task = getMockedTask({ labels, domain: DOMAIN.ANOMALY_SEGMENTATION });

        render(<AnomalyDatasetPicker selectedTask={task} />);

        expect(screen.getByRole('option', { hidden: true, name: 'Missing anomalous region' })).toBeInTheDocument();
    });

    it('does not show the filter for partially anomalous annotations for classification tasks', () => {
        mockUseDataset();

        const task = getMockedTask({ labels, domain: DOMAIN.ANOMALY_CLASSIFICATION });

        render(<AnomalyDatasetPicker selectedTask={task} />);

        expect(screen.queryByRole('option', { hidden: true, name: /Missing anomalous/i })).not.toBeInTheDocument();
    });
});
