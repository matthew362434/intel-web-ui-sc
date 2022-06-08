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

import { fireEvent, render, screen } from '@testing-library/react';

import { MediaFilterValueDate } from './media-filter-value-date.component';

describe('MediaFilterValueDate', () => {
    const ariaLabel = 'media-filter-date';
    const onSelectionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('empty value is invalid', async () => {
        await render(<MediaFilterValueDate value={''} onSelectionChange={onSelectionChange} />);

        const input = screen.getByLabelText(ariaLabel);
        fireEvent.input(input, { target: { value: '' } });

        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('date without time is valid', async () => {
        await render(<MediaFilterValueDate value={''} onSelectionChange={onSelectionChange} />);

        const input = screen.getByLabelText(ariaLabel);
        fireEvent.input(input, { target: { value: '01/01/2022' } });

        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(onSelectionChange).toHaveBeenCalled();
    });

    it('full date with time', async () => {
        await render(<MediaFilterValueDate value={''} onSelectionChange={onSelectionChange} />);

        const input = screen.getByLabelText(ariaLabel);
        fireEvent.input(input, { target: { value: '01/01/2022 12:00' } });

        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(onSelectionChange).toHaveBeenCalled();
    });

    it('removes the time when is 00:00', async () => {
        await render(
            <MediaFilterValueDate
                value={new Date(2020, 0, 1, 0, 0, 0).toISOString()}
                onSelectionChange={onSelectionChange}
            />
        );

        const input = screen.getByLabelText(ariaLabel) as HTMLInputElement;

        expect(input.value).toBe('01/01/2020');
    });

    it('valid format but invalid date', async () => {
        await render(<MediaFilterValueDate value={''} onSelectionChange={onSelectionChange} />);

        const input = screen.getByLabelText(ariaLabel);
        fireEvent.input(input, { target: { value: '20/20/2022' } });

        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(onSelectionChange).not.toHaveBeenCalled();
    });
});
