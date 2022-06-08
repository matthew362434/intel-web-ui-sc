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

import { Label, LABEL_SOURCE } from '../../labels';
import { MediaItem } from '../../media';
import { Annotation, AnnotationLabel } from '../annotation.interface';
import { AnnotationDTO, AnnotationLabelDTO, SHAPE_TYPE_DTO, ShapeDTO, VideoAnnotationsDTO } from '../dtos';
import { PredictionMapDTO } from '../dtos/prediction.interface';
import { PredictionMap } from '../prediction.interface';
import { Shape } from '../shapes.interface';
import { ShapeType } from '../shapetype.enum';

const getShape = (shape: ShapeDTO, mediaItem: MediaItem): Shape => {
    const { width, height } = mediaItem.metadata;

    switch (shape.type) {
        case SHAPE_TYPE_DTO.RECTANGLE: {
            return {
                shapeType: ShapeType.Rect,
                x: shape.x * width,
                y: shape.y * height,
                width: shape.width * width,
                height: shape.height * height,
            };
        }

        case SHAPE_TYPE_DTO.ROTATED_RECTANGLE: {
            return {
                shapeType: ShapeType.RotatedRect,
                angle: shape.angle,
                x: shape.x * width,
                y: shape.y * height,
                width: shape.width * width,
                height: shape.height * height,
            };
        }

        case SHAPE_TYPE_DTO.ELLIPSE: {
            // The server returns the bounding box of the circle
            const rWidth = shape.width / 2;
            const rHeight = shape.height / 2;

            return {
                shapeType: ShapeType.Circle,
                x: (shape.x + rWidth) * width,
                y: (shape.y + rHeight) * height,
                r: rWidth * width,
            };
        }

        case SHAPE_TYPE_DTO.POLYGON: {
            return {
                shapeType: ShapeType.Polygon,
                points: shape.points.map(({ x, y }) => {
                    return {
                        x: x * width,
                        y: y * height,
                    };
                }),
            };
        }
    }
};

export const getAnnotation = (
    mediaItem: MediaItem,
    annotation: AnnotationDTO,
    projectLabels: Label[],
    index: number,
    source: LABEL_SOURCE
): Annotation => {
    const labels = annotation.labels
        .map((label: AnnotationLabelDTO): AnnotationLabel | undefined => {
            const projectLabel = projectLabels.find(({ id }) => id === label.id);

            if (projectLabel === undefined) {
                return undefined;
            }

            const { id, name, color, hotkey } = label;

            return {
                id,
                name,
                color,
                group: projectLabel.group,
                parentLabelId: projectLabel.parentLabelId || null,
                source: {
                    id: label.source.id,
                    type: source,
                },
                score: label.probability,
                hotkey,
                behaviour: projectLabel.behaviour,
            };
        })
        .filter((label): label is AnnotationLabel => label !== undefined);

    const shape = getShape(annotation.shape, mediaItem);

    return {
        id: annotation.id,
        isHidden: false,
        isHovered: false,
        isSelected: false,
        isLocked: false,
        labels,
        shape,
        zIndex: index,
    };
};

const toShapeDTO = (shape: Shape, mediaItem: MediaItem): ShapeDTO => {
    const { width, height } = mediaItem.metadata;

    switch (shape.shapeType) {
        case ShapeType.Rect: {
            return {
                type: SHAPE_TYPE_DTO.RECTANGLE,
                x: shape.x / width,
                y: shape.y / height,
                width: shape.width / width,
                height: shape.height / height,
            };
        }
        case ShapeType.RotatedRect: {
            return {
                type: SHAPE_TYPE_DTO.ROTATED_RECTANGLE,
                angle: shape.angle,
                x: shape.x / width,
                y: shape.y / height,
                width: shape.width / width,
                height: shape.height / height,
            };
        }
        case ShapeType.Circle: {
            const x = shape.x - shape.r;
            const y = shape.y - shape.r;

            return {
                type: SHAPE_TYPE_DTO.ELLIPSE,
                x: x / width,
                y: y / height,
                width: (shape.r * 2) / width,
                height: (shape.r * 2) / height,
            };
        }

        case ShapeType.Polygon: {
            return {
                type: SHAPE_TYPE_DTO.POLYGON,
                points: shape.points.map(({ x, y }) => {
                    return {
                        x: x / width,
                        y: y / height,
                    };
                }),
            };
        }
    }
};

export const toAnnotationDTO = (mediaItem: MediaItem, annotation: Annotation): AnnotationDTO => {
    const labels = annotation.labels.map((label: AnnotationLabel): AnnotationLabelDTO => {
        const { id, name, color, score, source, hotkey } = label;

        return {
            id,
            name,
            color,
            probability: score === undefined ? 1 : score,
            source: {
                id: source.id === undefined ? 'N/A' : source.id,
                type: source.type === LABEL_SOURCE.MODEL ? 'Model' : 'User',
            },
            hotkey,
        };
    });

    const shape = toShapeDTO(annotation.shape, mediaItem);

    return {
        id: annotation.id,
        shape,
        labels,
        labels_to_revisit: [],
    };
};

export const getAnnotatedVideoLabels = (data: VideoAnnotationsDTO): Record<number, Set<string>> => {
    if (!Array.isArray(data)) {
        return {};
    }

    const pairs = data.map(({ annotations, media_identifier }): [number, Set<string>] => {
        const labelIds = annotations.flatMap((annotation: AnnotationDTO) => {
            return annotation.labels.map(({ id }) => id);
        });

        const labelsSet = new Set<string>(labelIds);
        const frameNumber = media_identifier.frame_index as number;

        return [frameNumber, labelsSet];
    });

    return Object.fromEntries(pairs) as Record<number, Set<string>>;
};

export const getPredictionMaps = (maps: PredictionMapDTO[]): PredictionMap[] => {
    return maps.map((map: PredictionMapDTO) => {
        const { id, name, type, url } = map;

        return { id, name, type, url, labelsId: map.labels_id };
    });
};
