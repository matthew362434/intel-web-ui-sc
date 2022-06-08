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

import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';

import { server } from '../../../../core/annotations/services/test-utils';
import { API_URLS } from '../../../../core/services';
import { ApplicationProvider } from '../../../../providers';
import { RequiredProviders } from '../../../../test-utils';
import { FEATURES, initialConfig, useSettings } from './use-settings.hook';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '',
    }),
    useParams: () => ({
        projectId: 'project-id',
    }),
}));

describe('useSettings', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace_1',
        projectId: 'project-id',
        datasetId: 'dataset_1',
    };
    const settingsUrl = API_URLS.SETTINGS(datasetIdentifier.projectId);

    const wrapper = ({ children }: { children: ReactNode }) => (
        <RequiredProviders useInMemoryEnvironment={false}>
            <ApplicationProvider>{children}</ApplicationProvider>
        </RequiredProviders>
    );

    it('should assign config to initialConfig if there is no backend data', async () => {
        server.use(rest.get(`/api/${settingsUrl}`, (_req, res, ctx) => res(ctx.status(204))));

        const { result, waitForNextUpdate } = renderHook(() => useSettings(), { wrapper });

        await waitForNextUpdate();

        expect(result.current.config).toEqual(initialConfig);
    });

    it('should update the config successfully after saving', async () => {
        const mockBody = {
            [FEATURES.ANNOTATION_PANEL]: {
                title: 'Annotation',
                isEnabled: false,
                tooltipDescription: 'Toggle annotation list on the right sidebar',
            },
            [FEATURES.COUNTING_PANEL]: {
                title: 'Counting',
                isEnabled: false,
                tooltipDescription: 'Toggle counting list on the right sidebar',
            },
        };
        const mockResponse = { settings: JSON.stringify(mockBody) };

        server.use(rest.post(`/api/${settingsUrl}`, (_req, res, ctx) => res(ctx.status(200))));
        server.use(rest.get(`/api/${settingsUrl}`, (_req, res, ctx) => res(ctx.json(mockResponse))));

        const { result, waitForNextUpdate, waitForValueToChange } = renderHook(() => useSettings(), { wrapper });

        await waitForNextUpdate();

        result.current.saveConfig(mockBody);

        await waitForValueToChange(() => {
            return result.current.config;
        });

        expect(result.current.config).toEqual(JSON.parse(mockResponse.settings));
    });
});
