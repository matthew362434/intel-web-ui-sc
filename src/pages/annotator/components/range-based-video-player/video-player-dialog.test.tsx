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

import { createInMemoryAnnotationService, LabeledVideoRange } from '../../../../core/annotations';
import { DatasetIdentifier } from '../../../../core/projects';
import {
    fireEvent,
    providersRender as render,
    RequiredProviders,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '../../../../test-utils';
import { getMockedLabel, getMockedVideoMediaItem } from '../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../../project-details/providers';
import { VideoPlayerDialog } from './video-player-dialog.component';

const labels = [
    getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
    getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
];

describe('VideoPlayerDialog', () => {
    const mediaItem = getMockedVideoMediaItem({
        name: 'Bunny.mp4',
        src: '',
        metadata: {
            duration: 20,
            fps: 30,
            frames: 605,
            frameStride: 30,
            height: 720,
            width: 1280,
        },
    });

    const datasetIdentifier: DatasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    const close = jest.fn();

    it('renders', async () => {
        const annotationService = createInMemoryAnnotationService();
        annotationService.saveLabeledVideoRanges = jest.fn();

        const ranges: LabeledVideoRange[] = [{ start: 0, end: mediaItem.metadata.frames, labels: [labels[0]] }];
        annotationService.getLabeledVideoRanges = jest.fn(() => {
            return Promise.resolve(ranges);
        });

        render(
            <RequiredProviders annotationService={annotationService}>
                <ProjectProvider projectIdentifier={datasetIdentifier}>
                    <VideoPlayerDialog datasetIdentifier={datasetIdentifier} mediaItem={mediaItem} close={close} />
                </ProjectProvider>
            </RequiredProviders>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
        screen.getByRole('dialog', { name: 'Normal and anomaly selection' });

        fireEvent.click(screen.getByRole('button', { name: /Split/i }));

        await waitFor(() => {
            expect(annotationService.saveLabeledVideoRanges).toHaveBeenCalled();
        });

        expect(close).toHaveBeenCalled();
        expect(annotationService.saveLabeledVideoRanges).toHaveBeenCalledWith(datasetIdentifier, mediaItem, ranges);
    });
});
