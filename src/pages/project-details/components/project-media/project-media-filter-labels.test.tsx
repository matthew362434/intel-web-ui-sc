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

import { Label } from '../../../../core/labels';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { createInMemoryProjectService, DOMAIN } from '../../../../core/projects';
import { MediaUploadProvider } from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { fireEvent, applicationRender as render, screen, within } from '../../../../test-utils';
import { getMockedProject, labels as MockLabels } from '../../../../test-utils/mocked-items-factory';
import { MediaProvider } from '../../../media/providers';
import { ProjectProvider } from '../../providers';
import { ProjectMediaFilterLabels } from './project-media-filter-labels.component';

describe('Default label combobox', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    const mediaService = createInMemoryMediaService();
    const projectService = createInMemoryProjectService();

    const setMediaSearchOptions = (): void => {
        return;
    };

    const renderMediaFilters = async (labels: Label[]) => {
        const getProjectSpy = jest.spyOn(projectService, 'getProject').mockResolvedValue(
            getMockedProject({
                id: datasetIdentifier.projectId,
                name: 'In memory detection',
                domains: [DOMAIN.SEGMENTATION],
                labels,
                score: 80,
                tasks: [
                    {
                        id: '1',
                        labels,
                        domain: DOMAIN.SEGMENTATION,
                        title: 'Segmentation task',
                    },
                ],
            })
        );

        await render(
            <MediaUploadProvider mediaService={mediaService}>
                <ProjectProvider projectIdentifier={datasetIdentifier}>
                    <MediaProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                        <ProjectMediaFilterLabels setMediaSearchOptions={setMediaSearchOptions} />
                    </MediaProvider>
                </ProjectProvider>
            </MediaUploadProvider>
        );

        return { getProjectSpy };
    };

    it('shows the hierarchy of the currently selected labels', async () => {
        const { getProjectSpy } = await renderMediaFilters(MockLabels);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        expect(screen.getAllByRole('listitem')).toHaveLength(11);

        userEvent.type(input, '♣');

        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        expect(screen.getByText('card')).toBeInTheDocument();
        expect(screen.getByText('black')).toBeInTheDocument();
        expect(screen.getByText('♣')).toBeInTheDocument();

        fireEvent.click(screen.getByText('♣'));

        userEvent.clear(input);
        userEvent.type(input, '♥');
        fireEvent.click(screen.getByText('♥'));

        const selectedLabels = screen.getByLabelText('Selected labels');
        expect(within(selectedLabels).getAllByText('card')).toHaveLength(2);
        expect(within(selectedLabels).getByText('black')).toBeInTheDocument();
        expect(within(selectedLabels).getByText('♣')).toBeInTheDocument();

        expect(within(selectedLabels).getByText('red')).toBeInTheDocument();
        expect(within(selectedLabels).getByText('♥')).toBeInTheDocument();

        getProjectSpy.mockRestore();
    });

    it('can remove a selected label', async () => {
        const { getProjectSpy } = await renderMediaFilters(MockLabels);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        expect(screen.getAllByRole('listitem')).toHaveLength(11);

        userEvent.type(input, '♣');
        fireEvent.click(screen.getByText('♣'));

        fireEvent.click(screen.getByLabelText('Close hierarchical label view'));

        expect(screen.queryByLabelText('Selected labels')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Select label' })).toHaveFocus();

        getProjectSpy.mockRestore();
    });

    it('shows no results', async () => {
        const { getProjectSpy } = await renderMediaFilters(MockLabels);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        expect(screen.getAllByRole('listitem')).toHaveLength(11);

        userEvent.type(input, 'An unknown label');

        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        expect(screen.getByText('No Results')).toBeInTheDocument();

        getProjectSpy.mockRestore();
    });

    it('can open and close a group of labels', async () => {
        const { getProjectSpy } = await renderMediaFilters(MockLabels);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        input.focus();
        fireEvent.focusOut(input);

        const first = screen.getAllByLabelText('Click to show child labels')[0];
        fireEvent.click(first);

        expect(screen.getAllByLabelText('Click to show child labels')).toHaveLength(2);
        expect(screen.getAllByLabelText('Click to hide child labels')).toHaveLength(1);

        fireEvent.click(first);

        expect(screen.queryAllByLabelText('Click to hide child labels')).toHaveLength(0);

        getProjectSpy.mockRestore();
    });
});
