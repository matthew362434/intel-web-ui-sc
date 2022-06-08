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
import { screen } from '@testing-library/react';

import { createInMemoryMediaService } from '../../../../core/media/services';
import { MediaUploadProvider } from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { applicationRender as render } from '../../../../test-utils';
import { getMockedImageMediaItem } from '../../../../test-utils/mocked-items-factory';
import { MediaProvider } from '../../../media/providers';
import { MediaContextProps, useMedia } from '../../../media/providers/media-provider.component';
import { ProjectMediaControlPanel } from './project-media-control-panel.component';

jest.mock('../../../media/providers/media-provider.component', () => ({
    ...jest.requireActual('../../../media/providers/media-provider.component'),
    useMedia: jest.fn(() => ({
        media: [],
        mediaSelection: [],
        isMediaFilterEmpty: true,
        sortingOptions: {},
        mediaFilterOptions: {
            condition: 'or',
            rules: [],
        },
    })),
}));

describe('ProjectMediaControlPanel', () => {
    const mediaService = createInMemoryMediaService();

    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    const mediaProps = {
        media: [],
        mediaSelection: [],
        mediaFilterOptions: {
            condition: 'or',
            rules: [],
        },
        sortingOptions: { sortBy: undefined },
        isMediaFilterEmpty: true,
    };

    const renderApp = async () => {
        await render(
            <MediaUploadProvider mediaService={mediaService}>
                <MediaProvider mediaService={mediaService} datasetIdentifier={datasetIdentifier}>
                    <ProjectMediaControlPanel uploadMediaCallback={jest.fn} header={'Test'} />
                </MediaProvider>
            </MediaUploadProvider>
        );
    };

    it('Select all checkbox and delete button should not be visible when there are no media items', async () => {
        jest.mocked(useMedia).mockImplementationOnce(() => mediaProps as unknown as MediaContextProps);

        await renderApp();

        expect(screen.queryByRole('checkbox', { name: /select all media/i })).not.toBeInTheDocument();
        expect(screen.queryByTestId('delete-media-id')).not.toBeInTheDocument();
    });

    it('Select all checkbox and delete button are visible when media items are available', async () => {
        jest.mocked(useMedia).mockImplementationOnce(
            () => ({ ...mediaProps, media: [getMockedImageMediaItem({})] } as unknown as MediaContextProps)
        );

        await renderApp();

        expect(screen.getByRole('checkbox', { name: /select all media/i })).toBeInTheDocument();
        expect(screen.getByTestId('delete-media-id')).toBeInTheDocument();
    });
});
