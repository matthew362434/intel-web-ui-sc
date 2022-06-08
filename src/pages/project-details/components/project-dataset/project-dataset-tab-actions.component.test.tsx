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

import { Image, MediaItem, MEDIA_TYPE } from '../../../../core/media';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { MediaUploadProvider } from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { applicationRender as render, fireEvent, getById, onHoverTooltip, screen } from '../../../../test-utils';
import { getMockedImageMediaItem } from '../../../../test-utils/mocked-items-factory';
import { MediaProvider } from '../../../media/providers/';
import { MediaContextProps, useMedia } from '../../../media/providers/media-provider.component';
import { ProjectProvider } from '../../providers';
import {
    DatasetTapActions,
    NO_MEDIA_MESSAGE,
    NOT_FINISHED_EDITION_AND_NO_MEDIA_MESSAGE,
    NOT_FINISHED_EDITION_MESSAGE,
    ProjectDatasetTabActions,
} from './project-dataset-tab-actions.component';

jest.mock('../../../media/providers/media-provider.component', () => ({
    ...jest.requireActual('../../../media/providers/media-provider.component'),
    useMedia: jest.fn(() => ({
        media: [],
    })),
}));

const updateUseMedia = (result: MediaItem[]) => {
    const mocks: unknown = {
        media: result,
    };

    jest.mocked(useMedia).mockImplementation(() => mocks as MediaContextProps);

    return mocks as MediaContextProps;
};

describe('ProjectDatasetTabActions', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    const mediaService = createInMemoryMediaService();
    const mockExportNotificationState = {
        isOpen: false,
        open: jest.fn(),
        close: jest.fn(),
        toggle: jest.fn(),
    };
    const renderApp = async ({
        isAnomalyProject = true,
        onGoToAnnotator = jest.fn(),
        onDeleteAllMedia = jest.fn(),
        exportNotificationState = mockExportNotificationState,
        isInEdition = false,
    }) => {
        return await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <MediaUploadProvider mediaService={mediaService}>
                    <MediaProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                        <ProjectDatasetTabActions
                            isInEdition={isInEdition}
                            isAnomalyProject={isAnomalyProject}
                            onGoToAnnotator={onGoToAnnotator}
                            onDeleteAllMedia={onDeleteAllMedia}
                            exportNotificationState={exportNotificationState}
                        />
                    </MediaProvider>
                </MediaUploadProvider>
            </ProjectProvider>
        );
    };

    it('should render a button with "Explore" string if it is a single anomaly project', async () => {
        await renderApp({});

        expect(screen.queryByText('Explore')).toBeTruthy();
    });

    it('should render a button with "Annotate" string if it is NOT a single anomaly project', async () => {
        await renderApp({ isAnomalyProject: false });

        expect(screen.queryByText('Annotate')).toBeTruthy();
    });

    it('should not render the delete-all-media button if there is no media', async () => {
        updateUseMedia([]);

        const { container } = await renderApp({ isAnomalyProject: false });

        expect(getById(container, 'dataset-actions-delete-all-media')).toBeFalsy();
    });

    it('should render the delete-all-media button if there is media available', async () => {
        const mockMediaItems: Image[] = [
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-1' } }),
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-2' } }),
        ];

        updateUseMedia(mockMediaItems);

        const { container } = await renderApp({ isAnomalyProject: false });

        expect(getById(container, 'dataset-actions-delete-all-media')).toBeTruthy();
    });

    it('should trigger navigate to the annotator correctly', async () => {
        const mockOnGoToAnnotator = jest.fn();

        await renderApp({ isAnomalyProject: false, onGoToAnnotator: mockOnGoToAnnotator });

        expect(screen.queryByText('Annotate')).toBeTruthy();

        fireEvent.click(screen.getByText('Annotate'));

        expect(mockOnGoToAnnotator).toHaveBeenCalledTimes(1);
    });

    it('should trigger "deleteAll" callback correctly upon click', async () => {
        const mockDeleteAllMedia = jest.fn();
        const mockMediaItems: Image[] = [
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-1' } }),
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-2' } }),
        ];

        updateUseMedia(mockMediaItems);

        await renderApp({ isAnomalyProject: false, onDeleteAllMedia: mockDeleteAllMedia });

        expect(screen.getByLabelText('open menu')).toBeTruthy();

        // Trigger menu popover
        fireEvent.click(screen.getByLabelText('open menu'));

        // Press "delete all media" option to trigger dialog
        fireEvent.click(screen.getByText(DatasetTapActions.DeleteAllMedia));

        // Press "confirm" button on the dialog
        fireEvent.click(screen.getByText('Confirm'));

        expect(mockDeleteAllMedia).toHaveBeenCalledTimes(1);
    });

    it('should open/close export dataset dialog', async () => {
        await renderApp({ isAnomalyProject: false });

        expect(screen.getByLabelText('open menu')).toBeTruthy();

        // Trigger menu popover
        fireEvent.click(screen.getByLabelText('open menu'));

        // Press "Export dataset" option to trigger dialog
        fireEvent.click(screen.getByText(DatasetTapActions.ExportDataset));

        expect(screen.queryByText('Select the export format')).toBeInTheDocument();
    });

    it('Annotate button should be disabled while labels edition', async () => {
        const mockMediaItems: Image[] = [
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-1' } }),
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-2' } }),
        ];

        updateUseMedia(mockMediaItems);

        await renderApp({ isAnomalyProject: false, isInEdition: true });
        const annotateButton = screen.getByRole('button', { name: 'Annotate' });
        onHoverTooltip(annotateButton);
        expect(screen.getByRole('tooltip')).toHaveTextContent(NOT_FINISHED_EDITION_MESSAGE);

        expect(annotateButton).toBeDisabled();
    });

    it('Annotate button should be enabled when labels are not in edition and there are some media items', async () => {
        const mockMediaItems: Image[] = [
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-1' } }),
            getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'id-2' } }),
        ];

        updateUseMedia(mockMediaItems);

        await renderApp({ isAnomalyProject: false, isInEdition: false });

        expect(screen.getByRole('button', { name: 'Annotate' })).not.toBeDisabled();
    });

    it('Annotate button should be disabled when there is no media items', async () => {
        updateUseMedia([]);

        await renderApp({ isAnomalyProject: false, isInEdition: false });

        const annotateButton = screen.getByRole('button', { name: 'Annotate' });
        onHoverTooltip(annotateButton);
        expect(screen.getByRole('tooltip')).toHaveTextContent(NO_MEDIA_MESSAGE);

        expect(annotateButton).toBeDisabled();
    });

    it('Annotate button should be disabled when there is no media items and it is in edition mode', async () => {
        updateUseMedia([]);

        await renderApp({ isAnomalyProject: false, isInEdition: true });

        const annotateButton = screen.getByRole('button', { name: 'Annotate' });
        onHoverTooltip(annotateButton);
        expect(screen.getByRole('tooltip')).toHaveTextContent(NOT_FINISHED_EDITION_AND_NO_MEDIA_MESSAGE);

        expect(annotateButton).toBeDisabled();
    });
});
