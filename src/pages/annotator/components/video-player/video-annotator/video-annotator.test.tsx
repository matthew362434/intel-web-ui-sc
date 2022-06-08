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

import { useEffect } from 'react';

import { screen, waitForElementToBeRemoved } from '@testing-library/react';

import { createInMemoryAnnotationService, createInmemoryPredictionService } from '../../../../../core/annotations';
import { LABEL_BEHAVIOUR } from '../../../../../core/labels';
import { VideoFrame } from '../../../../../core/media';
import { createInMemoryMediaService } from '../../../../../core/media/services';
import { createInMemoryProjectService, DOMAIN, ProjectProps } from '../../../../../core/projects';
import { annotatorRender as render } from '../../../test-utils/annotator-render';
import { useVideoPlayer, VideoPlayerProvider } from '../video-player-provider.component';
import './../../../../../test-utils/mock-resize-observer';
import {
    getMockedProject,
    getMockedVideoFrameMediaItem,
    getMockedLabel,
    labels as mockedLabels,
    getMockedTask,
} from './../../../../../test-utils/mocked-items-factory';
import { VideoAnnotator } from './video-annotator.component';

const datasetIdentifier = {
    workspaceId: 'test-workspace',
    projectId: 'test-project',
    datasetId: 'test-dataset',
};

jest.mock('../../../hooks/use-dataset-identifier.hook', () => ({
    useDatasetIdentifier: jest.fn(() => {
        return datasetIdentifier;
    }),
}));

describe('Video annotator', () => {
    const setStep = jest.fn();
    const selectFrame = jest.fn();

    const renderVideoPlayer = async (videoFrame: VideoFrame, project: ProjectProps) => {
        const annotationService = createInMemoryAnnotationService();
        const predictionService = createInmemoryPredictionService();
        const mediaService = createInMemoryMediaService();
        const projectService = createInMemoryProjectService();
        projectService.getProject = jest.fn(async () => {
            return project;
        });

        const selectVideoFrame = jest.fn();

        const App = () => {
            const { isInActiveMode, setIsInActiveMode } = useVideoPlayer();

            useEffect(() => {
                if (isInActiveMode) {
                    setIsInActiveMode(false);
                }
            }, [isInActiveMode, setIsInActiveMode]);

            if (isInActiveMode) {
                return <div>loading</div>;
            }

            return (
                <VideoAnnotator
                    videoFrame={videoFrame}
                    step={30}
                    setStep={setStep}
                    selectFrame={selectFrame}
                    project={project}
                    isInActiveMode={false}
                />
            );
        };

        render(
            <VideoPlayerProvider
                annotationService={annotationService}
                predictionService={predictionService}
                videoFrame={videoFrame}
                selectVideoFrame={selectVideoFrame}
            >
                <App />
            </VideoPlayerProvider>,
            { services: { projectService, annotationService, mediaService, predictionService } }
        );
        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        return { annotationService, selectVideoFrame };
    };
    const videoFrame = getMockedVideoFrameMediaItem({});

    const emptyLabel = getMockedLabel({
        name: 'Empty task label',
        group: 'Empty task label group',
        parentLabelId: null,
        isExclusive: true,
    });
    const labels = [...mockedLabels, emptyLabel];

    describe('Grouping labels in the video annotator', () => {
        it('groups classification labels based on their group', async () => {
            const classificationLabels = [
                ...mockedLabels.map((label) => {
                    return { ...label, behaviour: LABEL_BEHAVIOUR.GLOBAL };
                }),
                emptyLabel,
            ];
            const project: ProjectProps = getMockedProject({
                labels: classificationLabels,
                tasks: [
                    getMockedTask({
                        id: 'classification',
                        domain: DOMAIN.CLASSIFICATION,
                        labels: classificationLabels,
                    }),
                ],
            });

            await renderVideoPlayer(videoFrame, project);

            const labelGroups = screen.getByLabelText('Label groups');
            expect(labelGroups).toHaveTextContent('card');
            expect(labelGroups).toHaveTextContent('color');
            expect(labelGroups).toHaveTextContent('suit');
            expect(labelGroups).toHaveTextContent('value');
            expect(labelGroups).not.toHaveTextContent(emptyLabel.name);
        });

        it('shows all labels of a detection or segmentation project', async () => {
            const project: ProjectProps = getMockedProject({
                labels,
                domains: [DOMAIN.DETECTION],
            });
            await renderVideoPlayer(videoFrame, project);

            const labelGroups = screen.getByLabelText('Label groups');

            mockedLabels.forEach((label) => {
                expect(labelGroups).toHaveTextContent(label.name);
            });
            expect(labelGroups).not.toHaveTextContent(emptyLabel.name);
        });

        it('shows normal and anomalous labels', async () => {
            const anomalyLabels = [
                getMockedLabel({
                    id: 'normal',
                    name: 'Normal',
                    behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.EXCLUSIVE,
                }),
                getMockedLabel({
                    id: 'anomalous',
                    name: 'Anomalous',
                    behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.ANOMALOUS,
                }),
            ];
            const project: ProjectProps = getMockedProject({
                labels: anomalyLabels,
                tasks: [
                    getMockedTask({
                        id: 'anomaly-classification',
                        domain: DOMAIN.ANOMALY_CLASSIFICATION,
                        labels: anomalyLabels,
                    }),
                ],
            });

            await renderVideoPlayer(videoFrame, project);

            const labelGroups = screen.getByLabelText('Label groups');
            expect(labelGroups).toHaveTextContent('Normal vs. Anomaly');
        });
    });
});
