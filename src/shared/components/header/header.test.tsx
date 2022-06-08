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

import { act, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ApplicationProvider } from '../../../providers';
import { getById, providersRender as render } from '../../../test-utils';
import { Header } from './';

describe('landing page header', () => {
    it('Check application title', async () => {
        render(<Header />);

        expect(screen.getByText('Sonoma Creek')).toBeInTheDocument();
    });

    it("Check header's color mode - grayscale", () => {
        render(<Header grayscale />);

        const header = screen.getByTestId('application-header');

        expect(header).toHaveClass('gray200color');
        expect(header).not.toHaveClass('energyBlueShade1Color');
    });

    it("Check header's color mode - blue color", () => {
        render(<Header />);

        const header = screen.getByTestId('application-header');

        expect(header).not.toHaveClass('gray200color');
        expect(header).toHaveClass('energyBlueShade1Color');
    });
});

describe('Jobs management', () => {
    it('Check if popover is properly open', async () => {
        const { container } = render(
            <ApplicationProvider>
                <Header />
            </ApplicationProvider>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
        await act(async () => {
            const button = getById(container, 'tasks-in-progress');
            expect(button).toBeInTheDocument();
            button && fireEvent.click(button);
        });

        expect(screen.getAllByRole('tab')).toHaveLength(4);
    });

    it('Check if jobs management icon is properly displayed', async () => {
        const { container } = render(
            <ApplicationProvider>
                <Header />
            </ApplicationProvider>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        const button = getById(container, 'tasks-in-progress');

        expect(button?.lastChild?.firstChild).toHaveClass('reversedColor', { exact: false });
    });

    it('Check if jobs management icon is properly displayed - grayscale', async () => {
        const { container } = render(
            <ApplicationProvider>
                <Header grayscale />
            </ApplicationProvider>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        const button = getById(container, 'tasks-in-progress');

        expect(button?.lastChild?.firstChild).not.toHaveClass('reversedColor', { exact: false });
    });
});
