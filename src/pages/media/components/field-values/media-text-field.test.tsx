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

import { numberRegex, textRegex } from '../../util';
import { MediaTextField } from './media-text-field.component';

jest.mock('lodash/debounce', () => (callback: (t: string) => void) => (value: string) => callback(value));

const expectInvalid = (input: HTMLElement, invalidValue: string | number, handler: jest.Mock) => {
    fireEvent.input(input, { target: { value: invalidValue } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(handler).not.toHaveBeenCalled();
};

const expectValid = (input: HTMLElement, testValue: string | number, handler: jest.Mock) => {
    fireEvent.input(input, { target: { value: testValue } });
    expect(input.getAttribute('aria-invalid')).toBe(null);
    expect(handler).toHaveBeenNthCalledWith(1, testValue);
};

describe('MediaTextField', () => {
    const ariaLabel = 'input-text';
    const onSelectionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Render input text and uses textRegex for validation', async () => {
        const testValue = 'test';
        const invalidValue = 123456;

        await render(<MediaTextField regex={textRegex} aria-label={ariaLabel} onSelectionChange={onSelectionChange} />);

        const input = screen.getByLabelText(ariaLabel);
        expectInvalid(input, invalidValue, onSelectionChange);
        expectValid(input, testValue, onSelectionChange);
    });

    it('Render input number and uses numberRegex for validation', async () => {
        const testValue = 123456;
        const invalidValue = 'test';

        await render(
            <MediaTextField isNumber regex={numberRegex} aria-label={ariaLabel} onSelectionChange={onSelectionChange} />
        );

        const input = screen.getByLabelText(ariaLabel);
        expectInvalid(input, invalidValue, onSelectionChange);
        expectValid(input, testValue, onSelectionChange);
    });
});
