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

import { applicationRender as render, getById, screen } from '../../../../../test-utils';
import { hoverItemLink } from '../../../../../test-utils/hoverTreeViewItem';
import { getMockedTreeLabel } from '../../../../../test-utils/mocked-items-factory';
import { LabelItemEditionState, LabelTreeItem } from '../../../../annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import { ProjectProvider } from '../../../providers';
import { ProjectLabelsManagement } from './project-labels-management.component';

const labels: LabelTreeItem[] = [
    getMockedTreeLabel({ name: 'test1', id: '1', group: 'default group' }),
    getMockedTreeLabel({ name: 'test2', id: '2', group: 'default group' }),
    getMockedTreeLabel({ name: 'test3', id: '3', group: 'default group' }),
];
const setLabels = jest.fn();

const mockMutate = jest.fn((config, helpers) => {
    const { onSuccess, onSettled } = helpers;
    onSuccess();
    onSettled();
});

jest.mock('../../../../../core/projects/hooks/use-edit-project-label.hook', () => ({
    ...jest.requireActual('../../../../../core/projects/hooks/use-edit-project-label.hook'),
    useEditProjectLabel: () => ({
        editLabels: {
            mutate: mockMutate,
        },
    }),
}));

describe('project labels management', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Check if labels are properly shown', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test-project1', workspaceId: 'test-workspace' }}>
                <ProjectLabelsManagement
                    isInEditMode={false}
                    setIsDirty={jest.fn()}
                    labelsTree={labels}
                    setLabelsTree={setLabels}
                    relation={LabelsRelationType.SINGLE_SELECTION}
                />
            </ProjectProvider>
        );

        const allListItems = screen.getAllByRole('listitem');
        expect(allListItems).toHaveLength(3);
    });

    it('Delete button is hidden', async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test-project1', workspaceId: 'test-workspace' }}>
                <ProjectLabelsManagement
                    isInEditMode={false}
                    setIsDirty={jest.fn()}
                    labelsTree={labels}
                    setLabelsTree={setLabels}
                    relation={LabelsRelationType.SINGLE_SELECTION}
                />
            </ProjectProvider>
        );

        hoverItemLink(container);
        expect(getById(container, 'delete-label-button')).not.toBeInTheDocument();
    });

    it('Check if edited value is shown', async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test-project1', workspaceId: 'test-workspace' }}>
                <ProjectLabelsManagement
                    isInEditMode={true}
                    setIsDirty={jest.fn()}
                    labelsTree={labels}
                    setLabelsTree={setLabels}
                    relation={LabelsRelationType.SINGLE_SELECTION}
                />
            </ProjectProvider>
        );

        hoverItemLink(container);
        const editButton = getById(container, 'edit-label-button');
        expect(editButton).toBeInTheDocument();
        editButton && userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'edited name' });
        expect(nameInput).toBeInTheDocument();
        userEvent.clear(nameInput);
        userEvent.type(nameInput, '123');
        userEvent.click(screen.getByLabelText('label item test2'));

        expect(setLabels).toHaveBeenCalledWith([
            { ...labels[0], name: '123', state: LabelItemEditionState.CHANGED },
            labels[1],
            labels[2],
        ]);
    });
});
