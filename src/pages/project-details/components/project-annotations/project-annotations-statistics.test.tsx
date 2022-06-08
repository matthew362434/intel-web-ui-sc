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

import { DOMAIN } from '../../../../core/projects';
import { applicationRender as render, getById } from '../../../../test-utils';
import { useProject } from '../../providers';
import { ProjectAnnotationsStatistics } from './project-annotations-statistics.component';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        projectId: '123',
    }),
    useLocation: () => ({
        pathname: 'localhost:3000/projects/123/annotations',
    }),
}));

jest.mock('../../providers', () => ({
    ...jest.requireActual('../../providers'),
    useProject: jest.fn(() => ({
        isTaskChainProject: false,
        project: {
            tasks: [{ id: '1', domain: 'Detection' }],
            labels: [],
            datasets: [{ id: 1, name: 'test dataset' }],
        },
    })),
}));

describe('Project annotations', () => {
    it('should render elements without task selection', async () => {
        const { container } = await render(<ProjectAnnotationsStatistics />);
        expect(getById(container, 'task-selection-id')).not.toBeInTheDocument();
        expect(getById(container, 'media-images-id')).toBeInTheDocument();
        expect(getById(container, 'media-images-count-id')).toBeInTheDocument();
        expect(getById(container, 'media-videos-id')).toBeInTheDocument();
        expect(getById(container, 'media-videos-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-images-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-images-progress-bar-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-videos-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-videos-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-frames-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-frame-count-id')).toBeInTheDocument();
        expect(getById(container, 'assistant-radial-chart-id')).toBeInTheDocument();
        expect(getById(container, 'assistant-active-model-id')).toBeInTheDocument();
    });

    it('should render page with task selection for task chain project', async () => {
        (useProject as jest.Mock).mockImplementation(() => ({
            isTaskChainProject: true,
            project: {
                labels: [],
                tasks: [
                    { id: '1', domain: DOMAIN.DETECTION },
                    { id: '2', domain: DOMAIN.CLASSIFICATION },
                ],
                datasets: [{ id: 1, name: 'test dataset' }],
            },
        }));

        const { container } = await render(<ProjectAnnotationsStatistics />);
        expect(getById(container, 'task-selection-id')).toBeInTheDocument();
        expect(getById(container, 'media-images-id')).toBeInTheDocument();
        expect(getById(container, 'media-images-count-id')).toBeInTheDocument();
        expect(getById(container, 'media-videos-id')).toBeInTheDocument();
        expect(getById(container, 'media-videos-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-images-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-images-progress-bar-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-videos-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-videos-count-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-frames-id')).toBeInTheDocument();
        expect(getById(container, 'annotated-frame-count-id')).toBeInTheDocument();
        expect(getById(container, 'assistant-radial-chart-id')).toBeInTheDocument();
        expect(getById(container, 'assistant-active-model-id')).toBeInTheDocument();
    });
});
