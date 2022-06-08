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

import { DOMAIN } from '../../../../../core/projects';
import { applicationRender as render, getById, MORE_THAN_100_CHARS_NAME } from '../../../../../test-utils';
import { hoverItemLink } from '../../../../../test-utils/hoverTreeViewItem';
import { getMockedTreeLabel } from '../../../../../test-utils/mocked-items-factory';
import { LabelTreeItem, LabelTreeLabel } from '../../../../annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../select-project-template/utils';
import { LABEL_TREE_TYPE } from '../label-tree-type.enum';
import { TaskLabelsManagement } from './task-labels-management.component';

describe('Task label management', () => {
    const mockTaskMetadata = {
        labels: [],
        domain: DOMAIN.SEGMENTATION,
        relation: LabelsRelationType.SINGLE_SELECTION,
    };

    it("Task of type single label - type name 'single label', it should be visible in textfield", async () => {
        await render(
            <TaskLabelsManagement
                taskMetadata={mockTaskMetadata}
                type={LABEL_TREE_TYPE.SINGLE}
                setValidity={jest.fn()}
                next={jest.fn()}
                setLabels={jest.fn()}
                projectLabels={[]}
            />
        );

        const textField = screen.getByLabelText('Label');
        userEvent.type(textField, 'single label');
        expect(textField).toHaveValue('single label');
    });

    it('should assign a color to the single label', async () => {
        const { container } = await render(
            <TaskLabelsManagement
                taskMetadata={mockTaskMetadata}
                type={LABEL_TREE_TYPE.SINGLE}
                setValidity={jest.fn()}
                next={jest.fn()}
                setLabels={jest.fn()}
                projectLabels={[]}
            />
        );

        const colorButton = getById(container, 'change-color-button');
        expect(colorButton?.firstElementChild).not.toHaveStyle('background-color: rgb(255,255,255)');
    });

    it('should invoke "next" callback correctly', async () => {
        const nextMock = jest.fn();

        await render(
            <TaskLabelsManagement
                taskMetadata={mockTaskMetadata}
                type={LABEL_TREE_TYPE.SINGLE}
                setValidity={jest.fn()}
                next={nextMock}
                setLabels={jest.fn()}
                projectLabels={[]}
            />
        );

        const input = screen.getByLabelText('Label');
        userEvent.type(input, 'Test label');

        userEvent.keyboard('{Enter}');
        expect(nextMock).toBeCalledWith();
    });

    it('should disabled the "add" button after adding a label', async () => {
        const nextMock = jest.fn();
        await render(
            <TaskLabelsManagement
                taskMetadata={mockTaskMetadata}
                type={LABEL_TREE_TYPE.HIERARCHY}
                setValidity={jest.fn()}
                next={nextMock}
                setLabels={jest.fn()}
                projectLabels={[]}
            />
        );
        const addLabel = screen.getByTestId('add-label-button');
        expect(addLabel).toBeDisabled();

        const input = screen.getByLabelText('Label');
        userEvent.type(input, 'Test label');

        expect(addLabel).toBeEnabled();

        userEvent.click(addLabel);
        expect(addLabel).toBeDisabled();
    });

    it('should limit the name to 100 characters', async () => {
        const nextMock = jest.fn();

        await render(
            <TaskLabelsManagement
                taskMetadata={mockTaskMetadata}
                type={LABEL_TREE_TYPE.FLAT}
                setValidity={jest.fn()}
                next={nextMock}
                setLabels={jest.fn()}
                projectLabels={[]}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Project label name input' });
        userEvent.type(input, MORE_THAN_100_CHARS_NAME);

        expect(input.getAttribute('value')).not.toBe(MORE_THAN_100_CHARS_NAME);
        expect(input).toHaveValue(MORE_THAN_100_CHARS_NAME.substring(0, 100));
    });

    describe('Check if domain names are proper', () => {
        let allLabels: LabelTreeItem[] = [];
        const setTaskLabelsHandler = (labels: LabelTreeItem[]) => {
            allLabels = labels;
        };

        const addLabel = (name: string) => {
            const addLabelButton = screen.getByTestId('add-label-button');
            const input = screen.getByLabelText('Label');

            userEvent.type(input, name);
            userEvent.click(addLabelButton);
        };

        const turnOnEditionMode = (container: HTMLElement) => {
            hoverItemLink(container);

            const editButton = getById(container, 'edit-label-button');

            expect(editButton).toBeInTheDocument();
            editButton && userEvent.click(editButton);
        };
        const editLabelName = (
            container: HTMLElement,
            newName: string,
            turnOnEditMode = true,
            leaveEditMode = false
        ) => {
            turnOnEditMode && turnOnEditionMode(container);

            const nameInput = screen.getByRole('textbox', { name: 'edited name' });

            userEvent.clear(nameInput);
            userEvent.type(nameInput, newName);

            !leaveEditMode && userEvent.click(container);
        };
        const labelName = 'test 123';
        const detectionLabel: LabelTreeItem = getMockedTreeLabel({
            group: labelName,
            name: labelName,
        });

        beforeEach(() => {
            allLabels = [];
        });

        it('add new label in MULTI LABEL project - group equal to name', async () => {
            await render(
                <TaskLabelsManagement
                    taskMetadata={{ ...mockTaskMetadata, relation: LabelsRelationType.MULTI_SELECTION }}
                    type={LABEL_TREE_TYPE.FLAT}
                    setValidity={jest.fn()}
                    next={jest.fn()}
                    projectLabels={allLabels}
                    setLabels={setTaskLabelsHandler}
                />
            );

            addLabel(labelName);

            expect(allLabels).toHaveLength(1);
            expect((allLabels[0] as LabelTreeLabel).group).toBe(labelName);
        });
        it('edit label in DETECTION project - group equal to name', async () => {
            allLabels = [detectionLabel];

            const { container } = await render(
                <TaskLabelsManagement
                    taskMetadata={{
                        ...mockTaskMetadata,
                        labels: allLabels,
                        relation: LabelsRelationType.MULTI_SELECTION,
                    }}
                    type={LABEL_TREE_TYPE.FLAT}
                    setValidity={jest.fn()}
                    next={jest.fn()}
                    projectLabels={allLabels}
                    setLabels={setTaskLabelsHandler}
                />
            );

            const newName = 'new name';
            addLabel(labelName);
            editLabelName(container, newName);

            expect(allLabels[0].name).toBe(newName);
            expect((allLabels[0] as LabelTreeLabel).group).toBe(labelName);
        });

        it('If there is already label Detection from task chain, fill the values', async () => {
            const name = 'detection label';
            const labels = [getMockedTreeLabel({ name, color: '#aabb44ff' })];

            const { container } = await render(
                <TaskLabelsManagement
                    taskMetadata={{ ...mockTaskMetadata, labels }}
                    type={LABEL_TREE_TYPE.SINGLE}
                    setValidity={jest.fn()}
                    next={jest.fn()}
                    projectLabels={allLabels}
                    setLabels={setTaskLabelsHandler}
                />
            );

            expect(screen.getByRole('textbox', { name: 'Project label name input' })).toHaveValue(name);

            const selectedColor = getById(container, 'change-color-button-selected-color');
            expect(selectedColor).toHaveStyle('background-color: rgb(170, 187, 68)');
        });

        it('Do not crop last letter from first task in chain', async () => {
            const setTaskLabelsMock = jest.fn();
            const nextMock = jest.fn();

            await render(
                <TaskLabelsManagement
                    taskMetadata={mockTaskMetadata}
                    type={LABEL_TREE_TYPE.SINGLE}
                    setValidity={jest.fn()}
                    next={nextMock}
                    projectLabels={allLabels}
                    setLabels={setTaskLabelsMock}
                />
            );

            const input = screen.getByRole('textbox', { name: 'Project label name input' });

            userEvent.type(input, 'abc');
            userEvent.keyboard('[Enter]');

            expect(setTaskLabelsMock).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'abc' })]);
            expect(nextMock).toHaveBeenCalled();
        });
    });
});
