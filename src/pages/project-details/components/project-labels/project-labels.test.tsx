// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import userEvent from '@testing-library/user-event';

import { applicationRender as render, screen } from '../../../../test-utils';
import { ProjectProvider } from '../../providers';
import { ProjectLabels } from './project-labels.component';

describe('Project labels', () => {
    it('Should open saving popup when there are some new labels', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test', workspaceId: 'default' }}>
                <ProjectLabels isInEdition setInEdition={jest.fn()} />
            </ProjectProvider>
        );

        userEvent.click(screen.getByRole('button', { name: 'Add label' }));
        userEvent.type(screen.getByRole('textbox', { name: 'edited name' }), 'test');
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
    });

    it('Should not open saving popup when there are only idle, edited or deleted labels', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test', workspaceId: 'default' }}>
                <ProjectLabels isInEdition setInEdition={jest.fn()} />
            </ProjectProvider>
        );

        userEvent.hover(screen.getByText('card'));
        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.queryByRole('button', { name: 'Assign' })).not.toBeInTheDocument();
    });
});
