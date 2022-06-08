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

import { Suspense } from 'react';

import App from './app.component';
import { applicationRender as render, getById, waitFor } from './test-utils';

describe('App component', () =>
    it('renders correctly', async () => {
        const { container } = await render(
            <Suspense fallback={<div>Test</div>}>
                <App />
            </Suspense>
        );

        await waitFor(() => {
            const title = getById(container, 'application-title');

            expect(title).toBeInTheDocument();
        });
    }));
