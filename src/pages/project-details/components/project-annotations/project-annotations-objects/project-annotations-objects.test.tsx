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

import { render, screen } from '@testing-library/react';

import { ProjectAnnotationsObjects } from './index';

jest.mock('recharts', () => {
    const MockResponsiveContainer = ({ children }: { children: ReactNode }) => (
        <div style={{ width: 200, height: 200 }}>{children}</div>
    );
    return {
        ...jest.requireActual('recharts'),
        ResponsiveContainer: MockResponsiveContainer,
    };
});

describe('Project annotations objects', () => {
    it('should render correctly', async () => {
        render(<ProjectAnnotationsObjects objectsPerLabel={[]} gridArea='objects' />);
        const objectsTitle = screen.getByText('Number of objects per label');
        expect(objectsTitle).toBeInTheDocument();
    });
});
