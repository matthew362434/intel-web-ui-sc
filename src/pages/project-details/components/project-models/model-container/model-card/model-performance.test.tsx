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

import { act, onHoverTooltip, providersRender as render, screen } from '../../../../../../test-utils';
import { ModelPerformance } from './model-performance.component';

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe('ModelPerformance', () => {
    const genericId = 'model-performance';
    const upToDate = true;

    it("shows a model's performance", async () => {
        render(
            <ModelPerformance
                upToDate={upToDate}
                genericId={genericId}
                performance={{
                    type: 'default_performance',
                    score: 10,
                }}
            />
        );

        expect(screen.getByRole('heading', { name: 'Accuracy' })).toBeInTheDocument();
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '10');

        onHoverTooltip(screen.getByRole('button'));

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText('Latest model score')).toBeInTheDocument();
    });

    it("shows an anomaly model's local and global performance", async () => {
        render(
            <ModelPerformance
                upToDate={upToDate}
                genericId={genericId}
                performance={{
                    type: 'anomaly_performance',
                    globalScore: 90,
                    localScore: 40,
                }}
            />
        );

        expect(screen.getByRole('heading', { name: 'Image score' })).toBeInTheDocument();
        expect(screen.getByRole('meter', { name: 'Image score' })).toHaveAttribute('aria-valuenow', '90');

        expect(screen.getByRole('heading', { name: 'Object score' })).toBeInTheDocument();
        expect(screen.getByRole('meter', { name: 'Object score' })).toHaveAttribute('aria-valuenow', '40');

        onHoverTooltip(screen.getByRole('button', { name: 'Image score' }));

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText('Latest model score')).toBeInTheDocument();

        onHoverTooltip(screen.getByRole('button', { name: 'Object score' }));
        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText('Latest model score')).toBeInTheDocument();
    });

    it('tells the user to annotate more images to get a local performance score', async () => {
        render(
            <ModelPerformance
                upToDate={upToDate}
                genericId={genericId}
                performance={{
                    type: 'anomaly_performance',
                    globalScore: 90,
                    localScore: null,
                }}
            />
        );

        expect(screen.getByRole('heading', { name: 'Image score' })).toBeInTheDocument();
        expect(screen.getByRole('meter', { name: 'Image score' })).toHaveAttribute('aria-valuenow', '90');

        expect(screen.getByRole('heading', { name: 'Object score' })).toBeInTheDocument();
        expect(screen.queryByRole('meter', { name: 'Object score' })).not.toBeInTheDocument();

        onHoverTooltip(screen.getByRole('button', { name: 'Image score' }));

        act(() => {
            jest.runAllTimers();
        });
        expect(screen.getByText('Latest model score')).toBeInTheDocument();

        onHoverTooltip(screen.getByRole('button', { name: 'Object score' }));
        act(() => {
            jest.runAllTimers();
        });
        expect(screen.getByText('Annotate your media to compute localization score')).toBeInTheDocument();
    });
});
