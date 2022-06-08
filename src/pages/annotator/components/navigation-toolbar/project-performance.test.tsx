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

import { act, onHoverTooltip, providersRender as render, screen } from '../../../../test-utils';
import { ProjectPerformance } from './project-performance.component';

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe('ProjectPerformance', () => {
    const isTaskChainProject = false;
    const projectId = 'project-id';

    it("shows a project's performance", async () => {
        render(
            <ProjectPerformance
                projectId={projectId}
                isTaskChainProject={isTaskChainProject}
                performance={{ type: 'default_performance', score: 0.1 }}
            />
        );

        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '10');

        onHoverTooltip(screen.getByRole('link'));

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText('Latest project score')).toBeInTheDocument();
    });

    it("shows an anomaly project's local and global performance", async () => {
        render(
            <ProjectPerformance
                projectId={projectId}
                isTaskChainProject={isTaskChainProject}
                performance={{ type: 'anomaly_performance', globalScore: 0.9, localScore: 0.4 }}
            />
        );

        expect(screen.getByRole('meter', { name: 'Image score' })).toHaveAttribute('aria-valuenow', '90');
        expect(screen.getByRole('meter', { name: 'Object score' })).toHaveAttribute('aria-valuenow', '40');

        onHoverTooltip(screen.getByRole('link'));

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText(/Classification score: 90%/)).toBeInTheDocument();
        expect(screen.getByText(/Localization score: 40%/)).toBeInTheDocument();
    });

    it('tells the user to annotate more images to get a local performance score', async () => {
        render(
            <ProjectPerformance
                projectId={projectId}
                isTaskChainProject={isTaskChainProject}
                performance={{ type: 'anomaly_performance', globalScore: 0.9, localScore: null }}
            />
        );

        expect(screen.getByRole('meter', { name: 'Image score' })).toHaveAttribute('aria-valuenow', '90');
        expect(screen.queryByRole('meter', { name: 'Object score' })).toHaveAttribute('aria-valuenow', '0');

        onHoverTooltip(screen.getByRole('link'));

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText(/Classification score: 90%/)).toBeInTheDocument();
        expect(screen.getByText(/Localization score: N\/A/)).toBeInTheDocument();
    });
});
