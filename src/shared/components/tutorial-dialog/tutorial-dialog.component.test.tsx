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

import { providersRender as render, screen, fireEvent } from '../../../test-utils';
import { TutorialDialog } from './tutorial-dialog.component';

describe('TutorialDialog', () => {
    it('renders description correctly', () => {
        render(
            <TutorialDialog description='test description' onPressLearnMore={jest.fn()} onPressDismiss={jest.fn()} />
        );

        expect(screen.getByText('test description')).toBeInTheDocument();
    });

    it('executes callbacks correctly', () => {
        const mockLearnMore = jest.fn();
        const mockDismiss = jest.fn();

        render(
            <TutorialDialog
                description='test description'
                onPressLearnMore={mockLearnMore}
                onPressDismiss={mockDismiss}
            />
        );

        const learnMoreButton = screen.getByText('Learn more');
        const dismissButton = screen.getByText('Dismiss');

        fireEvent.click(learnMoreButton);
        expect(mockLearnMore).toHaveBeenCalled();

        fireEvent.click(dismissButton);
        expect(mockDismiss).toHaveBeenCalled();
    });
});
