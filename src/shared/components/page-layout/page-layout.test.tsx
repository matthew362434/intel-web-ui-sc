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

import { createInMemoryMediaService } from '../../../core/media/services';
import { ProjectProvider } from '../../../pages/project-details/providers';
import { MediaUploadProvider } from '../../../providers/media-upload-provider/media-upload-provider.component';
import { getById, applicationRender as render } from '../../../test-utils';
import { PageLayout } from './page-layout.component';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        projectId: '123',
    }),
    useLocation: () => ({
        pathname: 'localhost:3000/projects/123/media',
    }),
}));

const mediaService = createInMemoryMediaService();
const datasetIdentifier = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    datasetId: 'dataset-id',
};

describe('Project page content', () => {
    it('Check if all elements are on the screen', async () => {
        const { container } = await render(
            <MediaUploadProvider mediaService={mediaService}>
                <ProjectProvider projectIdentifier={datasetIdentifier}>
                    <PageLayout breadcrumbs={[{ id: 'this-is-test-title-id', breadcrumb: 'This is test title' }]}>
                        <></>
                    </PageLayout>
                </ProjectProvider>
            </MediaUploadProvider>
        );

        expect(getById(container, 'page-layout-id')).toBeInTheDocument();
        const title = getById(container, 'this-is-test-title-id');
        expect(title?.textContent).toBe('This is test title');
    });
});
