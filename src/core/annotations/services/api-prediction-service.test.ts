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

import { createApiPredictionService } from '.';
import {
    getMockedImageMediaItem,
    getMockedLabel,
    getMockedVideoMediaItem,
} from '../../../test-utils/mocked-items-factory';
import { LABEL_BEHAVIOUR, LABEL_SOURCE } from '../../labels';
import { MEDIA_TYPE, MediaItem } from '../../media';
import { API_URLS } from '../../services';
import { SHAPE_TYPE_DTO } from '../dtos';
import { ShapeType } from '../shapetype.enum';
import { predictionsResponse, videoAnnotationsResponse } from './mockResponses';
import { PredictionMode } from './prediction-service.interface';
import { server } from './test-utils';
import { getAnnotatedVideoLabels } from './utils';

const PROJECT_LABELS = [
    getMockedLabel({
        id: '60b609e0d036ba4566726c82',
        name: 'card',
        color: '#fff5f7ff',
    }),
    getMockedLabel({
        id: '60b6153817057389ba93f42e',
        name: 'card',
        color: '#3f00ffff',
        group: '',
        hotkey: '',
        behaviour: LABEL_BEHAVIOUR.LOCAL,
    }),
];

describe('API prediction service', () => {
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

    it('gets predictions', async () => {
        const predictionUrl = API_URLS.PREDICTION(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            media.identifier,
            PredictionMode.AUTO
        );
        server.use(
            rest.get(`/api/${predictionUrl}`, (req, res, ctx) => {
                return res(ctx.json(predictionsResponse()));
            })
        );

        const predictionService = createApiPredictionService();
        const { annotations, maps } = await predictionService.getPredictions(datasetIdentifier, PROJECT_LABELS, media);

        expect(maps).toHaveLength(5);

        const expectedLabel = {
            ...PROJECT_LABELS[1],
            source: {
                type: LABEL_SOURCE.MODEL,
                id: 'N/A',
            },
            score: 1.0,
        };

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

        const predictionUrl = API_URLS.PREDICTION(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            videoMediaItem.identifier,
            PredictionMode.AUTO
        );

        server.use(
            rest.get(`/api/${predictionUrl}`, (req, res, ctx) => {
                return res(ctx.json(videoAnnotationsResponse()));
            })
        );

        const predictionService = createApiPredictionService();
        const annotations = await predictionService.getVideoPredictionsTimeline(
            datasetIdentifier,
            videoMediaItem,
            PredictionMode.AUTO
        );

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
        const predictionUrl = API_URLS.PREDICTION(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            media.identifier,
            PredictionMode.AUTO
        );

        server.use(
            rest.get(`/api/${predictionUrl}`, (req, res, ctx) => {
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

        const predictionService = createApiPredictionService();
        const { annotations } = await predictionService.getPredictions(datasetIdentifier, PROJECT_LABELS, media);

        expect(annotations).toHaveLength(0);
    });
});
