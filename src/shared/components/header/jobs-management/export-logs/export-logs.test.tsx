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
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

import { providersRender as render } from '../../../../../test-utils';
import { ExportLogs } from './export-logs.component';

describe('Export logs', () => {
    const renderExportLogs = (): void => {
        render(<ExportLogs />);

        userEvent.click(screen.getByRole('button', { name: /Export/i }));
    };

    // mock get context because it throws console.errors
    HTMLCanvasElement.prototype.getContext = () => {
        return null;
    };

    it('Export button should be disabled when start date and end date are not selected', () => {
        renderExportLogs();

        expect(screen.getByRole('button', { name: /Export/i })).toBeDisabled();
    });

    it('Export button should be enabled when start date and end date are selected', () => {
        renderExportLogs();

        const dateRangePickerBox = screen.getByTestId('date-range-picker-box-id');
        const [, openButton] = within(dateRangePickerBox).getAllByRole('button');

        userEvent.click(openButton);

        const todayDateInCorrectFormat = dayjs().format('MMMM D, YYYY');
        const todayDateButton = screen.getByRole('button', { name: todayDateInCorrectFormat });

        userEvent.click(todayDateButton);
        userEvent.click(todayDateButton);

        expect(screen.getByRole('button', { name: /export/i })).toBeEnabled();
    });

    it('Export button should be disabled when dates are cleared', () => {
        renderExportLogs();

        const dateRangePickerBox = screen.getByTestId('date-range-picker-box-id');
        const [closeButton, openButton] = within(dateRangePickerBox).getAllByRole('button');

        userEvent.click(openButton);

        const todayDateInCorrectFormat = dayjs().format('MMMM D, YYYY');
        const todayDateButton = screen.getByRole('button', { name: todayDateInCorrectFormat });

        userEvent.click(todayDateButton);
        userEvent.click(todayDateButton);

        userEvent.click(closeButton);

        expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    });

    it('It should not be possible to select future date', () => {
        renderExportLogs();

        const dateRangePickerBox = screen.getByTestId('date-range-picker-box-id');
        const [, openButton] = within(dateRangePickerBox).getAllByRole('button');

        userEvent.click(openButton);

        const tomorrowDateInCorrectFormat = dayjs().add(1, 'd').format('MMMM D, YYYY');
        expect(screen.getByRole('button', { name: tomorrowDateInCorrectFormat })).toBeDisabled();
    });
});
