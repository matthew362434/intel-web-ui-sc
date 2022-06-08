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

import { AnnotationStatePerTask } from '../../media';

export interface ImageIdDTO {
    image_id: string;
    type: 'image';
}

export interface VideoIdDTO {
    type: 'video';
    video_id: string;
}

export interface VideoFrameIdDTO {
    frame_index: number;
    type: 'video_frame';
    video_id: string;
}

export interface AnnotationLabelDTO {
    id: string;
    name: string;
    color: string;
    probability: number;
    source: {
        id: string;
        type: string;
    };
    hotkey?: string;
}

interface Point {
    x: number;
    y: number;
}

export enum SHAPE_TYPE_DTO {
    ROTATED_RECTANGLE = 'ROTATED_RECTANGLE',
    RECTANGLE = 'RECTANGLE',
    ELLIPSE = 'ELLIPSE',
    POLYGON = 'POLYGON',
}

export type ShapeDTO =
    | { type: SHAPE_TYPE_DTO.RECTANGLE; x: number; y: number; height: number; width: number }
    | { type: SHAPE_TYPE_DTO.ROTATED_RECTANGLE; x: number; y: number; height: number; width: number; angle: number }
    | { type: SHAPE_TYPE_DTO.ELLIPSE; x: number; y: number; height: number; width: number }
    | { type: SHAPE_TYPE_DTO.POLYGON; points: Point[] };

export interface AnnotationDTO {
    id: string;
    labels: AnnotationLabelDTO[];
    shape: ShapeDTO;
    labels_to_revisit: string[];
}

export interface AnnotationResultDTO {
    id: number;
    kind: 'annotation';
    media_identifier: ImageIdDTO | VideoFrameIdDTO;
    modified: string;
    annotations: AnnotationDTO[];
    labels_to_revisit_full_scene: string[];
    annotation_state_per_task: AnnotationStatePerTask[];
}

export type VideoAnnotationsDTO = {
    annotations: AnnotationDTO[];
    labels_to_revisit_full_scene: string[];
    id: string;
    kind: 'annotation';
    media_identifier: VideoFrameIdDTO;
    modified: string;
}[];
