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

import { useState } from 'react';

import { useMutation } from 'react-query';

import { AnnotationStatePerTask, MediaItem, MEDIA_ANNOTATION_STATUS, MEDIA_TYPE } from '../../../../core/media';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { MediaService } from '../../../../core/media/services/media-service.interface';
import { getMockedImageMediaItem } from '../../../../test-utils/mocked-items-factory';
import { ANNOTATOR_MODE } from '../../core';
import { useAnnotator } from '../../providers/annotator-provider/annotator-provider.component';
import { DatasetProvider } from '../../providers/dataset-provider/dataset-provider.component';
import { usePrediction } from '../../providers/prediction-provider/prediction-provider.component';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { fireEvent, screen, applicationRender as render, waitFor } from './../../../../test-utils';
import { SubmitButton } from './submit-button.component';

const getMockedMediaItem = (
    index = 0,
    state: AnnotationStatePerTask[] = [
        {
            task_id: `image-id-${index}`,
            state: MEDIA_ANNOTATION_STATUS.NONE,
        },
    ]
): MediaItem => {
    return getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: `${index}` },
        annotationStatePerTask: state,
    });
};

jest.mock('../../../project-details/providers/project-provider/project-provider.component', () => ({
    useProject: jest.fn(() => ({
        isSingleDomainProject: () => false,
    })),
}));

jest.mock('../../providers/task-chain-provider/task-chain-provider.component', () => ({
    useTaskChain: jest.fn(() => ({
        inputs: [],
    })),
}));

jest.mock('../../providers/task-provider/task-provider.component', () => ({
    useTask: jest.fn(() => ({
        selectedTask: null,
    })),
}));

jest.mock('../../providers/annotator-provider/annotator-provider.component', () => ({
    useAnnotator: jest.fn(),
}));

jest.mock('../../providers/prediction-provider/prediction-provider.component', () => ({
    usePrediction: jest.fn(),
}));

jest.mock('../../providers/annotation-tool-provider/annotation-tool-provider.component', () => ({
    useAnnotationToolContext: jest.fn(),
}));

jest.mock('../video-player/video-player-provider.component');
beforeEach(() => {
    (useAnnotator as jest.Mock).mockImplementation(() => {
        return { mode: ANNOTATOR_MODE.ANNOTATION };
    });
});

describe('Submit annotations button', () => {
    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    const items = [getMockedMediaItem(0), getMockedMediaItem(1), getMockedMediaItem(2), getMockedMediaItem(3)];
    const defaultMediaService = createInMemoryMediaService(items);

    const App = ({
        mediaItem,
        selectMediaItem,
        canSubmit,
        submitMutation,
        mediaService = defaultMediaService,
    }: {
        mediaItem: MediaItem;
        selectMediaItem: (mediaItem: MediaItem) => void;
        submitMutation: () => Promise<void>;
        canSubmit: boolean;
        mediaService?: MediaService;
    }) => {
        const [selectedMediaItem, setSelectedMediaItem] = useState(mediaItem);
        const mutation = useMutation(async ({ callback }: { callback?: () => Promise<void> }) => {
            await submitMutation();

            if (callback) {
                callback();
            }
        });

        return (
            <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                <SubmitButton
                    selectMediaItem={(newMediaItem) => {
                        setSelectedMediaItem(newMediaItem);
                        selectMediaItem(newMediaItem);
                    }}
                    selectedMediaItem={selectedMediaItem}
                    submit={mutation as UseSubmitAnnotationsMutationResult}
                    canSubmit={canSubmit}
                />
            </DatasetProvider>
        );
    };

    it('Submits annotations and stays if there are no unannotated media', async () => {
        const mediaItem = getMockedMediaItem(0, [{ task_id: 'fake-id', state: MEDIA_ANNOTATION_STATUS.NONE }]);
        const selectMediaItem = jest.fn();
        const submit = {
            mutate: jest.fn(),
        };
        const mediaService = createInMemoryMediaService([mediaItem]);

        await render(
            <App
                mediaService={mediaService}
                mediaItem={mediaItem}
                selectMediaItem={selectMediaItem}
                submitMutation={submit.mutate}
                canSubmit
            />
        );

        const btn = screen.getByRole('button', { name: 'Submit' });
        expect(btn).not.toBeDisabled();

        fireEvent.click(btn);

        await waitFor(() => {
            expect(submit.mutate).toHaveBeenCalled();
        });
    });

    it('Is disabled if there are no unannotated media and the user has made no changes', async () => {
        const mediaItem = items[1];
        const selectMediaItem = jest.fn();
        const submit = {
            mutate: jest.fn(),
        };
        const mediaService = createInMemoryMediaService([mediaItem]);

        await render(
            <App
                mediaService={mediaService}
                mediaItem={mediaItem}
                selectMediaItem={selectMediaItem}
                submitMutation={submit.mutate}
                canSubmit={false}
            />
        );

        const btn = screen.getByRole('button', { name: 'Submit' });
        expect(btn).toBeDisabled();
    });

    it('Submits annotations and selects the next unannotated media item from the dataset', async () => {
        const mediaItem = items[1];
        const selectMediaItem = jest.fn();
        const submit = {
            mutate: jest.fn(),
        };

        await render(
            <App mediaItem={mediaItem} selectMediaItem={selectMediaItem} submitMutation={submit.mutate} canSubmit />
        );

        const btn = screen.getByRole('button', { name: 'Submit »' });
        expect(btn).not.toBeDisabled();

        fireEvent.click(btn);

        await waitFor(() => {
            expect(selectMediaItem).toHaveBeenCalledWith(items[2]);
        });
    });

    it('Selects the next unannotated media item from the dataset when there are no changed annotations', async () => {
        const mediaItem = items[1];
        const selectMediaItem = jest.fn();
        const submit = {
            mutate: jest.fn(),
        };

        await render(
            <App
                mediaItem={mediaItem}
                selectMediaItem={selectMediaItem}
                submitMutation={submit.mutate}
                canSubmit={false}
            />
        );

        const btn = screen.getByRole('button', { name: 'Submit »' });
        expect(btn).not.toBeDisabled();

        fireEvent.click(btn);

        await waitFor(() => {
            expect(selectMediaItem).toHaveBeenCalledWith(items[2]);
        });
    });

    describe('Submitting predictions', () => {
        const usePredictionMock = {
            acceptPrediction: jest.fn(),
            userAnnotationsExist: false,
        };

        beforeEach(() => {
            (usePrediction as jest.Mock).mockImplementation(() => {
                return usePredictionMock;
            });

            (useAnnotator as jest.Mock).mockImplementation(() => {
                return { mode: ANNOTATOR_MODE.PREDICTION };
            });
        });

        it('Accepts predictions and selects the next media item', async () => {
            const mediaItem = items[1];
            const selectMediaItem = jest.fn();
            const submit = {
                mutate: jest.fn(),
            };

            await render(
                <App
                    mediaItem={mediaItem}
                    selectMediaItem={selectMediaItem}
                    submitMutation={submit.mutate}
                    canSubmit={false}
                />
            );

            const btn = screen.getByRole('button', { name: 'Accept »' });
            expect(btn).not.toBeDisabled();

            fireEvent.click(btn);

            await waitFor(() => {
                expect(usePredictionMock.acceptPrediction).toHaveBeenCalled();
                expect(selectMediaItem).toHaveBeenCalledWith(items[2]);
            });
        });

        it('Switches to annotator mode after submitting a prediction with no next media item', async () => {
            const mediaItem = items[1];
            const selectMediaItem = jest.fn();
            const submit = {
                mutate: jest.fn(),
            };
            const mediaService = createInMemoryMediaService([mediaItem]);

            const setModeMock = jest.fn();
            (useAnnotator as jest.Mock).mockImplementation(() => {
                return { mode: ANNOTATOR_MODE.PREDICTION, setMode: setModeMock };
            });

            await render(
                <App
                    mediaService={mediaService}
                    mediaItem={mediaItem}
                    selectMediaItem={selectMediaItem}
                    submitMutation={submit.mutate}
                    canSubmit={false}
                />
            );

            const btn = screen.getByRole('button', { name: 'Accept' });
            expect(btn).not.toBeDisabled();

            fireEvent.click(btn);

            await waitFor(() => {
                expect(usePredictionMock.acceptPrediction).toHaveBeenCalled();
            });
        });
    });
});
