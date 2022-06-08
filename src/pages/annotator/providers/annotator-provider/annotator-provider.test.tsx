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

import { ReactElement } from 'react';

import {
    createInMemoryAnnotationService,
    createInmemoryPredictionService,
    labelFromModel,
    labelFromUser,
} from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { MEDIA_TYPE, MediaItem } from '../../../../core/media';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { createInMemoryProjectService } from '../../../../core/projects';
import { fireEvent, screen, waitFor } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedImageMediaItem,
    getMockedLabel,
    labels as mockedLabels,
} from '../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import { ANNOTATOR_MODE } from '../../core';
import { annotatorRender } from '../../test-utils/annotator-render';
import { usePrediction } from '../prediction-provider/prediction-provider.component';
import { useAnnotator } from './annotator-provider.component';

describe('Annotator provider', (): void => {
    const annotationService = createInMemoryAnnotationService();
    const predictionService = createInmemoryPredictionService();
    const mediaService = createInMemoryMediaService();
    const projectService = createInMemoryProjectService();

    const projectIdentifier = { workspaceId: 'workspace-id', projectId: 'project-id' };

    const render = (ui: ReactElement) => {
        annotatorRender(ui, {
            projectIdentifier,
            services: { annotationService, mediaService, predictionService, projectService },
        });
    };

    it('Loads project details then shows the app', async () => {
        const App = () => {
            const { project } = useProject();

            return <span>{project.name}</span>;
        };

        render(<App />);

        expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
        expect(await screen.findByText('In memory detection')).toBeInTheDocument();
    });

    describe('Annotator mode', () => {
        // Immediatly load the media item's image
        beforeAll(() => {
            Object.defineProperty(global.Image.prototype, 'src', {
                set() {
                    setTimeout(() => this.onload());
                },
            });
        });

        const mediaItem: MediaItem = getMockedImageMediaItem({
            identifier: {
                imageId: 'test',
                type: MEDIA_TYPE.IMAGE,
            },
        });

        const App = () => {
            const { mode, selectedMediaItem, setSelectedMediaItem } = useAnnotator();

            const loadMediaItem = () => setSelectedMediaItem(mediaItem);

            if (selectedMediaItem === undefined) {
                return <button onClick={loadMediaItem}>Load</button>;
            }

            return <span>{mode === ANNOTATOR_MODE.ANNOTATION ? 'Annotation' : 'Prediction'}</span>;
        };

        it('Defaults to annotation mode', async () => {
            render(<App />);

            fireEvent.click(await screen.findByRole('button', { name: /load/i }));
            expect(await screen.findByText(/Annotation/i)).toBeInTheDocument();
        });

        const predictionAnnotations = [
            getMockedAnnotation({ labels: [labelFromModel(mockedLabels[0], 0.8)] }, ShapeType.Rect),
        ];

        it('Switches to prediction mode if it has predictions but no user annotations', async () => {
            const annotationsSpy = jest.spyOn(annotationService, 'getAnnotations').mockImplementation(async () => {
                return [];
            });

            const predictionsSpy = jest.spyOn(predictionService, 'getPredictions').mockImplementation(async () => {
                return { annotations: predictionAnnotations, maps: [] };
            });

            render(<App />);

            fireEvent.click(await screen.findByRole('button', { name: /load/i }));
            expect(await screen.findByText('Prediction')).toBeInTheDocument();

            annotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
        });

        it('Stays in annotation mode if it has user annotations', async () => {
            const annotationsSpy = jest.spyOn(annotationService, 'getAnnotations').mockImplementation(async () => {
                return [getMockedAnnotation({ labels: [labelFromUser(getMockedLabel())] }, ShapeType.Rect)];
            });
            const predictionsSpy = jest.spyOn(predictionService, 'getPredictions').mockImplementation(async () => {
                return { annotations: [getMockedAnnotation({}, ShapeType.Rect)], maps: [] };
            });

            render(<App />);

            fireEvent.click(await screen.findByRole('button', { name: /load/i }));
            expect(await screen.findByText('Annotation')).toBeInTheDocument();

            annotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
        });

        it('Stays in prediction mode when refreshing annotations', async () => {
            const RefreshableApp = () => {
                const { mode, setMode, selectedMediaItem, setSelectedMediaItem } = useAnnotator();
                const { refresh } = usePrediction();

                const loadMediaItem = () => setSelectedMediaItem(mediaItem);

                if (selectedMediaItem === undefined) {
                    return <button onClick={loadMediaItem}>Load</button>;
                }

                return (
                    <div>
                        <span>{mode === ANNOTATOR_MODE.ANNOTATION ? 'Annotation' : 'Prediction'}</span>
                        <button onClick={() => setMode(ANNOTATOR_MODE.PREDICTION)}>Select prediction mode</button>
                        <button onClick={() => refresh.mutate()}>Refresh</button>
                        <ul>
                            {selectedMediaItem.predictions?.annotations.map((annotation) => {
                                return <li key={annotation.id}>{annotation.id}</li>;
                            })}
                        </ul>
                    </div>
                );
            };

            const project = await projectService.getProject(projectIdentifier);

            const labels = [labelFromModel(project.labels[0], 0.7)];

            // We mimick a user having annotations for this media item so they will have
            // to manually select prediction mode
            const annotationsSpy = jest.spyOn(annotationService, 'getAnnotations').mockImplementation(async () => {
                return [getMockedAnnotation({ labels }, ShapeType.Rect)];
            });
            const predictionsSpy = jest.spyOn(predictionService, 'getPredictions').mockImplementation(async () => {
                return {
                    annotations: [getMockedAnnotation({ id: 'prediction-1', labels }, ShapeType.Rect)],
                    maps: [],
                };
            });

            render(<RefreshableApp />);

            fireEvent.click(await screen.findByRole('button', { name: /load/i }));

            // Check that the media item was loaded
            expect(await screen.findByText('Annotation')).toBeInTheDocument();
            expect(screen.getAllByRole('listitem')).toHaveLength(1);

            // Switch to prediction mode
            fireEvent.click(screen.getByRole('button', { name: 'Select prediction mode' }));
            expect(screen.getByText('Prediction')).toBeInTheDocument();

            // Refresh predictions and mock the service so that we get new predictions
            predictionsSpy.mockImplementation(async () => {
                return {
                    annotations: [
                        getMockedAnnotation({ id: 'prediction-1', labels }, ShapeType.Rect),
                        getMockedAnnotation({ id: 'prediction-2', labels }, ShapeType.Rect),
                    ],
                    maps: [],
                };
            });
            fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

            // Check that after getting new predictions we remain on the prediction mode
            await waitFor(() => {
                expect(screen.getAllByRole('listitem')).toHaveLength(2);
            });
            expect(screen.getByText('Prediction')).toBeInTheDocument();

            annotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
        });
    });
});
