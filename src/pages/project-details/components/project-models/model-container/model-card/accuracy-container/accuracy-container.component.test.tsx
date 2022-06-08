// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { render, screen } from '@testing-library/react';

import AccuracyContainer from './accuracy-container.component';

describe('Accuracy container', () => {
    describe('should conditionally show heading', () => {
        it('should render heading', () => {
            render(<AccuracyContainer value={20} heading='Accuracy' />);

            expect(screen.getByText('Accuracy')).toBeInTheDocument();
        });
    });

    describe('should render the correct classes based on "disabled" prop', () => {
        it('disabled', () => {
            render(<AccuracyContainer value={20} disabled id='fake-id' heading='Accuracy' />);

            const accuracyContainer = screen.getByTestId('accuracy-progress-fake-id-id');

            expect(accuracyContainer.classList).toContain('accuracyProgressBarOutdated');
        });

        it('not disabled', () => {
            render(<AccuracyContainer value={20} id='fake-id' heading='Accuracy' />);

            expect(screen.getByTestId('accuracy-progress-fake-id-id').classList).toContain('accuracyProgressBarLarge');
        });
    });
});
