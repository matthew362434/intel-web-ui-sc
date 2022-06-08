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

import { render, screen } from '@testing-library/react';

import { LandingPageSidebar } from './landing-page-sidebar.component';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: 'localhost:3000/projects/678fds678dfs/media',
    }),
}));

describe('Landing page - sidebar', () => {
    it('Check if menu options are visible', async () => {
        render(<LandingPageSidebar />);

        const homeMenuOption = screen.getByText('Home');
        expect(homeMenuOption).toBeInTheDocument();

        const profileMenuOption = screen.getByText('Profile');
        expect(profileMenuOption).toBeInTheDocument();

        const teamMenuOption = screen.getByText('Team');
        expect(teamMenuOption).toBeInTheDocument();
    });

    it('Check if there are 5 options in sidebar menu - Home, Profile, About, Team', async () => {
        render(<LandingPageSidebar />);
        const options = await screen.getAllByRole('menuitemradio').filter((element: HTMLElement) => {
            return element.textContent !== '';
        });

        expect(options).toHaveLength(4);
        expect(options.map((element: HTMLElement) => element.textContent)).toEqual([
            'Home',
            'Profile',
            'About',
            'Team',
        ]);
    });
});
