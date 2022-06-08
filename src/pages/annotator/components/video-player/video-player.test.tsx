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

import { useEffect, useState } from 'react';

import { act, fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { createInMemoryAnnotationService, createInmemoryPredictionService } from '../../../../core/annotations';
import { isVideoFrame, MEDIA_TYPE, VideoFrame } from '../../../../core/media';
import { createInMemoryMediaService } from '../../../../core/media/services';
import { createInMemoryProjectService, DatasetIdentifier, DOMAIN } from '../../../../core/projects';
import { API_URLS } from '../../../../core/services';
import { LoadingIndicator } from '../../../../shared/components';
import {
    getMockedVideoFrameMediaItem,
    getMockedProject,
    getMockedTask,
} from '../../../../test-utils/mocked-items-factory';
import { useDataset } from '../../providers';
import { useSelectedMediaItem } from '../../providers/selected-media-item-provider/selected-media-item-provider.component';
import { useSubmitAnnotations } from '../../providers/submit-annotations-provider/submit-annotations-provider.component';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { useTask } from '../../providers/task-provider/task-provider.component';
import { annotatorRender } from '../../test-utils/annotator-render';
import { VideoPlayerProvider } from './video-player-provider.component';
import { VideoPlayer } from './video-player.component';

const datasetIdentifier = {
    workspaceId: 'test-workspace',
    projectId: 'test-project',
    datasetId: 'test-dataset',
};

jest.mock('../../hooks/use-dataset-identifier.hook', () => ({
    useDatasetIdentifier: jest.fn(() => {
        return datasetIdentifier;
    }),
}));

jest.mock('../../providers/submit-annotations-provider/submit-annotations-provider.component', () => ({
    ...jest.requireActual('../../providers/submit-annotations-provider/submit-annotations-provider.component'),
    useSubmitAnnotations: jest.fn(),
}));

const renderVideoPlayer = async (videoFrame: VideoFrame) => {
    const annotationService = createInMemoryAnnotationService();
    const predictionService = createInmemoryPredictionService();
    const mediaService = createInMemoryMediaService();

    const selectVideoFrame = jest.fn();

    jest.mocked(useSubmitAnnotations).mockImplementation(() => {
        return {
            confirmSaveAnnotations: jest.fn(),
            submitAnnotationsMutation: {} as UseSubmitAnnotationsMutationResult,
            setUnfinishedShapeCallback: jest.fn(),
        };
    });

    const App = () => {
        const { selectedMediaItem, setSelectedMediaItem } = useSelectedMediaItem();

        useEffect(() => {
            if (selectedMediaItem === undefined || !isVideoFrame(selectedMediaItem)) {
                setSelectedMediaItem(videoFrame);
            }
        }, [selectedMediaItem, setSelectedMediaItem]);

        if (selectedMediaItem !== undefined && isVideoFrame(selectedMediaItem)) {
            return <VideoPlayer />;
        }

        return <LoadingIndicator />;
    };

    annotatorRender(<App />, { datasetIdentifier, services: { annotationService, mediaService, predictionService } });

    // Loading indicator for project
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    // Loading indicator for first video frame
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    fireEvent.click(screen.getByRole('switch', { name: 'Active frames' }));

    return { annotationService, selectVideoFrame };
};

afterAll(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
});

describe('Video player', () => {
    beforeEach(() => jest.useFakeTimers());

    beforeAll(() => {
        // Immediately load the media item's image
        Object.defineProperty(global.Image.prototype, 'src', {
            set() {
                setTimeout(() => this.onload());
            },
        });
    });

    const videoFrame = getMockedVideoFrameMediaItem({});

    it('Shows video player controls', async () => {
        await renderVideoPlayer(videoFrame);
        expect(screen.getByText('Frames')).toBeInTheDocument();
    });

    const getVideoFrame = (frameNumber: number) => {
        const identifier = { ...videoFrame.identifier, frameNumber };
        const src = API_URLS.MEDIA_ITEM_SRC(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            identifier
        );

        const thumbnailSrc = API_URLS.MEDIA_ITEM_THUMBNAIL(
            datasetIdentifier.workspaceId,
            datasetIdentifier.projectId,
            datasetIdentifier.datasetId,
            identifier
        );
        return { ...videoFrame, identifier, src, thumbnailSrc };
    };

    describe('video annotator', () => {
        beforeEach(() => {
            // Immediatly load the media item's image
            Object.defineProperty(global.Image.prototype, 'src', {
                set() {
                    setTimeout(() => this.onload());
                },
            });
        });

        it('Allows opening the video annotator', async () => {
            await renderVideoPlayer(videoFrame);

            fireEvent.click(screen.getByRole('button', { name: 'Open video annotator' }));
            expect(screen.getByRole('button', { name: 'Frameskip button' })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Close video annotator' }));
            expect(screen.queryByRole('button', { name: 'Frameskip button' })).not.toBeInTheDocument();
        });
    });

    describe('video player', () => {
        it('Goes to next frame when playing the video', async () => {
            const { annotationService } = await renderVideoPlayer(videoFrame);
            const spy = jest.spyOn(annotationService, 'getAnnotations');

            fireEvent.click(screen.getByRole('button', { name: 'Play video' }));

            // By default we play 1 frame per second
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            const pauseButton = screen.getByRole('button', { name: 'Pause video' });
            await waitFor(() => {
                expect(annotationService.getAnnotations).toHaveBeenCalledWith(
                    datasetIdentifier,
                    expect.anything(),
                    getVideoFrame(videoFrame.identifier.frameNumber + videoFrame.metadata.frameStride)
                );
            });

            fireEvent.click(pauseButton);
            expect(await screen.findByRole('button', { name: 'Play video' })).toBeInTheDocument();
            spy.mockRestore();
        });

        it("Skips video frames while it's still loading a previous frame", async () => {
            const { annotationService } = await renderVideoPlayer(videoFrame);

            const spy = jest
                .spyOn(annotationService, 'getAnnotations')
                .mockImplementation(async (dataset, projectLabels, mediaItem) => {
                    if (isVideoFrame(mediaItem) && mediaItem.identifier.frameNumber === 60) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve([]);
                            }, 1000);
                        });
                    }

                    return [];
                });

            fireEvent.click(screen.getByRole('button', { name: 'Play video' }));

            // By default we play 1 frame per second
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(annotationService.getAnnotations).toHaveBeenCalledWith(
                    datasetIdentifier,
                    expect.anything(),
                    getVideoFrame(60)
                );
            });

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(annotationService.getAnnotations).toHaveBeenCalledWith(
                    datasetIdentifier,
                    expect.anything(),
                    // Frame 120 is skipped since loading annotations was slow
                    getVideoFrame(180)
                );
            });

            const pauseButton = screen.getByRole('button', { name: 'Pause video' });
            fireEvent.click(pauseButton);
            expect(await screen.findByRole('button', { name: 'Play video' })).toBeInTheDocument();

            spy.mockRestore();
        });

        it('Stops playing when manually changing a frame', async () => {
            await renderVideoPlayer(
                getMockedVideoFrameMediaItem({
                    identifier: {
                        videoId: 'test-video',
                        frameNumber: 120,
                        type: MEDIA_TYPE.VIDEO_FRAME,
                    },
                })
            );

            fireEvent.click(screen.getByRole('button', { name: 'Play video' }));
            fireEvent.click(screen.getByRole('button', { name: 'Go to next frame' }));
            expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Play video' }));
            fireEvent.click(screen.getByRole('button', { name: 'Go to previous frame' }));
            expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument();
        });
    });

    describe('Video player in active mode', () => {
        it('propagate annotations is disabled when active frames is turned on', async () => {
            await renderVideoPlayer(
                getMockedVideoFrameMediaItem({
                    identifier: {
                        videoId: 'test-video',
                        frameNumber: 120,
                        type: MEDIA_TYPE.VIDEO_FRAME,
                    },
                })
            );

            fireEvent.click(screen.getByRole('switch', { name: 'Active frames' }));

            expect(
                screen.getByRole('button', { name: 'Propagate annotations from current frame to next frame' })
            ).toBeDisabled();
        });

        it('does not switch to a different video frame when selecting a different task', async () => {
            const annotationService = createInMemoryAnnotationService();
            const predictionService = createInmemoryPredictionService();
            const mediaService = createInMemoryMediaService();
            const projectService = createInMemoryProjectService();
            projectService.getProject = async () => {
                return getMockedProject({
                    tasks: [
                        getMockedTask({
                            id: 'detection-task',
                            domain: DOMAIN.DETECTION,
                            title: 'Detection',
                        }),
                        getMockedTask({
                            id: 'segmentation-task',
                            domain: DOMAIN.SEGMENTATION,
                            title: 'Segmentation',
                        }),
                    ],
                });
            };

            const videoFrames = [
                videoFrame,
                getMockedVideoFrameMediaItem({
                    identifier: { ...videoFrame.identifier, frameNumber: videoFrame.identifier.frameNumber + 60 },
                }),
                getMockedVideoFrameMediaItem({
                    identifier: { ...videoFrame.identifier, frameNumber: videoFrame.identifier.frameNumber + 120 },
                }),
            ];

            mediaService.getActiveMedia = jest
                .fn()
                .mockImplementation((dataset: DatasetIdentifier, mediaItemsLoadSize: number, taskId?: string) => {
                    return {
                        nextPage: '',
                        media: taskId === undefined ? videoFrames : [videoFrames[1], videoFrames[2]],
                        mediaCount: { images: 10, videos: 10 },
                    };
                });

            const selectVideoFrame = jest.fn();
            const ChangeTask = () => {
                const { setSelectedTask, tasks } = useTask();
                const { activeMediaItemsQuery } = useDataset();

                return (
                    <>
                        {activeMediaItemsQuery.isLoading ? <div role='progressbar'>Loading</div> : <></>}
                        <ul>
                            <li>
                                <button onClick={() => setSelectedTask(null)}>All tasks</button>
                            </li>
                            {tasks.map((task) => (
                                <li key={task.id}>
                                    <button onClick={() => setSelectedTask(task)}>{task.title}</button>
                                </li>
                            ))}
                        </ul>
                    </>
                );
            };

            annotatorRender(
                <VideoPlayerProvider
                    annotationService={annotationService}
                    predictionService={predictionService}
                    videoFrame={videoFrame}
                    selectVideoFrame={selectVideoFrame}
                >
                    <VideoPlayer />
                    <ChangeTask />
                </VideoPlayerProvider>,
                { datasetIdentifier, services: { annotationService, mediaService, predictionService, projectService } }
            );
            await waitForElementToBeRemoved(screen.getByRole('progressbar'));
            const slider = screen.getByRole('slider');
            expect(slider).toHaveAttribute('value', '0');

            expect(mediaService.getActiveMedia).toHaveBeenCalledWith(datasetIdentifier, 50, undefined);
            expect(selectVideoFrame).not.toHaveBeenCalled();

            // Switching to a different task should not change the video frame,
            // even if the active set does not contain the current video frame
            fireEvent.click(screen.getByRole('button', { name: /Detection/i }));
            await waitForElementToBeRemoved(screen.getByRole('progressbar'));
            expect(mediaService.getActiveMedia).toHaveBeenCalledWith(datasetIdentifier, 50, 'detection-task');
            expect(selectVideoFrame).not.toHaveBeenCalled();

            fireEvent.click(screen.getByRole('button', { name: /Segmentation/i }));
            await waitForElementToBeRemoved(screen.getByRole('progressbar'));
            expect(mediaService.getActiveMedia).toHaveBeenCalledWith(datasetIdentifier, 50, 'segmentation-task');
            expect(selectVideoFrame).not.toHaveBeenCalled();
            expect(slider).toHaveAttribute('value', '0');
        });

        it('does not allow using active frames in an anomaly task', async () => {
            const annotationService = createInMemoryAnnotationService();
            const predictionService = createInmemoryPredictionService();
            const mediaService = createInMemoryMediaService();
            const projectService = createInMemoryProjectService();
            projectService.getProject = async () => {
                return getMockedProject({
                    tasks: [
                        getMockedTask({
                            id: 'anomaly-task',
                            domain: DOMAIN.ANOMALY_CLASSIFICATION,
                            title: 'Anomaly classification',
                        }),
                    ],
                });
            };

            const selectVideoFrame = jest.fn();

            annotatorRender(
                <VideoPlayerProvider
                    annotationService={annotationService}
                    predictionService={predictionService}
                    videoFrame={videoFrame}
                    selectVideoFrame={selectVideoFrame}
                >
                    <VideoPlayer />
                </VideoPlayerProvider>,
                { datasetIdentifier, services: { annotationService, mediaService, predictionService, projectService } }
            );
            await waitForElementToBeRemoved(screen.getByRole('progressbar'));

            expect(screen.queryByRole('switch', { name: 'Active frames' })).not.toBeInTheDocument();
        });
    });

    it('resets the frameskip when switching to a different video', async () => {
        const otherVideo = {
            ...videoFrame,
            identifier: { ...videoFrame.identifier, videoId: 'other-video-id' },
            metadata: { ...videoFrame.metadata, frameStride: 20 },
        };

        const AppThatChangesSelectedVideo = () => {
            const [selectedVideoFrame, setVideoFrame] = useState(videoFrame);
            const hanldleOnClick = () => {
                setVideoFrame(otherVideo);
            };

            return (
                <VideoPlayerProvider
                    annotationService={createInMemoryAnnotationService()}
                    predictionService={createInmemoryPredictionService()}
                    videoFrame={selectedVideoFrame}
                    selectVideoFrame={jest.fn()}
                >
                    <VideoPlayer />
                    <button onClick={hanldleOnClick}>Change video</button>
                </VideoPlayerProvider>
            );
        };

        annotatorRender(<AppThatChangesSelectedVideo />);
        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        fireEvent.click(screen.getByRole('switch', { name: 'Active frames' }));

        const slider = screen.getByRole('slider');
        expect(slider).toHaveAttribute('step', '60');

        fireEvent.click(screen.getByRole('button', { name: /Change video/i }));
        expect(slider).toHaveAttribute('step', '20');
    });
});
