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

import { providersRender as render, screen } from '../../../../../../test-utils';
import { useDataset } from '../../../../providers/dataset-provider/dataset-provider.component';
import { DatasetPicker } from './dataset-picker.component';

jest.mock('../../../../providers/dataset-provider/dataset-provider.component', () => ({
    ...jest.requireActual('../../../../providers/dataset-provider/dataset-provider.component'),
    useDataset: jest.fn(),
}));

describe('DatasetPicker', () => {
    const mockUseDataset = (isInActiveMode = true) => {
        const setIsInActiveMode = jest.fn();
        const setIsDatasetMode = jest.fn();
        // @ts-expect-error We're only interested in mocking properties used by DatasetPicker
        jest.mocked(useDataset).mockImplementation(() => ({
            isInActiveMode,
            setIsInActiveMode,
            setIsDatasetMode,
        }));
        return { setIsInActiveMode, setIsDatasetMode };
    };

    it('allows to select the data set', () => {
        const { setIsInActiveMode, setIsDatasetMode } = mockUseDataset();

        render(<DatasetPicker />);

        userEvent.selectOptions(
            screen.getByRole('listbox', { hidden: true }),
            screen.getByRole('option', { hidden: true, name: 'Data set' })
        );

        expect(setIsInActiveMode).toHaveBeenCalledWith(false);
        expect(setIsDatasetMode).toHaveBeenCalledWith(true);
    });

    it('allows to select the active set', () => {
        const { setIsInActiveMode, setIsDatasetMode } = mockUseDataset(false);

        render(<DatasetPicker />);

        userEvent.selectOptions(
            screen.getByRole('listbox', { hidden: true }),
            screen.getByRole('option', { hidden: true, name: 'Active set' })
        );

        expect(setIsInActiveMode).toHaveBeenCalledWith(true);
        expect(setIsDatasetMode).toHaveBeenCalledWith(false);
    });
});
