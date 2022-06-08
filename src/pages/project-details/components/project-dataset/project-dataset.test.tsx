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

import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { createInMemoryMediaService } from '../../../../core/media/services';
import { MediaUploadProvider } from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { applicationRender as render, getById } from '../../../../test-utils';
import { ProjectProvider } from '../../providers';
import { ProjectDataset } from './project-dataset.component';

const mediaService = createInMemoryMediaService();

describe('Project dataset', () => {
    let elementContainer: HTMLElement;

    beforeEach(async () => {
        const { container } = await render(
            <ProjectProvider projectIdentifier={{ projectId: '123', workspaceId: 'test-workspace' }}>
                <DndProvider backend={HTML5Backend}>
                    <MediaUploadProvider mediaService={mediaService}>
                        <ProjectDataset mediaService={mediaService} />
                    </MediaUploadProvider>
                </DndProvider>
            </ProjectProvider>
        );
        elementContainer = container;
    });

    it('should has one main tab: "Dataset"', () => {
        expect(screen.getByRole('tab', { name: 'Dataset' })).toBeInTheDocument();
    });

    it('should has 3 sub tabs: "Media", "Labels", "Statistics"', () => {
        expect(screen.getByRole('tab', { name: 'Media' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Labels' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Statistics' })).toBeInTheDocument();
    });

    it('should render media content component on "Media" tab click', async () => {
        const mediaTab = screen.getByRole('tab', { name: 'Media' });
        await mediaTab.click();
        expect(getById(elementContainer, 'media-content-id')).toBeInTheDocument();
    });

    it('should render labels management component on "Labels" tab click', async () => {
        const labelsTab = screen.getByRole('tab', { name: 'Labels' });
        userEvent.click(labelsTab);
        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
        expect(getById(elementContainer, 'labels-management-id')).toBeInTheDocument();
    });

    it('should render project annotations statistics component on "Statistics" tab click', async () => {
        const statisticsTab = screen.getByRole('tab', { name: 'Statistics' });
        userEvent.click(statisticsTab);
        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
        expect(getById(elementContainer, 'project-annotations-statistics-id')).toBeInTheDocument();
    });
});
