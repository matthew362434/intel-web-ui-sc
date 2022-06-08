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

import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

import { MediaItem, MEDIA_TYPE } from '../../../core/media';
import { createInMemoryMediaService } from '../../../core/media/services';
import { MediaService } from '../../../core/media/services/media-service.interface';
import {
    getMockedImageMediaItem,
    getMockedVideoFrameMediaItem,
    getMockedVideoMediaItem,
} from '../../../test-utils/mocked-items-factory';
import { useVideoPlayerContext } from '../components/video-player/video-player-provider.component';
import { DatasetProvider } from '../providers/dataset-provider/dataset-provider.component';
import { useNextMediaItem, findIndex } from './use-next-media-item.hook';

jest.mock('../providers/task-provider/task-provider.component', () => ({
    useTask: jest.fn(() => ({
        selectedTask: null,
    })),
}));

jest.mock('../providers/task-chain-provider/task-chain-provider.component', () => ({
    useTaskChain: jest.fn(() => ({
        inputs: [],
    })),
}));

const datasetIdentifier = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    datasetId: 'dataset-id',
};

const getMockedMediaItem = (index = 0): MediaItem => {
    return getMockedImageMediaItem({ identifier: { type: MEDIA_TYPE.IMAGE, imageId: `${index}` } });
};

const Providers = ({ children, mediaService }: { children: ReactNode; mediaService: MediaService }) => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                {children}
            </DatasetProvider>
        </QueryClientProvider>
    );
};

jest.mock('../components/video-player/video-player-provider.component');

describe('useNextMediaItem', () => {
    it('Returns the next media item based on the given filter', async () => {
        const items = [getMockedMediaItem(0), getMockedMediaItem(1), getMockedMediaItem(2), getMockedMediaItem(3)];
        const mediaService = createInMemoryMediaService(items);

        const mediaItem = getMockedImageMediaItem({});
        const filter = jest.fn((_, mediaItems) => {
            return { type: 'media' as const, media: mediaItems[0] };
        });

        const wrapper = ({ children }: { children: ReactNode }) => (
            <Providers mediaService={mediaService}>{children}</Providers>
        );
        const { result, waitFor } = renderHook(() => useNextMediaItem(mediaItem, filter), { wrapper });

        await waitFor(() => {
            expect(filter).toBeCalledWith(mediaItem, items);
        });

        expect(result.current).toEqual({ type: 'media', media: items[0] });
    });

    describe('Selecting next video frame', () => {
        it('Selects the next media item based on the available video frames', async () => {
            const items = [
                getMockedMediaItem(0),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 0, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 60, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 120, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedMediaItem(1),
                getMockedMediaItem(2),
                getMockedMediaItem(3),
            ];

            const videoFrames = [items[1], items[2], items[3]];
            (useVideoPlayerContext as jest.Mock).mockImplementation(() => {
                return { videoFrames };
            });

            const mediaService = createInMemoryMediaService(items);

            const mediaItem = items[1];
            const filter = jest.fn((_, mediaItems) => {
                return { type: 'media' as const, media: mediaItems[1] };
            });

            const wrapper = ({ children }: { children: ReactNode }) => (
                <Providers mediaService={mediaService}>{children}</Providers>
            );
            const { result, waitFor } = renderHook(() => useNextMediaItem(mediaItem, filter), { wrapper });

            await waitFor(() => {
                expect(filter).toBeCalledWith(mediaItem, videoFrames);
            });

            expect(result.current).toEqual({ type: 'media', media: items[2] });
        });

        it('Selects media items from the dataset when it cannot find video frames', async () => {
            const items = [
                getMockedMediaItem(0),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 0, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 60, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedVideoFrameMediaItem({
                    identifier: { videoId: 'test-video', frameNumber: 120, type: MEDIA_TYPE.VIDEO_FRAME },
                }),
                getMockedMediaItem(1),
                getMockedMediaItem(2),
                getMockedMediaItem(3),
            ];

            const videoFrames = [items[1], items[2], items[3]];
            (useVideoPlayerContext as jest.Mock).mockImplementation(() => {
                return { videoFrames };
            });

            const mediaService = createInMemoryMediaService(items);

            const mediaItem = items[1];

            const filter = jest.fn((_, mediaItems: MediaItem[]) => {
                const media = mediaItems.find(({ identifier }) => identifier.type === MEDIA_TYPE.IMAGE);

                return media === undefined ? undefined : { type: 'media' as const, media };
            });

            const wrapper = ({ children }: { children: ReactNode }) => (
                <Providers mediaService={mediaService}>{children}</Providers>
            );
            const { result, waitFor } = renderHook(() => useNextMediaItem(mediaItem, filter), { wrapper });

            await waitFor(() => {
                expect(filter).toBeCalledWith(mediaItem, videoFrames);
            });

            await waitFor(() => {
                // Note we expect the filter to be called with the current media item, but without
                // its associated video frames
                expect(filter).toBeCalledWith(mediaItem, [items[0], mediaItem, items[4], items[5], items[6]]);
            });

            expect(result.current).toEqual({ type: 'media', media: items[0] });
        });
    });
});

describe('findIndex', () => {
    it('finds the index of a media item inside of set', () => {
        const items = [
            getMockedImageMediaItem({ identifier: { imageId: 'test-image', type: MEDIA_TYPE.IMAGE } }),
            getMockedVideoFrameMediaItem({
                identifier: { videoId: 'test-video', frameNumber: 0, type: MEDIA_TYPE.VIDEO_FRAME },
            }),
            getMockedVideoFrameMediaItem({
                identifier: { videoId: 'test-video', frameNumber: 60, type: MEDIA_TYPE.VIDEO_FRAME },
            }),
            getMockedVideoFrameMediaItem({
                identifier: { videoId: 'test-video', frameNumber: 120, type: MEDIA_TYPE.VIDEO_FRAME },
            }),
        ];

        expect(findIndex(items[2], items)).toEqual(2);
    });

    it("finds the index of a videoFrame's video inside of set", () => {
        const mediaItem = getMockedVideoFrameMediaItem({
            identifier: { videoId: 'test-video', frameNumber: 0, type: MEDIA_TYPE.VIDEO_FRAME },
        });

        const items = [
            getMockedImageMediaItem({ identifier: { imageId: 'test-image', type: MEDIA_TYPE.IMAGE } }),
            getMockedVideoMediaItem({
                identifier: { videoId: 'test-video', type: MEDIA_TYPE.VIDEO },
            }),
        ];

        expect(findIndex(mediaItem, items)).toEqual(1);
    });
});
