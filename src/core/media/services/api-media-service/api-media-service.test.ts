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

import { rest } from 'msw';

import { server } from '../../../annotations/services/test-utils';
import { API_URLS } from '../../../services';
import { MEDIA_TYPE } from '../../base-media.interface';
import { MEDIA_ANNOTATION_STATUS } from '../../base.interface';
import { ImageIdentifier } from '../../image.interface';
import { VideoFrameIdentifier, VideoIdentifier } from '../../video.interface';
import { createApiMediaService } from './api-media-service';

const task_id = '6525fabec389293789c214ab';

function apiRequestUrl(url: string): string {
    const urlRecord = new URL(`http://localhost${url}`);
    urlRecord.search = '';

    return urlRecord.href;
}

const mediaResponse = () => {
    const media = [
        {
            id: '60b609ead036ba4566726c84',
            media_information: {
                display_url: '/v2/projects/60b609e0d036ba4566726c7f/media/images/60b609ead036ba4566726c84/display/full',
                height: 800,
                width: 600,
            },
            name: 'IMG_20201020_111432',
            state: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
            thumbnail: '/v2/projects/60b609e0d036ba4566726c7f/media/images/60b609ead036ba4566726c84/display/thumb',
            type: 'image',
            upload_time: '2021-06-01T10:20:26.411000+00:00',
            annotation_state_per_task: [
                {
                    task_id,
                    state: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
                },
            ],
        },
        {
            id: '60b60a5ad036ba4566726cd7',
            media_information: {
                display_url:
                    '/v2/projects/60b609e0d036ba4566726c7f/media/videos/60b60a5ad036ba4566726cd7/display/stream',
                duration: 95,
                frame_count: 5700,
                frame_stride: 60,
                height: 1920,
                width: 1080,
            },
            name: 'VID_20210209_160431',
            state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
            thumbnail: '/v2/projects/60b609e0d036ba4566726c7f/media/videos/60b60a5ad036ba4566726cd7/display/thumb',
            type: 'video',
            upload_time: '2021-06-01T10:22:18.204000+00:00',
            annotation_state_per_task: [
                {
                    task_id,
                    state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                },
            ],
        },
    ];

    return {
        media,
        next_page:
            // eslint-disable-next-line max-len
            '/api/v1.0/workspaces/workspace-id/projects/project-id/datasets/dataset-id/media?top=10&skiptoken=60b609ead036ba4566726c8d',
    };
};

const activeMediaResponse = () => {
    return {
        /* eslint-disable max-len */
        active_set: [
            {
                active_frames: [
                    {
                        id: 3360,
                        media_information: {
                            display_url:
                                '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/frames/3360/display/full',
                            height: 1920,
                            width: 1080,
                        },
                        name: 'VID_20210209_160431_f3360',
                        state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                        annotation_state_per_task: [
                            {
                                task_id,
                                state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                            },
                        ],
                        thumbnail:
                            '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/frames/3360/display/thumb',
                    },
                    {
                        id: 3300,
                        media_information: {
                            display_url:
                                '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/frames/3300/display/full',
                            height: 1920,
                            width: 1080,
                        },
                        name: 'VID_20210209_160431_f3300',
                        state: MEDIA_ANNOTATION_STATUS.NONE,
                        annotation_state_per_task: [
                            {
                                task_id,
                                state: MEDIA_ANNOTATION_STATUS.NONE,
                            },
                        ],
                        thumbnail:
                            '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/frames/3300/display/thumb',
                    },
                ],
                id: '6103b96e2360313e324963f2',
                media_information: {
                    display_url:
                        '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/display/stream',
                    duration: 95,
                    frame_count: 5700,
                    frame_stride: 60,
                    height: 1920,
                    width: 1080,
                },
                annotation_state_per_task: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.NONE,
                    },
                ],
                name: 'VID_20210209_160431',
                state: MEDIA_ANNOTATION_STATUS.NONE,
                thumbnail:
                    '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/videos/6103b96e2360313e324963f2/display/thumb',
                type: 'video',
                upload_time: '2021-07-30T08:33:50.399000+00:00',
            },
            {
                id: '61039cccbd1cde3821dcfcb2',
                media_information: {
                    display_url:
                        '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/images/61039cccbd1cde3821dcfcb2/display/full ',
                    height: 1599,
                    width: 899,
                },
                annotation_state_per_task: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.NONE,
                    },
                ],
                name: 'IMG_20201020_111432',
                state: MEDIA_ANNOTATION_STATUS.NONE,
                thumbnail:
                    '/api/v1.0/workspaces/61039c80bd1cde3821dcfca6/projects/61039c81bd1cde3821dcfcad/datasets/dummy/media/images/61039cccbd1cde3821dcfcb2/display/thumb',
                type: 'image',
                upload_time: '2021-07-30T06:31:40.817000+00:00',
            },
        ],
    };
    /* eslint-enable max-len */
};

describe('API media service', () => {
    const searchMediaOptions = {};
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };
    let mediaUrl = API_URLS.MEDIA(
        datasetIdentifier.workspaceId,
        datasetIdentifier.projectId,
        datasetIdentifier.datasetId,
        20,
        searchMediaOptions
    );
    const mediaService = createApiMediaService();

    it('return correctly with nextPage "undefined" if not provided by the api', async () => {
        const response = { ...mediaResponse(), next_page: undefined };

        server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(response))));

        const { media, nextPage } = await mediaService.getMedia(datasetIdentifier, 20, null, searchMediaOptions);

        const imageIdentifier: ImageIdentifier = {
            type: MEDIA_TYPE.IMAGE as const,
            imageId: '60b609ead036ba4566726c84',
        };
        const videoIdentifier: VideoIdentifier = {
            type: MEDIA_TYPE.VIDEO as const,
            videoId: '60b60a5ad036ba4566726cd7',
        };

        expect(nextPage).toEqual(undefined);
        expect(media).toEqual([
            {
                identifier: imageIdentifier,
                name: 'IMG_20201020_111432',
                src: API_URLS.MEDIA_ITEM_SRC(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    imageIdentifier
                ),
                thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    imageIdentifier
                ),
                annotationStatePerTask: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
                    },
                ],
                status: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
                metadata: {
                    height: 800,
                    width: 600,
                },
            },
            {
                identifier: videoIdentifier,
                name: 'VID_20210209_160431',
                src: API_URLS.MEDIA_ITEM_STREAM(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    videoIdentifier
                ),
                thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    videoIdentifier
                ),
                annotationStatePerTask: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                    },
                ],
                status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                metadata: {
                    height: 1920,
                    width: 1080,
                    fps: 60,
                    duration: 95,
                    frames: 5700,
                    frameStride: 60,
                },
            },
        ]);
    });

    it('gets media items', async () => {
        server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(mediaResponse()))));

        const { media } = await mediaService.getMedia(datasetIdentifier, 20, null, searchMediaOptions);

        const imageIdentifier: ImageIdentifier = {
            type: MEDIA_TYPE.IMAGE as const,
            imageId: '60b609ead036ba4566726c84',
        };
        const videoIdentifier: VideoIdentifier = {
            type: MEDIA_TYPE.VIDEO as const,
            videoId: '60b60a5ad036ba4566726cd7',
        };

        expect(media).toEqual([
            {
                identifier: imageIdentifier,
                name: 'IMG_20201020_111432',
                src: API_URLS.MEDIA_ITEM_SRC(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    imageIdentifier
                ),
                thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    imageIdentifier
                ),
                annotationStatePerTask: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
                    },
                ],
                status: MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED,
                metadata: {
                    height: 800,
                    width: 600,
                },
            },
            {
                identifier: videoIdentifier,
                name: 'VID_20210209_160431',
                src: API_URLS.MEDIA_ITEM_STREAM(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    videoIdentifier
                ),
                thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    videoIdentifier
                ),
                annotationStatePerTask: [
                    {
                        task_id,
                        state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                    },
                ],
                status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                metadata: {
                    height: 1920,
                    width: 1080,
                    fps: 60,
                    duration: 95,
                    frames: 5700,
                    frameStride: 60,
                },
            },
        ]);
    });

    it('strips off the api prefix from nextPage', async () => {
        server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(mediaResponse()))));

        const { nextPage } = await mediaService.getMedia(datasetIdentifier, 20, null, searchMediaOptions);

        // Since our axias instance uses a baseUrl of `/api` we want to strip off the prefix returned by the server
        expect(nextPage).toEqual(
            // eslint-disable-next-line max-len
            '/v1.0/workspaces/workspace-id/projects/project-id/datasets/dataset-id/media?top=10&skiptoken=60b609ead036ba4566726c8d'
        );

        const { media } = await mediaService.getMedia(datasetIdentifier, 20, nextPage, searchMediaOptions);
        expect(media).toHaveLength(2);
    });

    it('gets a single media item', async () => {
        const response = {
            id: '60b609ead036ba4566726c84',
            media_information: {
                display_url: '/v2/projects/60b609e0d036ba4566726c7f/media/images/60b609ead036ba4566726c84/display/full',
                height: 800,
                width: 600,
            },
            annotation_state_per_task: [],
            name: 'IMG_20201020_111432',
            state: MEDIA_ANNOTATION_STATUS.NONE,
            thumbnail: '/v2/projects/60b609e0d036ba4566726c7f/media/images/60b609ead036ba4566726c84/display/thumb',
            type: 'image',
            upload_time: '2021-06-01T10:20:26.411000+00:00',
        };

        const mediaIdentifier = { type: MEDIA_TYPE.IMAGE, imageId: '60b609ead036ba4566726c84' } as const;
        mediaUrl = API_URLS.MEDIA_ITEM(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            mediaIdentifier
        );
        server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(response))));

        const mediaItem = await mediaService.getMediaItem(datasetIdentifier, mediaIdentifier);

        expect(mediaItem).toEqual({
            identifier: mediaIdentifier,
            name: 'IMG_20201020_111432',
            src: API_URLS.MEDIA_ITEM_SRC(
                datasetIdentifier.workspaceId,
                datasetIdentifier.projectId,
                datasetIdentifier.datasetId,
                mediaIdentifier
            ),
            thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                datasetIdentifier.workspaceId,
                datasetIdentifier.projectId,
                datasetIdentifier.datasetId,
                mediaIdentifier
            ),
            annotationStatePerTask: [],
            metadata: {
                height: 800,
                width: 600,
            },
            status: MEDIA_ANNOTATION_STATUS.NONE,
        });
    });

    it('gets a single video frame', async () => {
        /* eslint-disable max-len */
        const response = {
            id: '610b8d0e667b9b8a6641eb79',
            media_information: {
                display_url:
                    '/api/v1.0/workspaces/610aacd9667b9b8a6641e9e2/projects/610aacd9667b9b8a6641e9fa/datasets/dummy/media/videos/610b8d0e667b9b8a6641eb79/display/stream',
                duration: 95,
                frame_count: 5700,
                frame_stride: 60,
                height: 1920,
                width: 1080,
            },
            annotation_state_per_task: [
                {
                    task_id,
                    state: MEDIA_ANNOTATION_STATUS.NONE,
                },
            ],
            name: 'VID_20210209_160431',
            state: MEDIA_ANNOTATION_STATUS.NONE,
            thumbnail:
                '/api/v1.0/workspaces/610aacd9667b9b8a6641e9e2/projects/610aacd9667b9b8a6641e9fa/datasets/dummy/media/videos/610b8d0e667b9b8a6641eb79/display/thumb',
            type: 'video',
            upload_time: '2021-08-05T07:02:38.182000+00:00',
        };
        /* eslint-enable max-len */

        const mediaIdentifier = {
            type: MEDIA_TYPE.VIDEO_FRAME,
            videoId: '610b8d0e667b9b8a6641eb79',
            frameNumber: 0,
        } as const;
        const videoIdentifier = {
            type: MEDIA_TYPE.VIDEO,
            videoId: '610b8d0e667b9b8a6641eb79',
        } as const;
        mediaUrl = API_URLS.MEDIA_ITEM(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            videoIdentifier
        );
        server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(response))));

        const mediaItem = await mediaService.getMediaItem(datasetIdentifier, mediaIdentifier);

        expect(mediaItem).toEqual({
            identifier: mediaIdentifier,
            name: 'VID_20210209_160431',
            src: API_URLS.MEDIA_ITEM_SRC(
                datasetIdentifier.workspaceId,
                datasetIdentifier.projectId,
                datasetIdentifier.datasetId,
                mediaIdentifier
            ),
            thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                datasetIdentifier.workspaceId,
                datasetIdentifier.projectId,
                datasetIdentifier.datasetId,
                videoIdentifier
            ),
            annotationStatePerTask: [
                {
                    task_id,
                    state: MEDIA_ANNOTATION_STATUS.NONE,
                },
            ],
            metadata: {
                height: 1920,
                width: 1080,
                duration: 95,
                frameStride: 60,
                fps: 60,
                frames: 5700,
            },
            status: 'none',
        });
    });

    describe('active dataset', () => {
        const newDatasetIdentifier = {
            workspaceId: '61039c80bd1cde3821dcfca6',
            projectId: '61039c81bd1cde3821dcfcad',
            datasetId: 'dummy',
        };

        it('returns an empty array if the endpoint return 204', async () => {
            mediaUrl = API_URLS.ACTIVE_MEDIA(newDatasetIdentifier.workspaceId, newDatasetIdentifier.projectId, 20);

            server.use(rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.status(204))));

            const { media } = await mediaService.getActiveMedia(newDatasetIdentifier, 20);

            expect(media).toEqual([]);
        });

        it('gets active media items and sorts video frames by framenumber', async () => {
            mediaUrl = API_URLS.ACTIVE_MEDIA(newDatasetIdentifier.workspaceId, newDatasetIdentifier.projectId, 20);

            server.use(
                rest.get(apiRequestUrl(`/api/${mediaUrl}`), (req, res, ctx) => res(ctx.json(activeMediaResponse())))
            );

            const { media } = await mediaService.getActiveMedia(newDatasetIdentifier, 20);

            expect(media).toHaveLength(3);

            const imageIdentifier: ImageIdentifier = {
                type: MEDIA_TYPE.IMAGE as const,
                imageId: '61039cccbd1cde3821dcfcb2',
            };
            const firstVideoFrameIdentifier: VideoFrameIdentifier = {
                type: MEDIA_TYPE.VIDEO_FRAME as const,
                videoId: '6103b96e2360313e324963f2',
                frameNumber: 3360,
            };

            const secondVideoFrameIdentifier: VideoFrameIdentifier = {
                type: MEDIA_TYPE.VIDEO_FRAME as const,
                videoId: '6103b96e2360313e324963f2',
                frameNumber: 3300,
            };

            expect(media).toEqual([
                {
                    identifier: secondVideoFrameIdentifier,
                    name: 'VID_20210209_160431_f3300',
                    src: API_URLS.MEDIA_ITEM_SRC(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        secondVideoFrameIdentifier
                    ),
                    thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        secondVideoFrameIdentifier
                    ),
                    annotationStatePerTask: [
                        {
                            task_id,
                            state: MEDIA_ANNOTATION_STATUS.NONE,
                        },
                    ],
                    status: MEDIA_ANNOTATION_STATUS.NONE,
                    metadata: {
                        height: 1920,
                        width: 1080,
                        fps: 60,
                        duration: 95,
                        frames: 5700,
                        frameStride: 60,
                    },
                },
                {
                    identifier: firstVideoFrameIdentifier,
                    name: 'VID_20210209_160431_f3360',
                    src: API_URLS.MEDIA_ITEM_SRC(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        firstVideoFrameIdentifier
                    ),
                    thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        firstVideoFrameIdentifier
                    ),
                    annotationStatePerTask: [
                        {
                            task_id,
                            state: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                        },
                    ],
                    status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
                    metadata: {
                        height: 1920,
                        width: 1080,
                        fps: 60,
                        duration: 95,
                        frames: 5700,
                        frameStride: 60,
                    },
                },
                {
                    identifier: imageIdentifier,
                    name: 'IMG_20201020_111432',
                    src: API_URLS.MEDIA_ITEM_SRC(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        imageIdentifier
                    ),
                    thumbnailSrc: API_URLS.MEDIA_ITEM_THUMBNAIL(
                        newDatasetIdentifier.workspaceId,
                        newDatasetIdentifier.projectId,
                        newDatasetIdentifier.datasetId,
                        imageIdentifier
                    ),
                    annotationStatePerTask: [
                        {
                            task_id,
                            state: MEDIA_ANNOTATION_STATUS.NONE,
                        },
                    ],
                    status: MEDIA_ANNOTATION_STATUS.NONE,
                    metadata: {
                        height: 1599,
                        width: 899,
                    },
                },
            ]);
        });
    });
});
