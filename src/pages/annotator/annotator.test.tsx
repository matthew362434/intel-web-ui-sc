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

import { fireEvent, waitFor, within } from '@testing-library/react';

import {
    Annotation,
    createInMemoryAnnotationService,
    createInmemoryPredictionService,
    labelFromModel,
} from '../../core/annotations';
import { ShapeType } from '../../core/annotations/shapetype.enum';
import { MEDIA_TYPE, MediaItem } from '../../core/media';
import { createInMemoryMediaService } from '../../core/media/services';
import { ApplicationServicesProvider } from '../../providers/application-provider/application-services-provider.component';
import { MediaUploadProvider } from '../../providers/media-upload-provider/media-upload-provider.component';
import { applicationRender as render, getById, screen } from '../../test-utils';
import {
    getMockedAnnotation,
    getMockedImageMediaItem,
    labels as mockedLabels,
} from '../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../project-details/providers';
import { AnnotatorLayout } from './annotator-layout.component';
import { Annotator } from './annotator.component';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        projectId: '123',
        workspaceId: 'workspace-id',
    }),
}));

jest.setTimeout(15000);

describe('annotator', () => {
    beforeAll(() => {
        // Immediatly load the media item's image
        Object.defineProperty(global.Image.prototype, 'src', {
            set() {
                setTimeout(() => this.onload());
            },
        });
    });

    const activeMedia: MediaItem[] = [
        getMockedImageMediaItem({
            identifier: { imageId: 'active-media', type: MEDIA_TYPE.IMAGE },
        }),
        getMockedImageMediaItem({
            identifier: { imageId: 'second-active-media', type: MEDIA_TYPE.IMAGE },
        }),
        getMockedImageMediaItem({
            identifier: { imageId: 'third-active-media', type: MEDIA_TYPE.IMAGE },
        }),
    ];

    describe('prediction mode', () => {
        const mediaService = createInMemoryMediaService();
        const annotationService = createInMemoryAnnotationService();
        const predictionService = createInmemoryPredictionService();

        const renderWithServices = async (userAnnotations: Annotation[], predictedAnnotations: Annotation[]) => {
            const getActiveMediaSpy = jest.spyOn(mediaService, 'getActiveMedia').mockImplementation(async () => {
                return { media: activeMedia };
            });

            const getAnnotationsSpy = jest.spyOn(annotationService, 'getAnnotations').mockImplementation(async () => {
                return userAnnotations;
            });
            const saveAnnotationsSpy = jest.spyOn(annotationService, 'saveAnnotations');
            const predictionsSpy = jest.spyOn(predictionService, 'getPredictions').mockImplementation(async () => {
                return { annotations: predictedAnnotations, maps: [] };
            });

            const { container } = await render(
                <ApplicationServicesProvider
                    useInMemoryEnvironment={true}
                    annotationService={annotationService}
                    predictionService={predictionService}
                >
                    <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                        <MediaUploadProvider mediaService={mediaService}>
                            <Annotator
                                mediaService={mediaService}
                                annotationService={annotationService}
                                predictionService={predictionService}
                            >
                                <AnnotatorLayout />
                            </Annotator>
                        </MediaUploadProvider>
                    </ProjectProvider>
                </ApplicationServicesProvider>
            );

            return {
                getAnnotationsSpy,
                saveAnnotationsSpy,
                predictionsSpy,
                getActiveMediaSpy,
                container,
            };
        };

        it('accepts predictions', async () => {
            const userAnnotations: Annotation[] = [];

            const predictedAnnotations = [
                getMockedAnnotation(
                    { id: 'test-prediction-annotation', labels: [labelFromModel(mockedLabels[0], 0.8)] },
                    ShapeType.Rect
                ),
            ];
            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /accept/i }));

            await waitFor(() => {
                expect(saveAnnotationsSpy).toHaveBeenCalled();
            });

            // Check that the next active media is being fetched
            expect(getAnnotationsSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), activeMedia[1]);

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('accepts predictions and replaces user annotations', async () => {
            const userAnnotations = [getMockedAnnotation({ id: 'test-annotation' }, ShapeType.Rect)];
            const predictedAnnotations = [getMockedAnnotation({ id: 'test-prediction-annotation' }, ShapeType.Rect)];
            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /select prediction mode/i }));
            screen.getAllByText(/AI prediction/i);

            fireEvent.click(screen.getByRole('button', { name: /accept/i }));
            fireEvent.click(screen.getByRole('button', { name: /replace/i }));

            await waitFor(() => {
                expect(saveAnnotationsSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), [
                    ...predictedAnnotations,
                ]);
            });

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('accepts predictions and merges with user annotations', async () => {
            const userAnnotations = [getMockedAnnotation({ id: 'test-annotation' }, ShapeType.Rect)];
            const predictedAnnotations = [getMockedAnnotation({ id: 'test-prediction-annotation' }, ShapeType.Rect)];
            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /select prediction mode/i }));

            screen.getAllByText(/AI prediction/i);

            fireEvent.click(screen.getByRole('button', { name: /accept/i }));
            fireEvent.click(screen.getByRole('button', { name: /merge/i }));

            await waitFor(() => {
                expect(saveAnnotationsSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), [
                    ...userAnnotations,
                    ...predictedAnnotations,
                ]);
            });

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('edits predictions', async () => {
            const userAnnotations: Annotation[] = [];
            const predictedAnnotations = [
                getMockedAnnotation(
                    { id: 'test-prediction-annotation', labels: [labelFromModel(mockedLabels[0], 0.8)] },
                    ShapeType.Rect
                ),
            ];

            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, container, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            await screen.findByRole('heading', { name: /annotations/i });

            predictedAnnotations.forEach((annotation) => {
                expect(getById(container, `annotation-list-item-${annotation.id}`)).toBeInTheDocument();
            });

            expect(saveAnnotationsSpy).not.toHaveBeenCalled();

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('edits predictions and replaces user annotations', async () => {
            const userAnnotations = [getMockedAnnotation({ id: 'test-annotation' }, ShapeType.Rect)];
            const predictedAnnotations = [getMockedAnnotation({ id: 'test-prediction-annotation' }, ShapeType.Rect)];
            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, container, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /select prediction mode/i }));
            screen.getAllByText(/AI prediction/i);

            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /replace/i }));
            await screen.findByRole('heading', { name: /annotations/i });

            userAnnotations.forEach((annotation) => {
                expect(getById(container, `annotation-list-item-${annotation.id}`)).not.toBeInTheDocument();
            });
            predictedAnnotations.forEach((annotation) => {
                expect(getById(container, `annotation-list-item-${annotation.id}`)).toBeInTheDocument();
            });
            expect(saveAnnotationsSpy).not.toHaveBeenCalled();

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('edits predictions and merges with user annotations', async () => {
            const userAnnotations = [getMockedAnnotation({ id: 'test-annotation' }, ShapeType.Rect)];
            const predictedAnnotations = [getMockedAnnotation({ id: 'test-prediction-annotation' }, ShapeType.Rect)];
            const { getAnnotationsSpy, saveAnnotationsSpy, predictionsSpy, container, getActiveMediaSpy } =
                await renderWithServices(userAnnotations, predictedAnnotations);

            fireEvent.click(screen.getByRole('button', { name: /select prediction mode/i }));

            screen.getAllByText(/AI prediction/i);
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /merge/i }));
            await screen.findByRole('heading', { name: /annotations/i });

            userAnnotations.forEach((annotation) => {
                expect(getById(container, `annotation-list-item-${annotation.id}`)).toBeInTheDocument();
            });
            predictedAnnotations.forEach((annotation) => {
                expect(getById(container, `annotation-list-item-${annotation.id}`)).toBeInTheDocument();
            });
            expect(saveAnnotationsSpy).not.toHaveBeenCalled();

            getAnnotationsSpy.mockRestore();
            saveAnnotationsSpy.mockRestore();
            predictionsSpy.mockRestore();
            getActiveMediaSpy.mockRestore();
        });

        it('refreshes predictions', async () => {
            const userAnnotations: Annotation[] = [];
            const predictedAnnotations = [
                getMockedAnnotation(
                    { id: 'test-prediction-annotation', labels: [labelFromModel(mockedLabels[0], 0.8)] },
                    ShapeType.Rect
                ),
            ];

            const { predictionsSpy } = await renderWithServices(userAnnotations, predictedAnnotations);

            const predictionList = screen.getByRole('list', { name: 'Predicted annotations' });
            expect(within(predictionList).getAllByRole('listitem', { name: /Predicted annotation/i })).toHaveLength(1);

            predictionsSpy.mockImplementation(async () => {
                return {
                    maps: [],
                    annotations: [
                        getMockedAnnotation(
                            { id: 'test-prediction-annotation', labels: [labelFromModel(mockedLabels[0], 0.8)] },
                            ShapeType.Rect
                        ),
                        getMockedAnnotation(
                            { id: 'test-prediction-annotation-2', labels: [labelFromModel(mockedLabels[0], 0.8)] },
                            ShapeType.Rect
                        ),
                    ],
                };
            });

            fireEvent.click(screen.getByRole('button', { name: 'Refresh predictions' }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Refresh predictions' })).not.toBeDisabled();
            });

            await waitFor(() => {
                expect(within(predictionList).getAllByRole('listitem', { name: /Predicted annotation/i })).toHaveLength(
                    2
                );
            });
            expect(predictionsSpy).toHaveBeenCalledTimes(2);
        });
    });
});
