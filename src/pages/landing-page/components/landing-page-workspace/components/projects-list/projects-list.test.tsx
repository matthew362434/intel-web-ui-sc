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
import { ProjectProps } from '../../../../../../core/projects';
import { workspaceRender as render, getAllWithMatchId } from '../../../../../../test-utils';
import { getMockedProject } from '../../../../../../test-utils/mocked-items-factory';
import { ProjectsList } from './index';

describe('Projects list', () => {
    it('Check if two projects will be rendered', async () => {
        const mockProjects: ProjectProps[] = [
            getMockedProject({
                id: '111111',
                name: 'Test project 1',
            }),
            getMockedProject({
                id: '222222',
                name: 'Test project 2',
            }),
        ];

        const { container } = await render(<ProjectsList projects={mockProjects} />);

        const projects = getAllWithMatchId(container, 'project-id');

        expect(projects).toHaveLength(2);
    });
});
