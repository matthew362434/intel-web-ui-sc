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

import userEvent from '@testing-library/user-event';

import { applicationRender as render, screen } from '../../../../../test-utils';
import { CustomNumberField } from './custom-number-field.component';

describe('CustomNumberField', () => {
    let value = 1;
    const onChangeMock = jest.fn((result) => {
        value = result;
    });

    it('Set value in range', async () => {
        await render(
            <CustomNumberField
                defaultValue={0.01}
                value={0.001}
                onChange={jest.fn()}
                step={0.1}
                maxValue={1}
                minValue={0.0001}
                formatOptions={{}}
                aria-label={'test'}
            />
        );

        expect(screen.getByRole('textbox')).toHaveValue('0.001');
    });

    it('Set value higher than maximum', async () => {
        await render(
            <CustomNumberField
                defaultValue={1}
                value={5}
                onChange={jest.fn()}
                step={0.1}
                maxValue={10}
                minValue={0}
                formatOptions={{}}
                aria-label={'test'}
            />
        );

        const input = screen.getByRole('textbox');
        userEvent.clear(input);
        userEvent.type(input, '50');

        const button = screen.getAllByRole('button')[0];
        userEvent.click(button);

        expect(input).toHaveValue('10');
    });

    it('Set value lower than minimum', async () => {
        await render(
            <>
                <CustomNumberField
                    defaultValue={1}
                    value={7}
                    onChange={jest.fn()}
                    step={0.1}
                    maxValue={10}
                    minValue={5}
                    formatOptions={{}}
                    aria-label={'test'}
                />
                <button>Test</button>
            </>
        );

        const input = screen.getByRole('textbox');
        userEvent.clear(input);
        userEvent.type(input, '0');
        const button = screen.getByRole('button', { name: 'Test' });
        userEvent.click(button);

        expect(input).toHaveValue('5');
    });

    it('Set maximum value - up arrow should be disabled', async () => {
        await render(
            <CustomNumberField
                defaultValue={1}
                value={10}
                onChange={jest.fn()}
                step={0.1}
                maxValue={10}
                minValue={0}
                formatOptions={{}}
                aria-label={'test'}
            />
        );

        const buttons = screen.getAllByRole('button');

        expect(buttons[0]).toBeDisabled();
        expect(buttons[1]).toBeEnabled();
    });

    it('Set minimum value - down arrow should be disabled', async () => {
        await render(
            <CustomNumberField
                defaultValue={1}
                value={0}
                onChange={jest.fn()}
                step={0.1}
                maxValue={10}
                minValue={0}
                formatOptions={{}}
                aria-label={'test'}
            />
        );

        const buttons = screen.getAllByRole('button');
        const up = buttons[0];
        const down = buttons[1];
        expect(down).toBeDisabled();
        expect(up).toBeEnabled();
    });

    it('Set value 1.23K and click down and up arrow', async () => {
        value = 1230;

        await render(
            <CustomNumberField
                defaultValue={1}
                value={value}
                onChange={onChangeMock}
                step={20}
                maxValue={2000}
                minValue={0}
                formatOptions={{ notation: 'compact', compactDisplay: 'short', minimumFractionDigits: 2 }}
                aria-label={'test'}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('1.23K');
        const buttons = screen.getAllByRole('button');

        userEvent.click(buttons[0]);
        expect(input).toHaveValue('1.25K');
        userEvent.click(buttons[1]);
        expect(input).toHaveValue('1.23K');
    });

    it('Set value 1T and click down and up arrow', async () => {
        value = 1000000000000;

        await render(
            <CustomNumberField
                defaultValue={1}
                value={value}
                onChange={onChangeMock}
                step={500000000000}
                maxValue={2000000000000}
                minValue={0}
                formatOptions={{ notation: 'compact', compactDisplay: 'short', minimumFractionDigits: 0 }}
                aria-label={'test'}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('1T');
        const buttonUp = screen.getByRole('button', { name: 'Up' });
        const buttonDown = screen.getByRole('button', { name: 'Down' });

        userEvent.click(buttonUp);
        expect(input).toHaveValue('1.5T');
        userEvent.click(buttonDown);
        expect(input).toHaveValue('1T');
    });

    it('Set value in range and check up and down arrow', async () => {
        value = 23;

        await render(
            <CustomNumberField
                defaultValue={1}
                value={value}
                onChange={onChangeMock}
                step={1}
                maxValue={50}
                minValue={0}
                formatOptions={{ notation: 'compact', compactDisplay: 'short', minimumFractionDigits: 0 }}
                aria-label={'test'}
            />
        );

        const input = screen.getByRole('textbox');
        const buttonUp = screen.getByRole('button', { name: 'Up' });
        const buttonDown = screen.getByRole('button', { name: 'Down' });

        userEvent.click(buttonUp);
        expect(input).toHaveValue('24');
        userEvent.click(buttonDown);
        expect(input).toHaveValue('23');
    });

    it('Type not proper value - e765 - should stay previous value', async () => {
        value = 23;

        await render(
            <>
                <CustomNumberField
                    defaultValue={1}
                    value={value}
                    onChange={onChangeMock}
                    step={20}
                    maxValue={2000}
                    minValue={0}
                    formatOptions={{ notation: 'compact', compactDisplay: 'short' }}
                    aria-label={'test'}
                />
                <button>Test</button>
            </>
        );

        const input = screen.getByRole('textbox');
        userEvent.clear(input);
        userEvent.type(input, 'abcd*(');
        const button = screen.getByRole('button', { name: 'Test' });
        userEvent.click(button);

        expect(input).toHaveValue('23');
    });

    it('Set 0.00000001 and check if it is properly displayed', async () => {
        value = 0.0000001;

        await render(
            <>
                <CustomNumberField
                    defaultValue={1}
                    value={value}
                    onChange={onChangeMock}
                    step={0.001}
                    maxValue={0.1}
                    minValue={0.0000001}
                    formatOptions={{ notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 7 }}
                    aria-label={'test'}
                />
                <button>Test</button>
            </>
        );

        const input = screen.getByRole('textbox');

        expect(input).toHaveValue('0.0000001');
    });
});
