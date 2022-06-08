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

import { ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { ProjectAnnotationsAssistant } from './index';

jest.setTimeout(10000);

jest.mock('recharts', () => {
    const MockResponsiveContainer = ({ children }: { children: ReactNode }) => (
        <div style={{ width: 200, height: 200 }}>{children}</div>
    );
    return {
        ...jest.requireActual('recharts'),
        ResponsiveContainer: MockResponsiveContainer,
    };
});

describe('Project annotations assistant', () => {
    const score = 10;
    const gridArea = 'assistant';

    it('should display score before animation', () => {
        render(<ProjectAnnotationsAssistant score={score} gridArea={gridArea} />);
        const assistantTitle = screen.getByText('AI assistant score');
        const activeModelTitle = screen.getByText('Active model');
        expect(assistantTitle).toBeInTheDocument();
        expect(activeModelTitle).toBeInTheDocument();
        const scoreCount = screen.getByText('0%');
        expect(scoreCount).toBeInTheDocument();
    });

    it('should display score after animation', async () => {
        render(<ProjectAnnotationsAssistant score={score} gridArea={gridArea} />);
        await waitFor(() => {
            const scoreCount = screen.getByText(`${score}%`);
            const accuracyTitle = screen.getByText('Accuracy');

            expect(scoreCount).toBeInTheDocument();
            expect(accuracyTitle).toBeInTheDocument();
        });
    });
});
