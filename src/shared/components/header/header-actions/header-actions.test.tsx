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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { usePWA } from '../../../../hooks/use-pwa/use-pwa.hook';
import { getById, providersRender as render } from '../../../../test-utils';
import { openNewTab } from '../../../utils';
import { HeaderActions } from './header-actions.component';

jest.mock('../../../utils', () => ({
    ...jest.requireActual('../../../utils'),
    openNewTab: jest.fn(),
}));

jest.mock('../../../../hooks/use-pwa/use-pwa.hook', () => ({
    usePWA: jest.fn(() => ({
        isPWAReady: false,
    })),
}));

describe('Header actions', () => {
    it('Check if grayscale has proper class', () => {
        const { container } = render(<HeaderActions grayscale />);

        expect(getById(container, 'header-actions-container')).not.toHaveClass('basicColor');
    });

    it('Check if proper class is set when grayscale is false', () => {
        const { container } = render(<HeaderActions grayscale={false} />);

        expect(getById(container, 'header-actions-container')).toHaveClass('basicColor');
    });

    it('Should show an additional install-pwa option if the app is PwaReady', async () => {
        jest.mocked(usePWA).mockImplementation(() => ({
            isPWAReady: true,
            handlePromptInstallApp: jest.fn(),
        }));

        await waitFor(() => render(<HeaderActions grayscale />));

        const options = await waitFor(() => screen.findAllByRole('button'));
        expect(options[0]).toBe(screen.getByLabelText('Install app'));
        expect(options).toHaveLength(4);
    });

    it('Check if there are proper actions and in proper order', async () => {
        jest.mocked(usePWA).mockImplementation(() => ({
            isPWAReady: false,
            handlePromptInstallApp: jest.fn(),
        }));

        await waitFor(() => render(<HeaderActions grayscale />));

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toBe(screen.getByLabelText('Jobs in progress'));
        expect(buttons[1]).toBe(screen.getByLabelText('Question'));
        expect(buttons[2]).toBe(screen.getByLabelText('Profile'));

        expect(buttons).toHaveLength(3);
    });

    it('Opens a new tab when clicking Question', () => {
        render(<HeaderActions grayscale />);

        userEvent.click(screen.getByLabelText('Question'));
        expect(openNewTab).toHaveBeenCalled();
    });

    it('Check if there is number of running jobs shown', async () => {
        render(<HeaderActions grayscale={false} />);
        await waitFor(() => {
            expect(screen.getByTestId('number-badge-jobs-management-value')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });
});
