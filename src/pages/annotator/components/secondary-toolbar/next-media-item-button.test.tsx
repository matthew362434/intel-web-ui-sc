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

import { MEDIA_TYPE } from '../../../../core/media';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { getMockedImageMediaItem } from '../../../../test-utils/mocked-items-factory';
import { DatasetProvider } from '../../providers/dataset-provider/dataset-provider.component';
import { fireEvent, screen, applicationRender as render } from './../../../../test-utils';
import { NextMediaItemButton } from './next-media-item-button.component';

jest.mock('../../providers/annotation-tool-provider/annotation-tool-provider.component', () => ({
    useAnnotationToolContext: jest.fn(),
}));

jest.mock('../../providers/task-chain-provider/task-chain-provider.component', () => ({
    useTaskChain: jest.fn(() => ({
        inputs: [],
    })),
}));

jest.mock('../../providers/task-provider/task-provider.component', () => ({
    useTask: jest.fn(() => ({
        selectedTask: null,
    })),
}));

const datasetIdentifier = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    datasetId: 'dataset-id',
};

describe('Next media item button', () => {
    it('Selects the next media item from the dataset', async () => {
        const items = [
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-1', type: MEDIA_TYPE.IMAGE } }),
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-2', type: MEDIA_TYPE.IMAGE } }),
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-3', type: MEDIA_TYPE.IMAGE } }),
        ];
        const mediaItem = items[1];
        const mediaService = createInMemoryMediaService(items);

        const selectMediaItem = jest.fn();

        await render(
            <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                <NextMediaItemButton selectMediaItem={selectMediaItem} selectedMediaItem={mediaItem} />
            </DatasetProvider>
        );

        const btn = screen.getByRole('button');
        expect(btn).not.toBeDisabled();
        fireEvent.click(btn);

        expect(selectMediaItem).toHaveBeenCalledWith(items[2]);
    });

    it('Is disabled when there is no next media item', async () => {
        const items = [
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-1', type: MEDIA_TYPE.IMAGE } }),
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-2', type: MEDIA_TYPE.IMAGE } }),
            getMockedImageMediaItem({ identifier: { imageId: 'test-image-3', type: MEDIA_TYPE.IMAGE } }),
        ];
        const mediaItem = items[2];
        const mediaService = createInMemoryMediaService(items);

        await render(
            <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                <NextMediaItemButton selectMediaItem={jest.fn()} selectedMediaItem={mediaItem} />
            </DatasetProvider>
        );

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
