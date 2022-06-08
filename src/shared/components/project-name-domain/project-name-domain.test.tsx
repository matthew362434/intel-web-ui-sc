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

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DOMAIN } from '../../../core/projects';
import { REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE } from '../../../pages/create-project';
import { workspaceRender } from '../../../test-utils';
import { getMockedProject } from '../../../test-utils/mocked-items-factory';
import { ProjectNameDomain } from './project-name-domain.component';

describe('ProjectNameDomain', () => {
    it('Anomaly project is renders as "Anomaly Classification"', async () => {
        const mockProject = getMockedProject({
            id: '1111',
            domains: [DOMAIN.ANOMALY_CLASSIFICATION],
        });

        await workspaceRender(<ProjectNameDomain project={mockProject} />);
        expect(screen.getByText('Anomaly classification')).toBeInTheDocument();
    });

    it('Project name cannot be edited to name with only space character"', async () => {
        const mockProject = getMockedProject({
            id: '1111',
            domains: [DOMAIN.SEGMENTATION],
        });

        await workspaceRender(<ProjectNameDomain project={mockProject} />);
        userEvent.click(screen.getByLabelText('Edit name of the project'));
        const input = screen.getByLabelText('Edit project name field');

        userEvent.hover(input);
        userEvent.clear(input);
        userEvent.type(input, ' ');
        input.blur();

        expect(screen.getByText(REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE)).toBeInTheDocument();
    });
});
