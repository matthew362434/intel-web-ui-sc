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

import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateProjectProps, DOMAIN, TaskMetadata } from '../../core/projects';
import { applicationRender as render } from '../../test-utils';
import { ProjectsListContext } from '../landing-page/components/landing-page-workspace/components';
import {
    NewProjectDialog,
    NewProjectDialogProvider,
    REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE,
    UNIQUE_VALIDATION_MESSAGE,
} from './index';

const selectDetectionClassificationChain = () => {
    const tab = screen.getByText('Chained tasks');
    fireEvent.click(tab);

    const detectionClassificationChain = screen.getByText('Detection > Classification');
    fireEvent.click(detectionClassificationChain);
};

const selectClassificationDomain = () => {
    fireEvent.click(screen.getByText('Classification'));
};

const selectDetectionSegmentationChain = () => {
    const tab = screen.getByText('Chained tasks');
    fireEvent.click(tab);

    const detectionSegmentationChain = screen.getByText('Detection > Segmentation');
    fireEvent.click(detectionSegmentationChain);
};

const selectAnomalyDomain = () => {
    fireEvent.click(screen.getByText('Anomaly'));
};

const clickNextButton = () => {
    const nextButtonTemplate = screen.getByRole('button', { name: 'Next' });

    expect(nextButtonTemplate).toBeEnabled();
    fireEvent.click(nextButtonTemplate);
};

const clickBackButton = () => {
    const previousButtonTemplate = screen.getByRole('button', { name: 'Back' });

    expect(previousButtonTemplate).toBeEnabled();
    fireEvent.click(previousButtonTemplate);
};

const typeIntoTextbox = (name: string) => {
    const textField = screen.getByRole('textbox');

    userEvent.type(textField, name);
};

// const addLabelWithChild = (parentLabelName: string) => {
//     typeIntoTextbox(parentLabelName);
//
//     userEvent.keyboard('{Enter}');
//     userEvent.hover(screen.getByTestId(`item-link-${parentLabelName}`));
//
//     const addChild = screen.getByRole('button', { name: 'add-child-label-button' });
//
//     userEvent.click(addChild);
//     userEvent.click(screen.getByText(parentLabelName));
// };

//let createProjectData: { tasksLabels: TaskMetadata[] };

jest.mock('../../core/projects', () => ({
    ...jest.requireActual('../../core/projects'),
    createInMemoryProjectService: () => ({
        createProject: async (
            _workspaceId: string,
            _name: string,
            _domains: DOMAIN[],
            _tasksLabels: TaskMetadata[]
        ): Promise<CreateProjectProps> => {
            // createProjectData = { tasksLabels };
            return Promise.resolve({} as CreateProjectProps);
        },
    }),
}));

describe('Open new project dialog', () => {
    const buttonText = 'test button';

    beforeEach(async () => {
        await render(
            <ProjectsListContext.Provider value={{ projects: [], isLoading: false, reloadProjects: jest.fn() }}>
                <NewProjectDialogProvider>
                    <NewProjectDialog buttonText={buttonText} />
                </NewProjectDialogProvider>
            </ProjectsListContext.Provider>
        );

        const button = screen.getByText(buttonText);

        expect(button).toBeInTheDocument();

        userEvent.click(button);
    });

    it('opens on button click', async () => {
        const dialog = screen.getByRole('dialog');

        expect(dialog).toBeInTheDocument();
    });

    it("Next button it disabled when project's name is empty", () => {
        expect(screen.getByRole('textbox')).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it("Next button is enabled when project's name is not empty", () => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

        typeIntoTextbox('test');

        expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    it("When there are some labels 'create' button is enabled", () => {
        typeIntoTextbox('test');
        clickNextButton();

        const input = screen.getByLabelText('Label');

        userEvent.type(input, 'test_label');

        const addButton = screen.getAllByRole('button')[1];

        fireEvent.click(addButton);
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('Should not allow adding labels to anomaly projects', () => {
        typeIntoTextbox('test project');
        selectAnomalyDomain();

        // Anomaly classification selected by default
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();

        // Select Anomaly Detection
        fireEvent.click(screen.getByTestId('anomaly-detection-card-id'));
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();

        // Select Anomaly Segmentation
        fireEvent.click(screen.getByTestId('anomaly-segmentation-card-id'));
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should only allow creating a single-task classification project if there are at least 2 labels', () => {
        typeIntoTextbox('test project');
        selectClassificationDomain();
        clickNextButton();

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

        // Add one label
        typeIntoTextbox('test_label');

        const addButton = screen.getAllByRole('button')[1];

        fireEvent.click(addButton);

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

        // Add another label
        typeIntoTextbox('test_label_2');
        fireEvent.click(addButton);

        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should only allow creating a task-chain classification project if there are at least 2 root labels', () => {
        typeIntoTextbox('test project');
        selectDetectionClassificationChain();
        clickNextButton();

        // Add a label for detection task
        typeIntoTextbox('detection_label');

        // Navigate to the next task
        clickNextButton();

        const addButton = screen.getByTestId('add-label-button');

        // Add one group and one label for classification task
        typeIntoTextbox('labelGroup1');
        fireEvent.click(addButton);

        userEvent.hover(screen.getByText('labelGroup1'));
        fireEvent.click(screen.getByTestId('add-child-label-button'));

        userEvent.type(screen.getByLabelText('edited name'), 'classification_label_1');
        fireEvent.click(screen.getByLabelText('Submit'));

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

        // Add a second label for classification task
        userEvent.hover(screen.getByText('labelGroup1'));
        fireEvent.click(screen.getByTestId('add-child-label-button'));
        userEvent.type(screen.getByLabelText('edited name'), 'classification_label_2');
        fireEvent.click(screen.getByLabelText('Submit'));

        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should not allow creating a task-chain classification project if there are not least 2 root labels', () => {
        typeIntoTextbox('test project');
        selectDetectionClassificationChain();
        clickNextButton();

        // Add a label for detection task
        typeIntoTextbox('detection_label');

        // Navigate to the next task
        clickNextButton();

        const addButton = screen.getByTestId('add-label-button');

        // Add one group and one label for classification task
        typeIntoTextbox('labelGroup1');
        fireEvent.click(addButton);

        userEvent.hover(screen.getByText('labelGroup1'));
        fireEvent.click(screen.getByTestId('add-child-label-button'));

        userEvent.type(screen.getByLabelText('edited name'), 'classification_label_1');
        fireEvent.click(screen.getByLabelText('Submit'));

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

        // Add another group label (which is not a root label)
        typeIntoTextbox('labelGroup2');
        fireEvent.click(addButton);

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

        // Now let's add another label to the second group, which should fulfill the condition
        userEvent.hover(screen.getByText('labelGroup2'));
        fireEvent.click(screen.getAllByTestId('add-child-label-button')[1]);

        userEvent.type(screen.getByLabelText('edited name'), 'classification_label_2');
        fireEvent.click(screen.getByLabelText('Submit'));

        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should show additional info for classification projects', () => {
        typeIntoTextbox('test project');
        selectClassificationDomain();
        clickNextButton();

        // Should be visible on single task classification
        expect(screen.queryByTestId('info-section')).toBeInTheDocument();

        // Navigate back and select anomaly task type
        clickBackButton();
        selectAnomalyDomain();

        // Should be not be visible for anomaly task type
        expect(screen.queryByTestId('info-section')).not.toBeInTheDocument();

        // Select task chain type
        selectDetectionClassificationChain();
        clickNextButton();

        expect(screen.queryByTestId('info-section')).not.toBeInTheDocument();

        // Add a label for detection task and navigate to the next task (classification)
        typeIntoTextbox('detection_label');
        clickNextButton();

        // Info section should now be visible
        expect(screen.queryByTestId('info-section')).toBeInTheDocument();
    });

    it('Select Chained tasks', () => {
        const tab = screen.getByText('Chained tasks');
        fireEvent.click(tab);

        const detectionClassificationChain = screen.getByText('Detection > Classification');
        expect(detectionClassificationChain).toBeInTheDocument();

        const detectionSegmentationChain = screen.getByText('Detection > Segmentation');
        expect(detectionSegmentationChain).toBeInTheDocument();
    });

    it('Check if segmentation task from chain has empty labels at the beginning', () => {
        typeIntoTextbox('test project');
        selectDetectionSegmentationChain();
        clickNextButton();
        typeIntoTextbox('cat');
        clickNextButton();
        const inputText = screen.getByRole('textbox', { name: 'Project label name input' });
        expect(inputText).toHaveValue('');
    });

    // it('Create Detection > Classification project', () => {
    //     selectDetectionClassificationChain();
    //     typeIntoTextbox('test');
    //     clickNextButton();
    //     typeIntoTextbox('detection-label');
    //     clickNextButton();
    //
    //     const groupTextField = screen.getByRole('textbox', { name: 'Group name' });
    //
    //     userEvent.type(groupTextField, 'Root');
    //     const saveButton = screen.getByRole('button', { name: 'save changes' });
    //     userEvent.click(saveButton);
    //
    //     const group = screen.getByRole('listitem', { name: 'label item Root' });
    //     userEvent.hover(group);
    //     userEvent.click(screen.getByRole('button', { name: 'add-child-label-button' }));
    //     userEvent.type(screen.getByRole('textbox', { name: 'edited name' }), '123');
    //     userEvent.keyboard('[Enter]');
    //
    //     userEvent.hover(group);
    //     userEvent.click(screen.getByRole('button', { name: 'add-child-label-button' }));
    //     userEvent.type(screen.getByRole('textbox', { name: 'edited name' }), '234');
    //     userEvent.keyboard('[Enter]');
    //
    //     const createButton = screen.getByRole('button', { name: 'Create' });
    //     expect(createButton).toBeEnabled();
    // });

    it('Create Detection > Classification project - check if label from detection is visible after going back', () => {
        selectDetectionClassificationChain();
        typeIntoTextbox('test-chain');
        clickNextButton();
        typeIntoTextbox('detection-label');
        clickNextButton();

        const groupTextField = screen.getByLabelText('Group name');
        expect(groupTextField).toBeInTheDocument();

        clickBackButton();

        expect(screen.getByRole('textbox')).toHaveValue('detection-label');
    });

    it('Create Detection > Segmentation project - check if choosing same label name as in first step shows error', () => {
        selectDetectionSegmentationChain();
        typeIntoTextbox('test-chain');
        clickNextButton();
        typeIntoTextbox('test-label');
        clickNextButton();

        const labelTextField = screen.getByLabelText('Label');
        userEvent.type(labelTextField, 'test-label');

        expect(screen.getByText(UNIQUE_VALIDATION_MESSAGE('test-label'))).toBeInTheDocument();
    });

    it('CVS-66535 cannot add label in task chain', () => {
        selectDetectionClassificationChain();
        typeIntoTextbox('test project');
        clickNextButton();
        clickBackButton();
        clickNextButton();

        typeIntoTextbox('new label');

        expect(screen.getByRole('textbox')).toHaveValue('new label');
    });

    it('Click previous step when defining labels - next button should be visible and name should be shown', () => {
        typeIntoTextbox('test');
        clickNextButton();

        clickBackButton();

        expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
        expect(screen.getByRole('textbox')).toHaveValue('test');
    });

    it("Type names contains only spaces - error should be displayed and 'next' button should be disabled", () => {
        typeIntoTextbox('   ');
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        expect(screen.getByText(REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE)).toBeInTheDocument();
    });

    // describe('NewProjectDialog - Check data to save', () => {
    //     // it('Task chain - check if enters properly save first task label', async () => {
    //     //     typeIntoTextbox('task chain - Detection Classification');
    //     //     selectDetectionClassificationChain();
    //     //     userEvent.click(screen.getByRole('button', { name: 'Next' }));
    //     //
    //     //     const input = screen.getByRole('textbox', { name: 'Label' });
    //     //
    //     //     userEvent.type(input, 'animal');
    //     //     userEvent.keyboard('[Enter]');
    //     //
    //     //     userEvent.clear(input);
    //     //     userEvent.type(input, 'test');
    //     //     userEvent.keyboard('[Enter]');
    //     //
    //     //     userEvent.click(screen.getByRole('button', { name: 'Create' }));
    //     //
    //     //     await waitFor(() => {
    //     //         expect(createProjectData.tasksLabels[0].labels[0].name).toBe('animal');
    //     //     });
    //     // });
    //     // it('CVS-70383 - Labels hierarchy breaks when the parent label name is changed', async () => {
    //     //     typeIntoTextbox('new classification project');
    //     //     selectClassificationDomain();
    //     //     clickNextButton();
    //     //
    //     //     addLabelWithChild('label');
    //     //
    //     //     userEvent.hover(screen.getByTestId('item-link-label'));
    //     //
    //     //     const edit = screen.getByRole('button', { name: 'edit-label-button' });
    //     //
    //     //     userEvent.click(edit);
    //     //
    //     //     const input = screen.getByRole('textbox', { name: 'edited name' });
    //     //
    //     //     userEvent.clear(input);
    //     //     userEvent.type(input, 'label1');
    //     //     userEvent.click(screen.getAllByText('label(1)')[0]);
    //     //
    //     //     userEvent.click(screen.getByRole('button', { name: 'Create' }));
    //     //
    //     //     await waitFor(() => {
    //     //         const taskLabels = createProjectData.tasksLabels[0].labels;
    //     //         const parentLabel = taskLabels[0];
    //     //
    //     //         expect(taskLabels).toHaveLength(1);
    //     //         expect(parentLabel.children).toHaveLength(1);
    //     //         expect(parentLabel.children[0].parentLabelId).toBe(parentLabel.id);
    //     //     });
    //     // });
    // });
});
