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

import { MEDIA_TYPE } from '../../media';
import { AnnotationDTO, AnnotationResultDTO, SHAPE_TYPE_DTO, VideoAnnotationsDTO } from '../dtos';
import { PredictionDTO, PredictionMapDTO } from '../dtos/prediction.interface';

const mockAnnotations: AnnotationDTO[] = [
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
];

const mockMaps: PredictionMapDTO[] = [
    {
        id: '6138bca43b7b11505c43f2c1',
        labels_id: '6138bca43b7b11505c43f2c1',
        name: 'Lorem',
        type: 'Result media type 1',
        url: 'https://placekitten.com/g/600/400',
    },
    {
        id: '6138bca43b7b11505c43f2c2',
        labels_id: '6138bca43b7b11505c43f2c2',
        name: 'Ipsum',
        type: 'Result media type 2',
        url: 'https://placekitten.com/g/700/500',
    },
    {
        id: '6138bca43b7b11505c43f2c3',
        labels_id: '6138bca43b7b11505c43f2c3',
        name: 'Dolor',
        type: 'Result media type 3',
        url: 'https://placekitten.com/g/800/600',
    },
    {
        id: '6138bca43b7b11505c43f2c4',
        labels_id: '6138bca43b7b11505c43f2c4',
        name: 'Sit',
        type: 'Result media type 4',
        url: 'https://placekitten.com/g/900/700',
    },
    {
        id: '6138bca43b7b11505c43f2c5',
        labels_id: '6138bca43b7b11505c43f2c5',
        name: 'Amet',
        type: 'Result media type 5',
        url: 'https://placekitten.com/g/1000/800',
    },
];

export const predictionsResponse = (): PredictionDTO => {
    return {
        annotations: mockAnnotations,
        maps: mockMaps,
        id: '12312321',
        kind: 'prediction',
        media_identifier: {
            image_id: '60b609fbd036ba4566726c96',
            type: MEDIA_TYPE.IMAGE,
        },
        modified: '2021-06-03T13:09:18.096000+00:00',
    };
};

export const imageAnnotationsResponse = (): AnnotationResultDTO => {
    return {
        annotations: mockAnnotations,
        id: 12312321,
        kind: 'annotation',
        media_identifier: {
            image_id: '60b609fbd036ba4566726c96',
            type: MEDIA_TYPE.IMAGE,
        },
        modified: '2021-06-03T13:09:18.096000+00:00',
        labels_to_revisit_full_scene: [],
        annotation_state_per_task: [],
    };
};

export const videoAnnotationsResponse = (): VideoAnnotationsDTO => {
    return [
        {
            annotations: mockAnnotations,
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
    ];
};
