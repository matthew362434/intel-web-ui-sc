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

import { createInMemoryProjectService, DOMAIN } from '../../../../core/projects';
import { getById, MORE_THAN_100_CHARS_NAME, workspaceRender as render } from '../../../../test-utils';
import { NewProjectDialogContext, NewProjectDialogProvider, STEPS } from '../../new-project-dialog-provider';
import { ProjectType } from '../../new-project-dialog-provider/new-project-dialog-provider.interface';
import { REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE } from '../utils';
import { SelectProjectTemplate } from './select-project-template.component';
import { LabelsRelationType } from './utils';

describe('Select project template step', () => {
    const setValidity = jest.fn();
    const animationDirection = -1;

    it("There's selecting template step with name 'Untitled' and domains", async () => {
        await render(
            <NewProjectDialogProvider>
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogProvider>
        );

        expect(screen.getByPlaceholderText('Untitled')).toBeInTheDocument();
    });

    it('Selected "Detection" tab and its first element by default', async () => {
        const { container } = await render(
            <NewProjectDialogProvider>
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogProvider>
        );
        const detectionCard = getById(container, 'detection-card-id');

        expect(getById(container, 'select-template-Detection-id')?.parentElement?.getAttribute('class')).toMatch(
            /.*is-selected_.*/
        );
        expect(detectionCard).toHaveClass('selected', { exact: false });
    });

    it('Check if empty name will show error', async () => {
        await render(
            <NewProjectDialogProvider>
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogProvider>
        );
        const nameTextField = screen.getByRole('textbox');

        userEvent.type(nameTextField, 'test');
        userEvent.clear(nameTextField);

        await waitFor(() => expect(screen.getByText(REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE)).toBeInTheDocument());
    });

    it('Check if name is limited to 100 signs', async () => {
        await render(
            <NewProjectDialogProvider>
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogProvider>
        );
        const nameTextField = screen.getByRole('textbox');

        userEvent.clear(nameTextField);
        userEvent.type(nameTextField, MORE_THAN_100_CHARS_NAME);

        expect(nameTextField).toHaveValue(MORE_THAN_100_CHARS_NAME.substring(0, 100));
    });

    it('Check if name already exist even with empty added spaces', async () => {
        const currentProjects = await createInMemoryProjectService().getProjects('11234');

        await render(
            <NewProjectDialogProvider>
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogProvider>
        );

        const nameTextField = screen.getByRole('textbox');

        userEvent.clear(nameTextField);
        userEvent.type(nameTextField, `${currentProjects[0].name} `);

        expect(screen.queryByText(`Project '${currentProjects[0].name}' already exists`)).toBeInTheDocument();
    });

    it('Check if validation is call when name is not empty', async () => {
        await render(
            <NewProjectDialogContext.Provider
                value={{
                    save: jest.fn(),
                    isLoading: false,
                    metadata: {
                        name: 'test',
                        selectedDomains: [DOMAIN.SEGMENTATION],
                        projectTypeMetadata: [
                            { domain: DOMAIN.SEGMENTATION, labels: [], relation: LabelsRelationType.SINGLE_SELECTION },
                        ],
                        selectedTab: DOMAIN.DETECTION,
                        currentStep: STEPS.SELECT_TEMPLATE,
                        projectType: ProjectType.SINGLE,
                    },
                    hasNextStep: false,
                    hasPreviousStep: false,
                    goToNextStep: jest.fn(),
                    goToPreviousStep: jest.fn(),
                    resetSteps: jest.fn(),
                    updateProjectState: jest.fn(),
                    content: <></>,
                    isValid: true,
                }}
            >
                <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
            </NewProjectDialogContext.Provider>
        );

        await waitFor(() => expect(setValidity).toHaveBeenCalled());
    });
});
