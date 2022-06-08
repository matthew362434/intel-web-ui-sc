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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { applicationRender as render } from '../../../../../../test-utils';
import { ProjectProvider } from '../../../../providers';
import { HPODialog } from './hpo-dialog.component';

jest.mock('../../../../providers', () => ({
    ...jest.requireActual('../../../../providers'),
    useProject: jest.fn(() => ({
        project: {
            datasets: [{ id: 'dataset-1', name: 'dataset-1' }],
        },
    })),
}));

describe('HPODialog', () => {
    const handleOpenHPONotification = jest.fn();

    const renderHPODialog = async (): Promise<void> => {
        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <HPODialog
                    isOpen={true}
                    setIsOpen={jest.fn()}
                    modelTemplateId={'model-template-id'}
                    taskId={'task-id'}
                    handleOpenHPONotification={handleOpenHPONotification}
                />
            </ProjectProvider>
        );
    };

    it('4x time ratio should be selected by default', async () => {
        await renderHPODialog();

        expect(screen.getByTestId('4-training-time-id')).toHaveStyle(
            'background-color: var(--spectrum-alias-background-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-background)))'
        );
    });

    it('start hpo button should be enabled on mount', async () => {
        await renderHPODialog();

        expect(screen.getByRole('button', { name: /start/i })).toBeEnabled();
    });

    it('notification handler should be invoked when hpo has started', async () => {
        await renderHPODialog();

        userEvent.click(screen.getByRole('button', { name: /start/i }));

        await waitFor(() => {
            expect(handleOpenHPONotification).toHaveBeenCalledTimes(1);
        });
    });

    it('dialog content should be shaded once hpo has started', async () => {
        await renderHPODialog();

        expect(screen.getByTestId('hpo-dialog-open-id')).not.toHaveClass('contentDisabled', { exact: false });

        userEvent.click(screen.getByRole('button', { name: /start/i }));

        await waitFor(() => {
            expect(screen.getByTestId('hpo-dialog-open-id')).toHaveClass('contentDisabled', { exact: false });
        });
    });
});
