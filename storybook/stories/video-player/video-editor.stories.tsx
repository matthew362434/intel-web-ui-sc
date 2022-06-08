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

import { View } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { LabeledVideoRange } from '../../../src/core/annotations/';
import { VideoFrame } from '../../../src/core/media';
import { VideoEditor } from '../../../src/pages/annotator/components/range-based-video-player/video-editor/video-editor.component';
import { VideoControls } from '../../../src/pages/annotator/components/video-player/video-controls/video-controls.interface';
import UndoRedoProvider from '../../../src/pages/annotator/tools/undo-redo/undo-redo-provider.component';
import useUndoRedoState from '../../../src/pages/annotator/tools/undo-redo/use-undo-redo-state';
import { getMockedLabel, getMockedVideoFrameMediaItem } from '../../../src/test-utils/mocked-items-factory';

const fps = 30;
const duration = 20;

const mediaItem = getMockedVideoFrameMediaItem({
    name: 'Bunny.mp4',
    src: '',
    metadata: {
        duration,
        fps,
        frames: 605, // duration * fps,
        frameStride: fps,
        height: 720,
        width: 1280,
    },
});

const LABELS = [
    getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
    getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
];

const VideoPlayer = ({ mediaItem }: { mediaItem: VideoFrame }) => {
    const [frameNumber, setFrameNumber] = useState(0);

    const [ranges, setRanges, undoRedoActions] = useUndoRedoState<LabeledVideoRange[]>([
        { start: 0, end: mediaItem.metadata.frames, labels: [LABELS[0]] },
    ]);

    const videoFrame: VideoFrame = {
        ...mediaItem,
        identifier: { ...mediaItem.identifier, frameNumber },
    };

    const videoControls: VideoControls = {
        canSelectNext: true,
        canSelectPrevious: true,
        goto: (frameNumber: number) => {
            setFrameNumber(frameNumber);
            // Do nothing
        },
        isPlaying: false,
        next: () => {
            // Do nothing
        },
        previous: () => {
            // Do nothing
        },
        pause: () => {
            // Do nothing
        },
        play: () => {
            // Do nothing
        },
    };

    return (
        <View padding='size-200' width='800px'>
            <UndoRedoProvider state={undoRedoActions}>
                <VideoEditor
                    ranges={ranges}
                    setRanges={setRanges}
                    labels={LABELS}
                    videoFrame={videoFrame}
                    videoControls={videoControls}
                />
            </UndoRedoProvider>
        </View>
    );
};

export default {
    title: 'Videoplayer/VideoEditor',
    component: VideoPlayer,
} as ComponentMeta<typeof VideoPlayer>;

const Template: ComponentStory<typeof VideoPlayer> = (args) => <VideoPlayer {...args} />;

export const Default = Template.bind({});
Default.args = {
    mediaItem,
};
