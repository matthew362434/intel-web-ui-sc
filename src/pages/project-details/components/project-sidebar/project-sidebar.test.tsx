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
import userEvent from '@testing-library/user-event';

import { DOMAIN } from '../../../../core/projects';
import {
    applicationRender as render,
    getById,
    idMatchingFormat,
    MORE_THAN_100_CHARS_NAME,
} from '../../../../test-utils';
import { getMockedProject } from '../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../providers';
import { ProjectSidebar } from './project-sidebar.component';

const project = getMockedProject({ id: '123', domains: [DOMAIN.DETECTION] });

describe('Project sidebar', () => {
    it('Check if there is proper project title', async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: '123', workspaceId: 'test-workspace' }}>
                <ProjectSidebar status={''} project={project} isTaskChainProject={false} />
            </ProjectProvider>
        );
        const projectTitle = getById(container, `project-name-${idMatchingFormat(project.name)}`);
        const pencilButton = screen.getByLabelText('Edit name of the project');
        const titleText = projectTitle?.textContent?.replace(pencilButton.textContent || '', '');
        expect(titleText).toBe(`Test project 1@Detection`);
    });

    it('Check if there is sidebar menu', async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: '1', workspaceId: 'test-workspace' }}>
                <ProjectSidebar status={''} project={project} isTaskChainProject={false} />
            </ProjectProvider>
        );

        expect(getById(container, 'sidebar-menu-project-steps')).toBeInTheDocument();
    });

    it('Check if sidebar menu has proper options', async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: '1', workspaceId: 'test-workspace' }}>
                <ProjectSidebar status={''} project={project} isTaskChainProject={false} />
            </ProjectProvider>
        );

        expect(getById(container, 'sidebar-menu-dataset')).toBeInTheDocument();
        expect(getById(container, 'sidebar-menu-models')).toBeInTheDocument();
        expect(getById(container, 'sidebar-menu-tests')).toBeInTheDocument();
        expect(getById(container, 'sidebar-menu-deployments')).toBeInTheDocument();
    });

    it('Check if name in edition is limited to 100', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ projectId: '1', workspaceId: 'test-workspace' }}>
                <ProjectSidebar status={''} project={project} isTaskChainProject={false} />
            </ProjectProvider>
        );

        const editButton = screen.getByRole('button', { name: 'Edit name of the project' });
        userEvent.click(editButton);
        const input = screen.getByRole('textbox', { name: 'Edit project name field' });
        userEvent.clear(input);
        userEvent.type(input, MORE_THAN_100_CHARS_NAME);
        expect(input).toHaveValue(MORE_THAN_100_CHARS_NAME.substring(0, 100));
    });
});

describe('project status', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('Check project status and score in sidebar', async () => {
        process.env.REACT_APP_VALIDATION_COMPONENT_TESTS = 'true';
        const projectIdentifier = { projectId: '123', workspaceId: 'test-workspace' };

        await render(
            <ProjectProvider projectIdentifier={projectIdentifier}>
                <ProjectSidebar status={'Detection - Training'} project={project} isTaskChainProject={false} />
            </ProjectProvider>
        );

        //This score comes from in-memory-service
        expect(screen.getByText('Score: 80%')).toBeInTheDocument();
        expect(screen.getByText('Detection - Training')).toBeInTheDocument();
    });
});
