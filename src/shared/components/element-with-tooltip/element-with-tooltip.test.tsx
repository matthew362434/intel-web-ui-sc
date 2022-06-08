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
import { screen } from '@testing-library/react';

import { applicationRender as render, onHoverTooltip } from '../../../test-utils';
import {
    DISCARD,
    DiscardButton,
} from '../header/jobs-management/jobs/job-item/discard-button/discard-button.component';
import { ElementWithTooltip } from './element-with-tooltip.component';

describe('Element with tooltip', () => {
    it('Check if tooltip is properly shown', async () => {
        const { getByRole, getByText } = await render(
            <ElementWithTooltip
                content={<DiscardButton discardType={DISCARD.CANCEL} jobId={'123'} jobMessage={'test'} />}
                tooltipProps={{
                    children: 'This is tooltip on custom element',
                }}
            />
        );

        const button = screen.getByRole('button', { name: 'Cancel' });

        expect(button).toBeInTheDocument();

        onHoverTooltip(button);

        const tooltip = getByRole('tooltip');
        expect(tooltip).toBeVisible();
        expect(getByText('This is tooltip on custom element')).toBeInTheDocument();
    });

    it('Check if tooltip has proper styling', async () => {
        const { getByRole } = await render(
            <ElementWithTooltip
                content={<DiscardButton discardType={DISCARD.CANCEL} jobId={'123'} jobMessage={'test'} />}
                tooltipProps={{ children: 'Nice tooltip' }}
            />
        );

        const button = screen.getByRole('button', { name: 'Cancel' });
        expect(button).toBeInTheDocument();

        onHoverTooltip(button);

        const tooltip = getByRole('tooltip');
        expect(tooltip).toHaveClass('tooltip');
    });
});
