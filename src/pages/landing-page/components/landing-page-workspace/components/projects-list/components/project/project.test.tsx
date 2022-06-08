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

import { LABEL_BEHAVIOUR } from '../../../../../../../../core/labels';
import { DOMAIN } from '../../../../../../../../core/projects';
import { getById, workspaceRender as render, screen } from '../../../../../../../../test-utils';
import {
    getMockedLabel,
    getMockedProject,
    getMockedTask,
    mockedLongLabels,
} from '../../../../../../../../test-utils/mocked-items-factory';
import { Project } from './index';

describe('Project', () => {
    it('Check name and domain string when there are two domains', async () => {
        const arrowSign = '\u2192';
        const mockProject = getMockedProject({
            id: '1111',
            domains: [DOMAIN.CLASSIFICATION, DOMAIN.DETECTION],
        });
        const { container } = await render(<Project project={mockProject} />);

        const projectNameContainer = getById(container, 'project-name-test-project-1');
        const pencilButton = screen.getByLabelText('Edit name of the project');
        const projectName = projectNameContainer?.textContent?.replace(pencilButton.textContent || '', '');
        expect(projectName).toBe(`Test project 1@Classification${arrowSign}Detection`);
    });

    it('check name and domain string when there is one domain', async () => {
        const mockProject = getMockedProject({ id: '2222', domains: [DOMAIN.CLASSIFICATION] });
        const { container } = await render(<Project project={mockProject} />);

        const projectNameContainer = getById(container, 'project-name-test-project-1');
        const pencilButton = screen.getByLabelText('Edit name of the project');
        const projectName = projectNameContainer?.textContent?.replace(pencilButton.textContent || '', '');

        expect(projectName).toBe(`Test project 1@Classification`);
    });

    it('check if empty label were filtered out', async () => {
        const labels = [
            getMockedLabel({ id: '1', name: 'cat' }),
            getMockedLabel({ id: '2', name: 'dog' }),
            getMockedLabel({ id: '3', name: 'Some random name', isExclusive: true }),
        ];

        const mockProject = getMockedProject({
            name: 'test project',
            tasks: [getMockedTask({ domain: DOMAIN.CLASSIFICATION, labels })],
        });

        await render(<Project project={mockProject} />);

        const filteredOutLabel = screen.queryByText('Some random name');

        expect(screen.queryByText('cat')).toBeTruthy();
        expect(screen.queryByText('dog')).toBeTruthy();
        expect(filteredOutLabel).toBeFalsy();
    });

    it('check if long labels are displayed properly', async () => {
        const mockProject = getMockedProject({
            name: 'project with long labels',
            tasks: [getMockedTask({ domain: DOMAIN.CLASSIFICATION, labels: mockedLongLabels })],
        });

        await render(<Project project={mockProject} />);
        expect(screen.getByText(mockProject.labels[0].name)).toHaveStyle('text-overflow: ellipsis');
        expect(screen.getByText(mockProject.labels[1].name)).toHaveStyle('text-overflow: ellipsis');
        expect(screen.getByText(mockProject.labels[2].name)).toHaveStyle('text-overflow: ellipsis');

        expect(screen.getByText(mockProject.labels[0].name)).toHaveStyle('maxWidth: 200px');
        expect(screen.getByText(mockProject.labels[1].name)).toHaveStyle('maxWidth: 200px');
        expect(screen.getByText(mockProject.labels[2].name)).toHaveStyle('maxWidth: 200px');
    });

    it('Shows normal and anomalous labels', async () => {
        const labels = [
            getMockedLabel({ id: '1', name: 'Normal', behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE }),
            getMockedLabel({
                id: '2',
                name: 'Anomalous',
                behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.ANOMALOUS,
            }),
        ];

        const mockProject = getMockedProject({
            name: 'test project',
            tasks: [getMockedTask({ domain: DOMAIN.ANOMALY_CLASSIFICATION, labels })],
        });

        await render(<Project project={mockProject} />);

        expect(screen.queryByText('Normal')).toBeTruthy();
        expect(screen.queryByText('Anomalous')).toBeTruthy();
    });
});
