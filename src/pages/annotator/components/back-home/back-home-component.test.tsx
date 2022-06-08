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

import { useHistory } from 'react-router-dom';

import { PATHS } from '../../../../core/services';
import { providersRender as render, screen, fireEvent } from '../../../../test-utils';
import { DatasetChapters } from '../../../project-details/components/project-dataset/project-dataset.component';
import { BackHome } from './back-home.component';

jest.mock('../../../project-details/providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../../project-details/providers/project-provider/project-provider.component'),
    useProject: () => ({ project: { id: 'test' } }),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(() => ({
        push: jest.fn(),
        block: jest.fn(),
    })),
}));

describe('BackHome component', () => {
    const mockPush = jest.fn();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jest.mocked(useHistory).mockImplementation(() => {
        return {
            push: mockPush,
        };
    });

    afterEach(() => {
        mockPush.mockReset();
    });

    it('Goes back to the project page', () => {
        render(<BackHome />);

        fireEvent.click(screen.getByTestId('go-back-button'));

        expect(mockPush).toHaveBeenCalledWith(PATHS.getProjectDatasetUrl('test', DatasetChapters.DEFAULT));
    });
});
