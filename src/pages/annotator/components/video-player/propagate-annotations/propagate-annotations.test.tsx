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

import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';

import { Annotation, ShapeType } from '../../../../../core/annotations';
import { VideoFrame } from '../../../../../core/media';
import {
    getMockedAnnotation,
    getMockedTask,
    getMockedVideoFrameMediaItem,
    mockedProjectContextProps,
    mockedTaskContextProps,
} from '../../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../../project-details/providers';
import { useSubmitAnnotations, useTask } from '../../../providers';
import { UseSubmitAnnotationsMutationResult } from '../../../providers/submit-annotations-provider/submit-annotations.interface';
import { usePropagateAnnotations } from '../hooks';
import { VideoControls } from '../video-controls/video-controls.interface';
import { providersRender as render } from './../../../../../test-utils/';
import { PropagateAnnotations } from './propagate-annotations.component';

jest.mock('../../../../project-details/providers/project-provider/project-provider.component', () => {
    return {
        ...jest.requireActual('../../../../project-details/providers/project-provider/project-provider.component'),
        useProject: jest.fn(() => ({
            isTaskChainProject: false,
            project: {},
        })),
    };
});

jest.mock('../../../providers/task-provider/task-provider.component', () => {
    return {
        ...jest.requireActual('../../../providers/task-provider/task-provider.component'),
        useTask: jest.fn(() => ({
            selectedTask: null,
        })),
    };
});

jest.mock('../../../providers/submit-annotations-provider/submit-annotations-provider.component', () => {
    return {
        ...jest.requireActual('../../../providers/submit-annotations-provider/submit-annotations-provider.component'),
        useSubmitAnnotations: jest.fn(),
    };
});

jest.mock('uuid', () => {
    const actual = jest.requireActual('uuid');
    return {
        ...actual,
        v4: jest.fn(),
    };
});

describe('Propagate annotations', () => {
    jest.mocked(useSubmitAnnotations).mockImplementation(() => {
        const submitAnnotationsMutation = {
            mutate: ({ callback }) => {
                if (callback) {
                    callback();
                }
            },
        } as UseSubmitAnnotationsMutationResult;

        return {
            confirmSaveAnnotations: jest.fn(),
            setUnfinishedShapeCallback: jest.fn(),
            submitAnnotationsMutation,
        };
    });

    const videoFrame = getMockedVideoFrameMediaItem({});
    const videoFrames = [videoFrame, { ...videoFrame, identifier: { ...videoFrame.identifier, frameNumber: 30 } }];
    const currentAnnotations = [getMockedAnnotation({ id: 'test-1' })];
    const videoControls: VideoControls = {
        canSelectPrevious: true,
        previous: jest.fn(),
        canSelectNext: true,
        isPlaying: false,
        next: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
        goto: jest.fn(),
    };

    const App = ({
        annotations,
        userAnnotations,
        saveAnnotations,
    }: {
        annotations: Annotation[];
        userAnnotations: Annotation[];
        saveAnnotations: (videoFrame: VideoFrame, annotations: ReadonlyArray<Annotation>) => Promise<void>;
    }) => {
        const getAnnotations = jest.fn().mockImplementation(() => userAnnotations);

        const { isDisabled, propagateAnnotationsMutation, showReplaceOrMergeDialog } = usePropagateAnnotations(
            videoControls,
            videoFrame,
            videoFrames,
            annotations,
            getAnnotations,
            saveAnnotations
        );

        return (
            <PropagateAnnotations
                isDisabled={isDisabled}
                propagateAnnotationsMutation={propagateAnnotationsMutation}
                showReplaceOrMergeDialog={showReplaceOrMergeDialog}
            />
        );
    };
    const renderPropogateAnnotations = async (annotations: Annotation[], userAnnotations: Annotation[]) => {
        const saveAnnotations = jest.fn();

        render(<App annotations={annotations} userAnnotations={userAnnotations} saveAnnotations={saveAnnotations} />);

        await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());

        return { saveAnnotations };
    };

    it('Propagates annotations to the next video frame', async () => {
        const { saveAnnotations } = await renderPropogateAnnotations(currentAnnotations, []);

        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());

        expect(saveAnnotations).toHaveBeenCalled();
        expect(saveAnnotations).toHaveBeenCalledWith(videoFrames[1], currentAnnotations);
    });

    it('Replaces the users old annotations', async () => {
        const userAnnotations = [getMockedAnnotation({ id: 'existing-annotation-1' })];
        const { saveAnnotations } = await renderPropogateAnnotations(currentAnnotations, userAnnotations);

        fireEvent.click(screen.getByRole('button'));

        fireEvent.click(await screen.findByRole('button', { name: /replace/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /replace/i })).toBeDisabled());

        await waitForElementToBeRemoved(screen.getByRole('dialog'));
        expect(saveAnnotations).toHaveBeenCalledWith(videoFrames[1], currentAnnotations);
    });

    it('Merges the users old annotations', async () => {
        const userAnnotations = [getMockedAnnotation({ id: 'existing-annotation-1' })];
        const { saveAnnotations } = await renderPropogateAnnotations(currentAnnotations, userAnnotations);

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(await screen.findByRole('button', { name: /merge/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /merge/i })).toBeDisabled());

        await waitForElementToBeRemoved(screen.getByRole('dialog'));
        expect(saveAnnotations).toHaveBeenCalledWith(videoFrames[1], [...userAnnotations, ...currentAnnotations]);
    });

    it('Cancels the users old annotations', async () => {
        const userAnnotations = [getMockedAnnotation({ id: 'existing-annotation-1' })];
        const { saveAnnotations } = await renderPropogateAnnotations(currentAnnotations, userAnnotations);

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));

        await waitForElementToBeRemoved(screen.getByRole('dialog'));
        expect(saveAnnotations).not.toBeCalled();
    });

    it('Is disabled when there is no next video frame', async () => {
        const PropagateAnnotationsWithEmptyVideoFrames = ({
            annotations,
            userAnnotations,
            saveAnnotations,
        }: {
            annotations: Annotation[];
            userAnnotations: Annotation[];
            saveAnnotations: (videoFrame: VideoFrame, annotations: ReadonlyArray<Annotation>) => Promise<void>;
        }) => {
            const getAnnotations = jest.fn().mockImplementation(() => userAnnotations);

            const { isDisabled, propagateAnnotationsMutation, showReplaceOrMergeDialog } = usePropagateAnnotations(
                videoControls,
                videoFrame,
                [videoFrame],
                annotations,
                getAnnotations,
                saveAnnotations
            );

            return (
                <PropagateAnnotations
                    isDisabled={isDisabled}
                    propagateAnnotationsMutation={propagateAnnotationsMutation}
                    showReplaceOrMergeDialog={showReplaceOrMergeDialog}
                />
            );
        };

        render(
            <PropagateAnnotationsWithEmptyVideoFrames
                annotations={currentAnnotations}
                userAnnotations={[]}
                saveAnnotations={jest.fn()}
            />
        );

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('Is disabled when there are no annotations to propagate', async () => {
        const saveAnnotations = jest.fn();

        render(<App annotations={[]} userAnnotations={[]} saveAnnotations={saveAnnotations} />);

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('When merging annotations with duplicated ids it creates a new annotations if those annotations were changed', async () => {
        const mockedId = 'test-new-id';
        jest.mocked(uuidv4).mockImplementation(() => mockedId);

        const oldShape = { shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 } as const;
        const userAnnotations = [
            getMockedAnnotation({ id: 'existing-annotation-1', zIndex: 1, shape: oldShape }),
            getMockedAnnotation({ id: 'existing-annotation-2', zIndex: 2 }),
        ];

        const annotationsToBeMerged = [
            getMockedAnnotation({ id: 'existing-annotation-1', zIndex: 1, shape: { ...oldShape, x: 10, y: 10 } }),
        ];

        const expectedMergedAnnotations = [
            getMockedAnnotation({ id: 'existing-annotation-1', zIndex: 1, shape: oldShape }),
            getMockedAnnotation({ id: 'existing-annotation-2', zIndex: 2 }),
            getMockedAnnotation({ id: mockedId, zIndex: 1, shape: { ...oldShape, x: 10, y: 10 } }),
        ];
        const { saveAnnotations } = await renderPropogateAnnotations(annotationsToBeMerged, userAnnotations);

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(await screen.findByRole('button', { name: /merge/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /merge/i })).toBeDisabled());

        await waitForElementToBeRemoved(screen.getByRole('dialog'));
        expect(saveAnnotations).toHaveBeenCalledWith(videoFrames[1], expectedMergedAnnotations);
    });

    it('ignores annotations that were not changed', async () => {
        const mockedId = 'test-new-id';
        jest.mocked(uuidv4).mockImplementation(() => mockedId);

        const oldShape = { shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 } as const;
        const userAnnotations = [
            getMockedAnnotation({ id: 'existing-annotation-1', zIndex: 1, shape: oldShape }),
            getMockedAnnotation({ id: 'existing-annotation-2', zIndex: 2 }),
        ];

        const annotationsToBeMerged = [userAnnotations[0]];

        const expectedMergedAnnotations = [
            getMockedAnnotation({ id: 'existing-annotation-1', zIndex: 1, shape: oldShape }),
            getMockedAnnotation({ id: 'existing-annotation-2', zIndex: 2 }),
        ];

        const { saveAnnotations } = await renderPropogateAnnotations(annotationsToBeMerged, userAnnotations);

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(await screen.findByRole('button', { name: /merge/i }));
        await waitFor(() => expect(screen.getByRole('button', { name: /merge/i })).toBeDisabled());

        await waitForElementToBeRemoved(screen.getByRole('dialog'));
        expect(saveAnnotations).toHaveBeenCalledWith(videoFrames[1], expectedMergedAnnotations);
    });

    it('Is disabled when a task chain project task is selected', async () => {
        // Simulate a task chain project where the user has selected a task
        jest.mocked(useProject).mockImplementation(() => mockedProjectContextProps({ isTaskChainProject: true }));
        jest.mocked(useTask).mockImplementation(() => mockedTaskContextProps({ selectedTask: getMockedTask({}) }));

        const saveAnnotations = jest.fn();
        render(<App annotations={currentAnnotations} userAnnotations={[]} saveAnnotations={saveAnnotations} />);

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
