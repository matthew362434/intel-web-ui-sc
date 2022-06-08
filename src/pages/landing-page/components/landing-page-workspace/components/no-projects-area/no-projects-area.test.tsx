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

import { workspaceRender as render, getById, screen } from '../../../../../../test-utils';
import { NoProjectArea } from './index';

describe('No projects area', () => {
    it('check if title and description are visible', async () => {
        const { container } = await render(<NoProjectArea />);

        const title = getById(container, 'no-projects-area-title');
        const description = getById(container, 'no-projects-area-description');

        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
    });

    it('Check if there is proper message in the empty workspace area', async () => {
        const DESCRIPTION = 'Create new project to leverage AI to automate your Computer Vision task';
        await render(<NoProjectArea />);
        expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
    });
});
