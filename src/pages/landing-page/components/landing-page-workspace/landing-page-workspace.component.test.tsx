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

import { createInMemoryProjectService } from '../../../../core/projects';
import { workspaceRender as render } from '../../../../test-utils';
import { ProjectsListContextProps, useProjectsList } from './components/projects-list/projects-list-provider.component';
import { LandingWorkspace as Workspace } from './index';

jest.mock('./components/projects-list/projects-list-provider.component', () => {
    return {
        ...jest.requireActual('./components/projects-list/projects-list-provider.component'),
        useProjectsList: jest.fn(() => {
            return {
                projects: [],
            };
        }),
    };
});

jest.mock('./components/dataset-import/dataset-import.provider.component', () => {
    return {
        ...jest.requireActual('./components/dataset-import/dataset-import.provider.component'),
        useDatasetImport: jest.fn(() => {
            return {
                uploads: {},
                getActiveUpload: jest.fn(),
            };
        }),
    };
});

describe('Landing page workspace', () => {
    const titleText = 'test workspace';

    it('renders <NoProjects /> "projects" is "undefined"', async () => {
        await render(<Workspace title={titleText} />);

        const noProjects = screen.queryByTestId('no-project-area');

        expect(noProjects).toBeDefined();
    });

    it('renders the workspace title', async () => {
        const { container } = await render(<Workspace title={titleText} />);

        const title = container.querySelector('h3');
        expect(title).toHaveTextContent(titleText);
    });

    it('renders skeleton loader if the projects query is loading', async () => {
        jest.mocked(useProjectsList).mockImplementation(
            () =>
                ({
                    projects: [],
                    reloadProjects: jest.fn(),
                    isLoading: true,
                } as ProjectsListContextProps)
        );

        await render(<Workspace title={titleText} />);

        expect(screen.getByTestId('project-item-loader-list')).toBeTruthy();
    });

    it('renders project list correctly', async () => {
        const fakeProjects = await createInMemoryProjectService().getProjects('');

        jest.mocked(useProjectsList).mockImplementation(
            () =>
                ({
                    projects: fakeProjects,
                    isLoading: false,
                    reloadProjects: jest.fn(),
                } as ProjectsListContextProps)
        );

        await render(<Workspace title={titleText} />);

        expect(screen.getByText('Test project 1')).toBeTruthy();
        expect(screen.queryByText('Test project 2')).toBeTruthy();
        expect(screen.queryByText('Test project 3')).toBeTruthy();
    });
});
