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

import {
    Annotation as AnnotationType,
    AnnotationLabel,
    labelFromUser,
    Polygon as PolygonShape,
} from '../../../core/annotations';
import { ShapeType } from '../../../core/annotations/shapetype.enum';
import { render } from '../../../test-utils';
import { getMockedAnnotation, getMockedLabel } from '../../../test-utils/mocked-items-factory';
import { DEFAULT_ANNOTATION_STYLES, EDIT_ANNOTATION_STYLES } from '../tools/utils';
import { Annotation } from './annotation.component';

describe('Annotation components', () => {
    it('Draws a rectangle', () => {
        const shape = { shapeType: ShapeType.Rect, x: 0, y: 10, width: 100, height: 110 } as const;
        const annotation: AnnotationType = getMockedAnnotation({ shape }, ShapeType.Rect);

        const { container } = render(
            <svg>
                <Annotation annotation={annotation} />
            </svg>
        );
        const rect = container.querySelector('rect');

        expect(rect).toHaveAttribute('x', `${shape.x}`);
        expect(rect).toHaveAttribute('y', `${shape.y}`);
        expect(rect).toHaveAttribute('width', `${shape.width}`);
        expect(rect).toHaveAttribute('height', `${shape.height}`);
    });

    it('Draws a circle', () => {
        const shape = { shapeType: ShapeType.Circle, x: 0, y: 10, r: 33 } as const;
        const annotation: AnnotationType = getMockedAnnotation({ shape }, ShapeType.Circle);

        const { container } = render(
            <svg>
                <Annotation annotation={annotation} />
            </svg>
        );
        const circle = container.querySelector('circle');

        expect(circle).toHaveAttribute('cx', `${shape.x}`);
        expect(circle).toHaveAttribute('cy', `${shape.y}`);
        expect(circle).toHaveAttribute('r', `${shape.r}`);
    });

    it('Draws a polygon', () => {
        const shape: PolygonShape = {
            shapeType: ShapeType.Polygon,
            points: [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
            ],
        };
        const annotation: AnnotationType = getMockedAnnotation({ shape }, ShapeType.Polygon);

        const { container } = render(
            <svg>
                <Annotation annotation={annotation} />
            </svg>
        );
        const polygon = container.querySelector('polygon');

        const points = shape.points;
        expect(polygon).toHaveAttribute(
            'points',
            `${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}`
        );
    });

    describe('Labelling', () => {
        const shape = { shapeType: ShapeType.Rect, x: 0, y: 10, width: 100, height: 110 } as const;
        const otherLabel = labelFromUser(getMockedLabel({ color: 'blue' }));
        const label = labelFromUser(getMockedLabel({ color: 'red' }));

        it('gives a background color based on its labels', () => {
            const labels: AnnotationLabel[] = [otherLabel, label];
            const annotation: AnnotationType = getMockedAnnotation({ shape, labels }, ShapeType.Rect);

            const { container } = render(
                <svg>
                    <Annotation annotation={annotation} />
                </svg>
            );
            const rect = container.querySelector('g');

            expect(rect).toHaveAttribute('fill', label.color);
            expect(rect).toHaveAttribute('stroke', label.color);
        });

        it('applies the default sonoma creek color to annotations without labels', () => {
            const annotation: AnnotationType = getMockedAnnotation({ shape, labels: [] }, ShapeType.Rect);

            const { container } = render(
                <svg>
                    <Annotation annotation={annotation} />
                </svg>
            );
            const rect = container.querySelector('g');

            expect(rect).toHaveAttribute('fill', DEFAULT_ANNOTATION_STYLES.fill);
            expect(rect).toHaveAttribute('stroke', DEFAULT_ANNOTATION_STYLES.stroke);
        });

        it('applies selected stroke color when an annotation is selected', () => {
            const labels: AnnotationLabel[] = [otherLabel, label];
            const annotation: AnnotationType = getMockedAnnotation({ shape, labels, isSelected: true }, ShapeType.Rect);

            const { container } = render(
                <svg>
                    <Annotation annotation={annotation} />
                </svg>
            );
            const rect = container.querySelector('g');

            expect(rect).toHaveAttribute('fill', label.color);
            expect(rect).toHaveAttribute('stroke', EDIT_ANNOTATION_STYLES.stroke);
        });

        it('applies selected stroke color when an annotation is hovered', () => {
            const labels: AnnotationLabel[] = [otherLabel, label];
            const annotation: AnnotationType = getMockedAnnotation({ shape, labels, isHovered: true }, ShapeType.Rect);

            const { container } = render(
                <svg>
                    <Annotation annotation={annotation} />
                </svg>
            );
            const rect = container.querySelector('g');

            expect(rect).toHaveAttribute('fill', label.color);
            expect(rect).toHaveAttribute('stroke', EDIT_ANNOTATION_STYLES.stroke);
        });
    });
});
