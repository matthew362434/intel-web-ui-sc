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

import userEvent from '@testing-library/user-event';

import { DOMAIN } from '../../../../core/projects';
import { workspaceRender as render } from '../../../../test-utils';
import { NewProjectDialogContext } from '../../new-project-dialog-provider';
import {
    NewProjectDialogContextProps,
    ProjectType,
    STEPS,
} from '../../new-project-dialog-provider/new-project-dialog-provider.interface';
import { ProjectLabelsManagement } from './project-labels-management.component';

const defaultNewProjectDialogProviderValues: NewProjectDialogContextProps = {
    goToPreviousStep: jest.fn(),
    resetSteps: jest.fn(),
    save: jest.fn(),
    hasNextStep: true,
    hasPreviousStep: true,
    isLoading: false,
    isValid: true,
    updateProjectState: jest.fn(),
    goToNextStep: jest.fn(),
    content: <></>,
    metadata: {
        name: '',
        selectedDomains: [DOMAIN.DETECTION],
        projectTypeMetadata: [],
        selectedTab: DOMAIN.DETECTION,
        currentStep: STEPS.SELECT_TEMPLATE,
        projectType: ProjectType.SINGLE,
    },
};

describe('ManageProjectLabels component', () => {
    const animationDirection = 1;
    // it('change hotkey to next in the line and add label - next one will not have that hotkey by default', async () => {
    //     const { container } = await render(
    //         <NewProjectDialogProvider>
    //             <ProjectLabelsManagement
    //                 setValidity={jest.fn()}
    //                 selectedDomain={DOMAIN.DETECTION}
    //                 animationDirection={animationDirection}
    //             />
    //         </NewProjectDialogProvider>
    //     );
    //
    //     const labelField = screen.getByPlaceholderText('Label name');
    //     userEvent.type(labelField, 'test');
    //
    //     const addButton = screen.getByTestId('add-label-button');
    //     userEvent.click(addButton);
    //
    //     hoverItemLink(container);
    //
    //     userEvent.click(screen.getByLabelText('edit label'));
    //
    //     const hotkeyInput = screen.getByRole('link', { name: '+ Add hot key' });
    //
    //     userEvent.type(hotkeyInput, '');
    //     fireEvent.keyDown(hotkeyInput, { key: 'ctrl', code: 'ctrl', charCode: 17 });
    //     fireEvent.keyDown(hotkeyInput, { key: '2', code: '2', charCode: 50 });
    //
    //     userEvent.type(labelField, 'test2');
    //     userEvent.click(addButton);
    //     const secondLabelHotkey = getById(container, 'label-hotkey-test2');
    //     expect(secondLabelHotkey).toHaveTextContent('CTRL+3');
    // });

    // it('Check if next function is called after clicking enter in first step of task chain', async () => {
    //     let next = false;
    //     await render(
    //         <NewProjectDialogContext.Provider
    //             value={{
    //                 ...defaultNewProjectDialogProviderValues,
    //                 metadata: {
    //                     name: 'test',
    //                     projectTypeMetadata: [],
    //                     selectedDomains: [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION],
    //                     selectedTab: DOMAIN.DETECTION,
    //                     currentStep: STEPS.SELECT_TEMPLATE,
    //                     projectType: ProjectType.TASK_CHAIN,
    //                 },
    //                 goToNextStep: jest.fn(() => {
    //                     next = true;
    //                 }),
    //                 content: (
    //                     <ProjectLabelsManagement
    //                         setValidity={jest.fn()}
    //                         selectedDomain={DOMAIN.DETECTION}
    //                         animationDirection={animationDirection}
    //                     />
    //                 ),
    //                 isValid: true,
    //             }}
    //         >
    //             <ProjectLabelsManagement
    //                 setValidity={jest.fn()}
    //                 selectedDomain={DOMAIN.DETECTION}
    //                 animationDirection={animationDirection}
    //             />
    //         </NewProjectDialogContext.Provider>
    //     );
    //
    //     userEvent.keyboard('{Enter}');
    //     expect(next).toBeTruthy();
    // });

    it('Check if next function is not called on enter when name is not valid', async () => {
        let next = false;
        await render(
            <NewProjectDialogContext.Provider
                value={{
                    ...defaultNewProjectDialogProviderValues,
                    metadata: {
                        name: 'test',
                        projectTypeMetadata: [],
                        selectedDomains: [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION],
                        selectedTab: DOMAIN.DETECTION,
                        currentStep: STEPS.SELECT_TEMPLATE,
                        projectType: ProjectType.SINGLE,
                    },
                    goToNextStep: jest.fn(() => {
                        next = true;
                    }),
                    content: (
                        <ProjectLabelsManagement
                            setValidity={jest.fn()}
                            selectedDomain={DOMAIN.DETECTION}
                            animationDirection={animationDirection}
                        />
                    ),
                    isValid: false,
                }}
            >
                <ProjectLabelsManagement
                    setValidity={jest.fn()}
                    selectedDomain={DOMAIN.DETECTION}
                    animationDirection={animationDirection}
                />
            </NewProjectDialogContext.Provider>
        );

        userEvent.keyboard('{Enter}');
        expect(next).toBeFalsy();
    });
});
