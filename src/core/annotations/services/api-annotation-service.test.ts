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

import { createApiAnnotationService } from '.';
import {
    getMockedImageMediaItem,
    getMockedLabel,
    getMockedVideoMediaItem,
} from '../../../test-utils/mocked-items-factory';
import { LABEL_BEHAVIOUR } from '../../labels';
import { MediaItem, MEDIA_TYPE } from '../../media';
import { API_URLS } from '../../services';
import { SHAPE_TYPE_DTO } from '../dtos';
import { ShapeType } from '../shapetype.enum';
import { labelFromUser } from '../utils';
import { imageAnnotationsResponse, videoAnnotationsResponse } from './mockResponses';
import { server } from './test-utils';
import { getAnnotatedVideoLabels } from './utils';

const PROJECT_LABELS = [
    getMockedLabel({ id: '60b609e0d036ba4566726c82', name: 'card', color: '#fff5f7ff' }),

    getMockedLabel({
        id: '60b6153817057389ba93f42e',
        name: 'card',
        color: '#3f00ffff',
        group: '',
        parentLabelId: null,
        hotkey: '',
        behaviour: LABEL_BEHAVIOUR.LOCAL,
    }),
];

describe('API annotation service', () => {
    const media: MediaItem = getMockedImageMediaItem({
        identifier: {
            imageId: '60b609fbd036ba4566726c96',
            type: MEDIA_TYPE.IMAGE,
        },
    });

    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    it('denormalizes annotations and retrieves their labels', async () => {
        const annotationUrl = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            media.identifier
        );

        server.use(
            rest.get(`/api/${annotationUrl}`, (req, res, ctx) => {
                return res(ctx.json(imageAnnotationsResponse()));
            })
        );

        const annotationService = createApiAnnotationService();
        const annotations = await annotationService.getAnnotations(datasetIdentifier, PROJECT_LABELS, media);

        const expectedLabel = { ...labelFromUser(PROJECT_LABELS[1], 'N/A'), score: 1.0 };

        expect(annotations).toHaveLength(3);
        expect(annotations[0]).toEqual({
            id: 'd69b4403-4f4c-4e66-936e-b8565dd1a8a1',
            isHidden: false,
            isHovered: false,
            isSelected: false,
            isLocked: false,
            labels: [expectedLabel],
            shape: { shapeType: ShapeType.Rect, x: 65, y: 31, width: 19, height: 16 },
            zIndex: 0,
        });
        expect(annotations[1]).toEqual({
            id: '54af0335-5074-4024-a9dc-f04417ab1b1c',
            isHidden: false,
            isHovered: false,
            isSelected: false,
            isLocked: false,
            labels: [expectedLabel],
            shape: { shapeType: ShapeType.Circle, x: 34.5, y: 18.5, r: 15.5 },
            zIndex: 1,
        });
        expect(annotations[2]).toEqual({
            id: 'ccfb81c6-a162-4f8f-b1c2-f97f51b0949d',
            isHidden: false,
            isHovered: false,
            isSelected: false,
            isLocked: false,
            labels: [expectedLabel],
            shape: {
                shapeType: ShapeType.Polygon,
                points: [
                    { x: 20, y: 20 },
                    { x: 40, y: 20 },
                    { x: 30, y: 30 },
                ],
            },
            zIndex: 2,
        });
    });

    it('retrieves video timeline annotations correctly', async () => {
        const videoMediaItem: MediaItem = getMockedVideoMediaItem({
            identifier: {
                videoId: '60b609fbd036ba4566726c96',
                type: MEDIA_TYPE.VIDEO,
            },
            metadata: {
                height: 100,
                width: 100,
                fps: 30,
                duration: 60,
                frames: 10,
                frameStride: 60,
            },
        });
        const annotationUrl = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            videoMediaItem.identifier
        );

        server.use(
            rest.get(`/api/${annotationUrl}`, (req, res, ctx) => {
                return res(ctx.json(videoAnnotationsResponse()));
            })
        );

        const annotationService = createApiAnnotationService();
        const annotations = await annotationService.getVideoAnnotationsTimeline(datasetIdentifier, videoMediaItem);

        const expectedResponse = getAnnotatedVideoLabels([
            {
                annotations: [
                    {
                        id: 'd69b4403-4f4c-4e66-936e-b8565dd1a8a1',
                        labels: [
                            {
                                color: '#3f00ffff',
                                id: '60b6153817057389ba93f42e',
                                name: 'card',
                                probability: 1.0,
                                source: { id: 'N/A', type: 'N/A' },
                                hotkey: '',
                            },
                        ],
                        shape: {
                            height: 0.16,
                            type: SHAPE_TYPE_DTO.RECTANGLE,
                            width: 0.19,
                            x: 0.65,
                            y: 0.31,
                        },
                        labels_to_revisit: [],
                    },
                    {
                        id: '54af0335-5074-4024-a9dc-f04417ab1b1c',
                        labels: [
                            {
                                color: '#3f00ffff',
                                id: '60b6153817057389ba93f42e',
                                name: 'card',
                                probability: 1.0,
                                source: { id: 'N/A', type: 'N/A' },
                                hotkey: '',
                            },
                        ],
                        shape: {
                            height: 0.17,
                            type: SHAPE_TYPE_DTO.ELLIPSE,
                            width: 0.31,
                            x: 0.19,
                            y: 0.1,
                        },
                        labels_to_revisit: [],
                    },
                    {
                        id: 'ccfb81c6-a162-4f8f-b1c2-f97f51b0949d',
                        labels: [
                            {
                                color: '#3f00ffff',
                                id: '60b6153817057389ba93f42e',
                                name: 'card',
                                probability: 1.0,
                                source: { id: 'N/A', type: 'N/A' },
                                hotkey: '',
                            },
                        ],
                        shape: {
                            points: [
                                { x: 0.2, y: 0.2 },
                                { x: 0.4, y: 0.2 },
                                { x: 0.3, y: 0.3 },
                            ],
                            type: SHAPE_TYPE_DTO.POLYGON,
                        },
                        labels_to_revisit: [],
                    },
                ],
                id: '676575675',
                kind: 'annotation',
                media_identifier: {
                    frame_index: 1,
                    type: MEDIA_TYPE.VIDEO_FRAME,
                    video_id: '60b609fbd036ba4566726c96',
                },
                modified: '2021-06-03T13:09:18.096000+00:00',
                labels_to_revisit_full_scene: [],
            },
        ]);

        expect(annotations).toEqual(expectedResponse);
    });

    it('returns an empty list in case of a 404 response', async () => {
        const annotationUrl = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            media.identifier
        );

        server.use(
            rest.get(`/api/${annotationUrl}`, (req, res, ctx) => {
                return res(
                    ctx.status(404),
                    ctx.json({
                        error_code: 'prediction_not_found',
                        http_status: 404,
                        message: 'There are no annotations that belong to the given image',
                    })
                );
            })
        );

        const annotationService = createApiAnnotationService();
        const annotations = await annotationService.getAnnotations(datasetIdentifier, PROJECT_LABELS, media);

        expect(annotations).toHaveLength(0);
    });

    it('normalizes annotations before saving them', async () => {
        const annotationUrl = API_URLS.SAVE_ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            media.identifier
        );

        server.use(
            rest.post(`/api/${annotationUrl}`, (req, res, ctx) => {
                return res(ctx.json({ message: 'ok' }));
            })
        );

        const annotationService = createApiAnnotationService();

        const label = {
            ...labelFromUser(
                getMockedLabel({
                    id: '60b6153817057389ba93f42e',
                    name: 'card',
                    color: '#3f00ffff',
                    group: '',
                    parentLabelId: null,
                    hotkey: '',

                    behaviour: LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL,
                })
            ),
            score: 1.0,
        };
        const annotations = [
            {
                id: 'd69b4403-4f4c-4e66-936e-b8565dd1a8a1',
                isHidden: false,
                isHovered: false,
                isSelected: false,
                isLocked: false,
                labels: [label],
                shape: { shapeType: ShapeType.Rect as const, x: 65, y: 31, width: 19, height: 16 },
                zIndex: 0,
            },
            {
                id: '54af0335-5074-4024-a9dc-f04417ab1b1c',
                isHidden: false,
                isHovered: false,
                isSelected: false,
                isLocked: false,
                labels: [label],
                shape: { shapeType: ShapeType.Circle as const, x: 34.5, y: 18.5, r: 15.5 },
                zIndex: 1,
            },
            {
                id: 'ccfb81c6-a162-4f8f-b1c2-f97f51b0949d',
                isHidden: false,
                isHovered: false,
                isSelected: false,
                isLocked: false,
                labels: [label],
                shape: {
                    shapeType: ShapeType.Polygon as const,
                    points: [
                        { x: 20, y: 20 },
                        { x: 40, y: 20 },
                        { x: 30, y: 30 },
                    ],
                },
                zIndex: 2,
            },
        ];

        await annotationService.saveAnnotations(datasetIdentifier, media, annotations);
    });

    it('retrieves labeled video ranges', async () => {
        const labels = [
            getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
            getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
        ];

        const videoMediaItem: MediaItem = getMockedVideoMediaItem({
            identifier: {
                videoId: '60b609fbd036ba4566726c96',
                type: MEDIA_TYPE.VIDEO,
            },
            metadata: {
                height: 100,
                width: 100,
                fps: 30,
                duration: 60,
                frames: 150,
                frameStride: 30,
            },
        });
        const annotationUrl = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            videoMediaItem.identifier
        );

        const normalLabel = {
            color: '#3f00ffff',
            id: 'normal',
            name: 'Normal',
            probability: 1.0,
            source: { id: 'N/A', type: 'N/A' },
            hotkey: '',
        };
        const anomalyLabel = {
            color: '#3f00ffff',
            id: 'anomalous',
            name: 'Anomalous',
            probability: 1.0,
            source: { id: 'N/A', type: 'N/A' },
            hotkey: '',
        };

        server.use(
            rest.get(`/api/${annotationUrl}`, (req, res, ctx) => {
                const frames = [0, 30, 60, 90, 120, 150].map((frameNumber) => {
                    return {
                        annotations: [
                            {
                                id: 'd69b4403-4f4c-4e66-936e-b8565dd1a8a1',
                                labels: frameNumber <= 60 ? [normalLabel] : [anomalyLabel],
                                shape: { height: 1.0, type: SHAPE_TYPE_DTO.RECTANGLE, width: 1.0, x: 0.0, y: 0.0 },
                            },
                        ],
                        id: '676575675',
                        kind: 'annotation',
                        media_identifier: {
                            frame_index: frameNumber,
                            type: MEDIA_TYPE.VIDEO_FRAME,
                            video_id: '60b609fbd036ba4566726c96',
                        },
                        modified: '2021-06-03T13:09:18.096000+00:00',
                    };
                });

                return res(ctx.json(frames));
            })
        );

        const annotationService = createApiAnnotationService();
        const ranges = await annotationService.getLabeledVideoRanges(datasetIdentifier, videoMediaItem, labels);

        expect(ranges).toEqual([
            { start: 0, end: 60 + videoMediaItem.metadata.frameStride - 1, labels: [labels[0]] },
            { start: 90, end: 150, labels: [labels[1]] },
        ]);
    });

    it('saves labeld video ranges', async () => {
        const labels = [
            getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
            getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
        ];

        const videoMediaItem: MediaItem = getMockedVideoMediaItem({
            identifier: {
                videoId: '60b609fbd036ba4566726c96',
                type: MEDIA_TYPE.VIDEO,
            },
            metadata: {
                height: 100,
                width: 100,
                fps: 30,
                duration: 60,
                frames: 151,
                frameStride: 30,
            },
        });

        const annotationUrl = API_URLS.ANNOTATIONS(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            videoMediaItem.identifier
        );

        const framesWithExistingAnnotaions = [1, 29, 59, 89, 119, 149];
        const videoFrames = [0, 30, 60, 90, 120, 150, ...framesWithExistingAnnotaions];

        const normalLabel = {
            color: '#3f00ffff',
            id: 'normal',
            name: 'Normal',
            probability: 1.0,
            source: { id: 'N/A', type: 'N/A' },
            hotkey: '',
        };
        const anomalyLabel = {
            color: '#3f00ffff',
            id: 'anomalous',
            name: 'Anomalous',
            probability: 1.0,
            source: { id: 'N/A', type: 'N/A' },
            hotkey: '',
        };

        const callsToSaveAnnotations: number[] = [];

        server.use(
            ...videoFrames.map((frameNumber) => {
                const saveAnnotationUrl = API_URLS.SAVE_ANNOTATIONS(
                    datasetIdentifier.workspaceId,
                    datasetIdentifier.projectId,
                    datasetIdentifier.datasetId,
                    { ...videoMediaItem.identifier, type: MEDIA_TYPE.VIDEO_FRAME, frameNumber }
                );
                return rest.post(`/api/${saveAnnotationUrl}`, (req, res, ctx) => {
                    callsToSaveAnnotations.push(frameNumber);
                    return res(ctx.json({ message: 'ok' }));
                });
            }),
            rest.get(`/api/${annotationUrl}`, (req, res, ctx) => {
                const frames = framesWithExistingAnnotaions.map((frameNumber) => {
                    return {
                        annotations: [
                            {
                                id: 'd69b4403-4f4c-4e66-936e-b8565dd1a8a1',
                                labels: frameNumber <= 90 ? [anomalyLabel] : [normalLabel],
                                shape: { height: 1.0, type: SHAPE_TYPE_DTO.RECTANGLE, width: 1.0, x: 0.0, y: 0.0 },
                            },
                        ],
                        id: '676575675',
                        kind: 'annotation',
                        media_identifier: {
                            frame_index: frameNumber,
                            type: MEDIA_TYPE.VIDEO_FRAME,
                            video_id: '60b609fbd036ba4566726c96',
                        },
                        modified: '2021-06-03T13:09:18.096000+00:00',
                    };
                });

                return res(ctx.json(frames));
            })
        );

        const annotationService = createApiAnnotationService();

        // The following fails if we did not mock all endpoints that are called by the service
        await annotationService.saveLabeledVideoRanges(datasetIdentifier, videoMediaItem, [
            { start: 0, end: 60 + videoMediaItem.metadata.frameStride - 1, labels: [labels[0]] },
            { start: 90, end: 151, labels: [labels[1]] },
        ]);

        expect(callsToSaveAnnotations).toEqual([...videoFrames]);
    });
});
