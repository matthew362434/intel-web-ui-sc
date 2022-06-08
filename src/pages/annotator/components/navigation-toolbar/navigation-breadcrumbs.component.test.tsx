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
import { waitFor, render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { DOMAIN } from '../../../../core/projects';
import { screen } from '../../../../test-utils';
import { useTask } from '../../providers/task-provider/task-provider.component';
import { NavigationBreadcrumbs } from './navigation-breadcrumbs.component';

jest.mock('../../providers/task-provider/task-provider.component', () => ({
    ...jest.requireActual('../../providers/task-provider/task-provider.component'),
    useTask: jest.fn(() => ({
        labels: [],
        tasks: [],
    })),
}));

describe('NavigationBreadcrumbs', () => {
    const breadcrumbItems = ['All Tasks', DOMAIN.SEGMENTATION, DOMAIN.CLASSIFICATION];

    it.each(breadcrumbItems)('renders the correct breadcrumb items', async (item) => {
        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: [
                { id: '20', domain: DOMAIN.SEGMENTATION },
                { id: '30', domain: DOMAIN.CLASSIFICATION },
            ],
        }));

        render(<NavigationBreadcrumbs />);

        await waitFor(() => {
            expect(screen.queryByText(item)).toBeTruthy();
        });
    });

    it('selects "All tasks" by default', async () => {
        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: [
                { id: '20', domain: DOMAIN.SEGMENTATION },
                { id: '30', domain: DOMAIN.CLASSIFICATION },
            ],
        }));

        render(<NavigationBreadcrumbs />);

        await waitFor(() => {
            expect(screen.queryByText('All Tasks')).toBeTruthy();
        });

        expect(screen.queryByText('All Tasks')).toHaveClass('selected');
    });

    it('switches task correctly', async () => {
        const mockSetSelectedTask = jest.fn();

        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: [
                { id: '20', domain: DOMAIN.SEGMENTATION },
                { id: '30', domain: DOMAIN.CLASSIFICATION },
            ],
            setSelectedTask: mockSetSelectedTask,
        }));

        render(<NavigationBreadcrumbs />);

        act(() => {
            fireEvent.click(screen.getByText(DOMAIN.SEGMENTATION));
        });

        expect(mockSetSelectedTask).toHaveBeenCalled();
    });
});
