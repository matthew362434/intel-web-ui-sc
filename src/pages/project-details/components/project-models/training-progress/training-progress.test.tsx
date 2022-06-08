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

import { mockedRunningJobs } from '../../../../../core/jobs/utils';
import { mockedArchitectureModels } from '../../../../../core/models/services/test-utils';
import { applicationRender as render, screen } from '../../../../../test-utils';
import { ProjectProvider } from '../../../providers';
import { TrainingProgress } from './training-progress.component';
import { useTrainingProgress } from './use-training-progress';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        projectId: 'project-1',
    }),
}));

jest.mock('./use-training-progress', () => ({
    useTrainingProgress: jest.fn(() => ({})),
}));

describe('Training progress', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };
    it('Should display correct information about training progress', async () => {
        const trainingDetails = mockedRunningJobs[0];
        const archName = trainingDetails.taskMetadata.architecture;
        const [mockedModelsPerArch] = mockedArchitectureModels.filter(
            ({ architectureName }) => archName === architectureName
        );
        const modelVersion = String(mockedModelsPerArch.modelVersions.length + 1);

        jest.mocked(useTrainingProgress).mockImplementation(() => ({
            showTrainingProgress: true,
            modelVersion,
            trainingDetails,
        }));

        await render(
            <ProjectProvider projectIdentifier={datasetIdentifier}>
                <TrainingProgress models={mockedArchitectureModels} />
            </ProjectProvider>
        );

        expect(screen.getByText('01:19 left')).toBeInTheDocument();
        expect(screen.getByText('64%')).toBeInTheDocument();
        expect(screen.getByText('torch_segmentation - Training (Step 2/6)')).toBeInTheDocument();
        expect(screen.getByText(archName)).toBeInTheDocument();
        expect(screen.getByText(modelVersion)).toBeInTheDocument();
    });
});
