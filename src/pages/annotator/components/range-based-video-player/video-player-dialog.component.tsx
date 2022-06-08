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
import { useRef, useState } from 'react';

import { Flex, View, Heading, Dialog, ButtonGroup, Button, Content, Divider } from '@adobe/react-spectrum';

import { LabeledVideoRange } from '../../../../core/annotations/labeled-video-range.interface';
import { MEDIA_TYPE, Video, VideoFrame } from '../../../../core/media';
import { DatasetIdentifier } from '../../../../core/projects';
import { VideoControls } from '../../../../pages/annotator/components/video-player/video-controls/video-controls.interface';
import { ZoomProvider } from '../../../../pages/annotator/zoom';
import { LoadingIndicator } from '../../../../shared/components';
import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import UndoRedoProvider from '../../tools/undo-redo/undo-redo-provider.component';
import useUndoRedoState from '../../tools/undo-redo/use-undo-redo-state';
import { Footer } from './footer.component';
import { useLabeledVideoRangesMutation, useLabeledVideoRangesQuery } from './use-labeled-video-ranges.hook';
import { VideoContent } from './video-content.component';
import { VideoEditor } from './video-editor/video-editor.component';

const useVideoPlayerVideoControls = (mediaItem: Video) => {
    const video = useRef<HTMLVideoElement>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [frameNumber, setFrameNumber] = useState(0);

    const fps = mediaItem.metadata.fps;

    const videoFrame: VideoFrame = {
        ...mediaItem,
        identifier: { ...mediaItem.identifier, type: MEDIA_TYPE.VIDEO_FRAME, frameNumber },
    };
    const videoControls: VideoControls = {
        canSelectNext: frameNumber < mediaItem.metadata.frames,
        canSelectPrevious: frameNumber > 0,
        isPlaying,
        goto: (newFrameNumber: number) => {
            if (video.current) {
                video.current.currentTime = newFrameNumber / fps;
            }
        },
        next: () => {
            if (video.current) {
                video.current.currentTime += 1.0;
            }
        },
        previous: () => {
            if (video.current) {
                video.current.currentTime -= 1.0;
            }
        },
        pause: () => {
            if (video.current) {
                video.current.pause();
            }
        },
        play: () => {
            if (video.current) {
                video.current.play();
            }
        },
    };

    return {
        video,
        isPlaying,
        setIsPlaying,
        videoControls,
        videoFrame,
        setFrameNumber,
    };
};

export const VideoPlayerDialog = ({
    datasetIdentifier,
    mediaItem,
    close,
}: {
    datasetIdentifier: DatasetIdentifier;
    mediaItem: Video;
    close: () => void;
}) => {
    const { video, setIsPlaying, videoControls, videoFrame, setFrameNumber } = useVideoPlayerVideoControls(mediaItem);
    const [ranges, setRanges, undoRedoState] = useUndoRedoState<LabeledVideoRange[]>([
        { start: 0, end: videoFrame.metadata.frames, labels: [] },
    ]);

    const {
        project: { labels },
    } = useProject();

    const rangesQuery = useLabeledVideoRangesQuery(datasetIdentifier, mediaItem, labels, undoRedoState.reset);
    const rangesMutation = useLabeledVideoRangesMutation(datasetIdentifier, mediaItem);

    const handleSplit = () => {
        rangesMutation.mutate(ranges, { onSuccess: close });
    };

    return (
        <Dialog width='1064px' size='L'>
            <Heading>Normal and anomaly selection</Heading>

            <Divider />

            {rangesQuery.isFetching ? (
                <Content UNSAFE_style={{ overflowY: 'visible' }} height='size-4600'>
                    <LoadingIndicator />
                </Content>
            ) : (
                <Content UNSAFE_style={{ overflowY: 'visible' }}>
                    <ZoomProvider>
                        <View borderWidth='thin' borderColor='gray-50' borderRadius='medium'>
                            <Flex direction='column'>
                                <VideoContent
                                    mediaItem={videoFrame}
                                    video={video}
                                    setIsPlaying={setIsPlaying}
                                    setFrameNumber={setFrameNumber}
                                />

                                <UndoRedoProvider state={undoRedoState}>
                                    <VideoEditor
                                        labels={labels}
                                        ranges={ranges}
                                        setRanges={setRanges}
                                        videoFrame={videoFrame}
                                        videoControls={videoControls}
                                    />
                                </UndoRedoProvider>

                                <Footer videoFrame={videoFrame} />
                            </Flex>
                        </View>
                    </ZoomProvider>
                </Content>
            )}

            <ButtonGroup isDisabled={rangesQuery.isFetching || rangesMutation.isLoading}>
                <Button variant='secondary' onPress={close}>
                    Cancel
                </Button>
                <Button variant='cta' onPress={handleSplit}>
                    {rangesMutation.isLoading ? <LoadingIndicator size='S' marginEnd='size-100' /> : <></>}
                    Split
                </Button>
            </ButtonGroup>
        </Dialog>
    );
};
