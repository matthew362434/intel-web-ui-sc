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
import 'jest-canvas-mock';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { Rect } from '../../../../../core/annotations';
import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { AnnotationListItemThumbnail } from './annotation-list-item-thumbnail.component';

describe('Annotation list item thumbnail', () => {
    const mockShape = { shapeType: ShapeType.Rect, x: 0, y: 0, height: 100, width: 100 } as Rect;
    const mockImage = new Image(100, 200);

    it('renders a canvas with correctly', async () => {
        render(
            <AnnotationListItemThumbnail
                image={mockImage}
                annotationShape={mockShape}
                annotationId={'test-annotation'}
                onSelectAnnotation={jest.fn()}
                isSelected={false}
            />
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.queryByTestId('annotation-test-annotation-thumbnail')).toBeTruthy();
    });

    it('renders a canvas with the correct dimensions passed as props', () => {
        render(
            <AnnotationListItemThumbnail
                image={mockImage}
                annotationShape={mockShape}
                annotationId={'test-annotation'}
                isSelected={false}
                onSelectAnnotation={jest.fn()}
                width={40}
                height={40}
            />
        );

        expect(screen.getByTestId('annotation-test-annotation-thumbnailWrapper')).toHaveStyle(
            'width: 40px; height: 40px'
        );
    });

    it('renders a canvas with a blue border if the annotation is selected', () => {
        render(
            <AnnotationListItemThumbnail
                image={mockImage}
                annotationShape={mockShape}
                onSelectAnnotation={jest.fn()}
                annotationId={'test-annotation'}
                isSelected
            />
        );

        expect(screen.getByTestId('annotation-test-annotation-thumbnailWrapper')).toHaveClass('isSelected');
    });
});
