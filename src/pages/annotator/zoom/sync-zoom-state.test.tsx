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

import { SyncZoomState, SyncZoomTarget, TransformZoom, useZoom, ZoomProvider } from '.';
import {
    createInMemoryAnnotationService,
    createInmemoryPredictionService,
    labelFromUser,
} from '../../../core/annotations';
import { MEDIA_TYPE } from '../../../core/media';
import { createInMemoryMediaService } from '../../../core/media/services';
import { DOMAIN } from '../../../core/projects';
import { ApplicationProvider } from '../../../providers';
import { applicationRender as render, waitFor } from '../../../test-utils';
import { getMockedAnnotation, getMockedImageMediaItem, getMockedLabel } from '../../../test-utils/mocked-items-factory';
import { ProjectProvider, useProject } from '../../project-details/providers';
import { AnnotatorProvider, DatasetProvider, TaskProvider, useAnnotationScene, useTask } from '../providers';
import {
    SelectedMediaItemProvider,
    useSelectedMediaItem,
} from '../providers/selected-media-item-provider/selected-media-item-provider.component';

jest.mock('../providers/selected-media-item-provider/selected-media-item-provider.component', () => ({
    ...jest.requireActual('../providers/selected-media-item-provider/selected-media-item-provider.component'),
    useSelectedMediaItem: jest.fn(),
}));
jest.mock('../providers/annotation-scene-provider/annotation-scene-provider.component', () => ({
    ...jest.requireActual('../providers/annotation-scene-provider/annotation-scene-provider.component'),
    useAnnotationScene: jest.fn(),
}));

jest.mock('./zoom-provider.component', () => ({
    ...jest.requireActual('./zoom-provider.component'),
    useZoom: jest.fn(),
}));

jest.mock('../providers/task-provider/task-provider.component', () => ({
    ...jest.requireActual('../providers/task-provider/task-provider.component'),
    useTask: jest.fn(),
}));

jest.mock('../../project-details/providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../project-details/providers/project-provider/project-provider.component'),
    useProject: jest.fn(),
}));

describe('SyncZoomState', (): void => {
    beforeEach(() => {
        (useProject as jest.Mock).mockImplementation(() => ({
            project: {
                tasks: [],
            },
            isSingleDomainProject: jest.fn(),
            domains: [],
        }));

        (useSelectedMediaItem as jest.Mock).mockImplementation(() => ({
            selectedMediaItem,
        }));

        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: [],
            selectedTask: null,
            activeDomains: [],
            labels: [],
        }));

        (useAnnotationScene as jest.Mock).mockImplementation(() => ({
            annotations: [],
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const annotationService = createInMemoryAnnotationService();
    const predictionService = createInmemoryPredictionService();
    const mediaService = createInMemoryMediaService();
    const projectIdentifier = { workspaceId: 'workspace-id', projectId: 'project-id' };
    const datasetIdentifier = { ...projectIdentifier, datasetId: 'test' };
    const selectedMediaItem = {
        ...getMockedImageMediaItem({}),
        image: new Image(100, 100),
        annotations: [],
    };

    const App = () => {
        return (
            <ApplicationProvider>
                <ProjectProvider projectIdentifier={projectIdentifier}>
                    <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                        <ZoomProvider>
                            <TaskProvider>
                                <SelectedMediaItemProvider
                                    annotationService={annotationService}
                                    predictionService={predictionService}
                                >
                                    <SyncZoomState />
                                    <SyncZoomTarget />
                                    <AnnotatorProvider
                                        annotationService={annotationService}
                                        predictionService={predictionService}
                                    >
                                        <TransformZoom />
                                    </AnnotatorProvider>
                                </SelectedMediaItemProvider>
                            </TaskProvider>
                        </ZoomProvider>
                    </DatasetProvider>
                </ProjectProvider>
            </ApplicationProvider>
        );
    };

    it('sets the zoom target fitted to the screen upon mount', async () => {
        const mockSetZoomTargetOnImage = jest.fn();

        (useZoom as jest.Mock).mockImplementation(() => ({
            setZoomTarget: jest.fn(),
            setZoomTargetOnImage: mockSetZoomTargetOnImage,
            getZoomStateForTarget: jest.fn(() => ({ zoom: 1.0, translation: { x: 0, y: 0 } })),
            setZoomState: jest.fn(),
            setScreenSize: jest.fn(),
            zoomState: { zoom: {} },
        }));

        await render(<App />);

        await waitFor(() => {
            expect(mockSetZoomTargetOnImage).toHaveBeenCalledWith(selectedMediaItem);
        });
    });

    it('resets the zoomState if the image changes', async () => {
        const mockSetZoomTargetOnImage = jest.fn();
        const mockMediaItem = {
            name: 'yet another media image',
            identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'test-image-2' },
            image: {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            },
        };

        (useZoom as jest.Mock).mockImplementation(() => ({
            setZoomTarget: jest.fn(),
            setZoomTargetOnImage: mockSetZoomTargetOnImage,
            getZoomStateForTarget: jest.fn(() => ({ zoom: 1.0, translation: { x: 0, y: 0 } })),
            setZoomState: jest.fn(),
            setScreenSize: jest.fn(),
            zoomState: { zoom: {} },
        }));

        const app = await render(<App />);

        await waitFor(() => {
            expect(mockSetZoomTargetOnImage).toHaveBeenCalledWith(selectedMediaItem);
        });

        const otherSelectedMediaItem = { ...mockMediaItem, annotations: [] };
        (useSelectedMediaItem as jest.Mock).mockImplementation(() => ({
            selectedMediaItem: otherSelectedMediaItem,
        }));

        await app.rerender(<App />);

        await waitFor(() => {
            expect(mockSetZoomTargetOnImage).toHaveBeenLastCalledWith(expect.objectContaining(mockMediaItem));
        });
    });

    it('zooms into the annotation if the task is local', async () => {
        const mockSetZoomTarget = jest.fn();
        const fakeLabelOne = getMockedLabel({ id: 'fake-label-1' });
        const fakeLabelTwo = getMockedLabel({ id: 'fake-label-2' });
        const fakeAnnotation = getMockedAnnotation({
            id: 'fake-annotation',
            isSelected: true,
            labels: [labelFromUser(fakeLabelOne), labelFromUser(fakeLabelTwo)],
        });
        const fakeTasks = [
            { id: 'test-task-1', title: 'test-1', labels: [fakeLabelOne], domain: DOMAIN.DETECTION },
            { id: 'test-task-2', title: 'test-2', labels: [fakeLabelTwo], domain: DOMAIN.SEGMENTATION },
        ];

        (useAnnotationScene as jest.Mock).mockImplementation(() => ({
            annotations: [fakeAnnotation],
        }));

        (useZoom as jest.Mock).mockImplementation(() => ({
            setZoomTarget: mockSetZoomTarget,
            setZoomTargetOnImage: jest.fn(),
            getZoomStateForTarget: jest.fn(() => ({ zoom: 1.0, translation: { x: 0, y: 0 } })),
            setZoomState: jest.fn(),
            setScreenSize: jest.fn(),
            zoomState: { zoom: {} },
        }));

        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: fakeTasks,
            selectedTask: fakeTasks[1],
            activeDomains: [fakeTasks[1].domain],
            labels: fakeTasks[1].labels,
        }));

        (useProject as jest.Mock).mockImplementation(() => ({
            project: {
                tasks: fakeTasks,
            },
            isSingleDomainProject: jest.fn(),
            domains: [],
        }));

        await render(<App />);

        await waitFor(() => {
            expect(mockSetZoomTarget).toHaveBeenLastCalledWith(expect.any(Function));
        });
    });

    it('resets zoom if it was zoomed into an annotation and the user changes images', async () => {
        const mockSetZoomTarget = jest.fn();
        const mockSetZoomTargetOnImage = jest.fn();
        const mockMediaItem = getMockedImageMediaItem({
            name: 'yet another media image',
            identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'test-image-2' },
        });
        const fakeLabelOne = getMockedLabel({ id: 'fake-label-1' });
        const fakeLabelTwo = getMockedLabel({ id: 'fake-label-2' });
        const fakeAnnotation = getMockedAnnotation({
            id: 'fake-annotation',
            isSelected: true,
            labels: [labelFromUser(fakeLabelOne), labelFromUser(fakeLabelTwo)],
        });
        const fakeTasks = [
            { id: 'test-task-1', title: 'test-1', labels: [fakeLabelOne], domain: DOMAIN.DETECTION },
            { id: 'test-task-2', title: 'test-2', labels: [fakeLabelTwo], domain: DOMAIN.SEGMENTATION },
        ];

        (useAnnotationScene as jest.Mock).mockImplementation(() => ({
            annotations: [fakeAnnotation],
        }));

        (useZoom as jest.Mock).mockImplementation(() => ({
            setZoomTarget: mockSetZoomTarget,
            setZoomTargetOnImage: mockSetZoomTargetOnImage,
            getZoomStateForTarget: jest.fn(() => ({ zoom: 1.0, translation: { x: 0, y: 0 } })),
            setZoomState: jest.fn(),
            setScreenSize: jest.fn(),
            zoomState: { zoom: {} },
        }));

        (useTask as jest.Mock).mockImplementation(() => ({
            tasks: fakeTasks,
            selectedTask: fakeTasks[1],
            activeDomains: [fakeTasks[1].domain],
            labels: fakeTasks[1].labels,
        }));

        (useProject as jest.Mock).mockImplementation(() => ({
            project: {
                tasks: fakeTasks,
            },
            isSingleDomainProject: jest.fn(),
            domains: [],
        }));

        const app = await render(<App />);

        await waitFor(() => {
            expect(mockSetZoomTarget).toHaveBeenLastCalledWith(expect.any(Function));
        });

        const otherSelectedMediaItem = { ...mockMediaItem, annotations: [], image: new Image(100, 100) };
        (useSelectedMediaItem as jest.Mock).mockImplementation(() => ({
            selectedMediaItem: otherSelectedMediaItem,
        }));

        await app.rerender(<App />);

        await waitFor(() => {
            expect(mockSetZoomTargetOnImage).toHaveBeenLastCalledWith(expect.objectContaining(mockMediaItem));
        });
    });
});
