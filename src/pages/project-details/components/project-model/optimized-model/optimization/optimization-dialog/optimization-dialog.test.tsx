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
import { act, fireEvent, screen } from '@testing-library/react';

import { applicationRender as render, onHoverTooltip } from '../../../../../../../test-utils';
import { DISABLED_FILTER_PRUNING_TOOLTIP, FILTER_PRUNING_IS_NOT_SUPPORTED } from '../../utils';
import { OptimizationDialog } from './optimization-dialog.component';

describe('Optimization dialog', () => {
    const renderOptimizationDialog = async (
        isFilterPruningDisabled = false,
        isFilterPruningSupported = true,
        isPOTVisible = true
    ): Promise<void> => {
        await render(
            <OptimizationDialog
                isOpen={true}
                setIsOpen={jest.fn()}
                isFilterPruningDisabled={isFilterPruningDisabled}
                isFilterPruningSupported={isFilterPruningSupported}
                isPOTVisible={isPOTVisible}
            />
        );
    };

    it('should appear dialog with two optimization types', async () => {
        await renderOptimizationDialog();

        expect(screen.getByText('Optimization')).toBeInTheDocument();

        const radioButtons = screen.getAllByRole('radio');
        expect(radioButtons).toHaveLength(2);

        const [nncfRadio, potRadio] = radioButtons;

        expect(nncfRadio).toBeInTheDocument();
        expect(potRadio).toBeInTheDocument();
    });

    it('should nncf be selected by default', async () => {
        await renderOptimizationDialog();

        const radioButtons = screen.getAllByRole('radio');

        const [nncfRadio, potRadio] = radioButtons;

        expect(nncfRadio).toBeChecked();
        expect(potRadio).not.toBeChecked();

        fireEvent.change(potRadio, {
            target: {
                checked: true,
            },
        });

        expect(nncfRadio).not.toBeChecked();
        expect(potRadio).toBeChecked();
    });

    it('should enable filter pruning be enabled', async () => {
        await renderOptimizationDialog(false, true);

        expect(screen.getByRole('checkbox')).toBeEnabled();
        expect(screen.queryByTestId('filter-pruning-warning-id')).not.toBeInTheDocument();
    });

    it('should enable filter pruning be disabled when isFilterPruning flag is true', async () => {
        await renderOptimizationDialog(true, true);

        expect(screen.getByRole('checkbox')).toBeDisabled();
        expect(screen.getByTestId('filter-pruning-warning-id')).toBeInTheDocument();
    });

    it('should enable filter pruning be disabled when isFilterPruningSupported flag is false', async () => {
        await renderOptimizationDialog(true, false);

        expect(screen.getByRole('checkbox')).toBeDisabled();
        expect(screen.getByTestId('filter-pruning-warning-id')).toBeInTheDocument();
    });

    it('should show tooltip that model does not support filter pruning when isFilterPruningSupported flag is false', async () => {
        jest.useFakeTimers();

        await renderOptimizationDialog(true, false);

        onHoverTooltip(screen.getByRole('checkbox'));

        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(screen.getByText(FILTER_PRUNING_IS_NOT_SUPPORTED)).toBeInTheDocument();

        jest.useRealTimers();
    });

    it('should show that there is not enough media items when isFilterPruning flag is true', async () => {
        jest.useFakeTimers();

        await renderOptimizationDialog(true, true);

        onHoverTooltip(screen.getByRole('checkbox'));

        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(screen.getByText(DISABLED_FILTER_PRUNING_TOOLTIP)).toBeInTheDocument();
        jest.useRealTimers();
    });

    it('should appear dialog with one NNCF optimization type', async () => {
        await renderOptimizationDialog(false, true, false);

        expect(screen.getByText('Training-time optimization')).toBeInTheDocument();
        expect(screen.queryByText('Post-training optimization')).not.toBeInTheDocument();
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });
});
