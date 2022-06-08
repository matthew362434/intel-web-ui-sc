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

import { render, screen, waitFor } from '@testing-library/react';

import { getById } from '../../../../../test-utils';
import { ProjectAnnotationsImages } from './index';

describe('Project annotations images', () => {
    const annotatedImagesValue = 5;
    const imagesValue = 10;
    const gridArea = 'images';

    it('should display images value with progress before animation', () => {
        render(
            <ProjectAnnotationsImages annotatedImages={annotatedImagesValue} images={imagesValue} gridArea={gridArea} />
        );
        const imagesTitle = screen.getByText('Annotated images');
        const imagesCount = screen.getByText('0');
        const progressCount = screen.getByText('0%');
        expect(imagesTitle).toBeInTheDocument();
        expect(imagesCount).toBeInTheDocument();
        expect(progressCount).toBeInTheDocument();
    });

    it('should display images value with progress after animation', async () => {
        const { container } = render(
            <ProjectAnnotationsImages annotatedImages={annotatedImagesValue} images={imagesValue} gridArea={gridArea} />
        );
        const imagesTitle = screen.getByText('Annotated images');
        expect(imagesTitle).toBeInTheDocument();

        await waitFor(() => {
            const annotatedImagesWrapper = getById(container, 'annotated-images-count-id');
            expect(annotatedImagesWrapper).toHaveTextContent(`${annotatedImagesValue}`);
            const progressWrapper = getById(container, 'annotated-images-progress-bar-id');
            const progressCalcValue = Math.round((annotatedImagesValue / imagesValue) * 100);
            expect(progressWrapper).toHaveTextContent(`${progressCalcValue}`);
        });
    });
});
