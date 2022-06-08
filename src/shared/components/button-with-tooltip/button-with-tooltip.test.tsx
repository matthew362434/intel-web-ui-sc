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
import { ActionButton } from '@adobe/react-spectrum';
import { fireEvent, screen } from '@testing-library/react';

import { applicationRender as render } from '../../../test-utils';
import { ButtonWithTooltip } from './button-with-tooltip.component';

describe('Button with tooltip', () => {
    it('Tooltip with action Button', async () => {
        const { getByRole, getByText } = await render(
            <ButtonWithTooltip
                buttonInfo={{ type: 'action_button', button: ActionButton }}
                content={'Click me'}
                tooltipProps={{
                    children: 'This is tooltip',
                }}
                variant={'primary'}
            />
        );
        fireEvent.mouseDown(document.body);
        fireEvent.mouseUp(document.body);

        const button = screen.getByRole('button', { name: 'Click me' });
        expect(button).toBeInTheDocument();

        fireEvent.mouseEnter(button);

        const tooltip = getByRole('tooltip');
        expect(tooltip).toBeVisible();
        expect(getByText('This is tooltip')).toBeInTheDocument();
        expect(button.getAttribute('class')?.includes('is-hovered_')).toBeTruthy();
    });

    it('Check if tooltip button has proper classes', async () => {
        await render(
            <ButtonWithTooltip
                buttonInfo={{ type: 'action_button', button: ActionButton }}
                variant={'primary'}
                content={'Click'}
                tooltipProps={{
                    children: 'Tooltip',
                }}
                buttonClasses={'test-class another-test-class'}
            />
        );

        const button = screen.getByRole('button', { name: 'Click' });
        expect(button).toHaveClass('test-class');
        expect(button).toHaveClass('another-test-class');
    });
});
