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

import { Flex, View, Text, ActionButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { Undo, Redo } from '../../../../../assets/icons';
import { VideoFrame } from '../../../../../core/media';
import { DurationFormat } from '../../../../../pages/annotator/components/footer/duration.component';
import { Controls } from '../../../../../pages/annotator/components/video-player/video-controls/video-controls.component';
import { VideoControls } from '../../../../../pages/annotator/components/video-player/video-controls/video-controls.interface';
import { useUndoRedo } from '../../../../../pages/annotator/tools';

const UndoRedoButtons = (): JSX.Element => {
    const { undo, canUndo, redo, canRedo } = useUndoRedo();

    return (
        <Flex gap='size-100' alignItems='center' justify-content='center'>
            <TooltipTrigger placement='right'>
                <ActionButton id='undo-button' data-testid='undo-button' onPress={undo} isDisabled={!canUndo} isQuiet>
                    <Undo />
                </ActionButton>
                <Tooltip>Undo</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger placement='right'>
                <ActionButton id='redo-button' data-testid='redo-button' onPress={redo} isDisabled={!canRedo} isQuiet>
                    <Redo />
                </ActionButton>
                <Tooltip>Redo</Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};

export const VideoNavigation = ({
    videoFrame,
    videoControls,
}: {
    videoFrame: VideoFrame;
    videoControls: VideoControls;
}) => {
    return (
        <View gridArea='controls'>
            <Flex gap='size-200' alignItems='center'>
                <Controls videoControls={videoControls} />

                <Text>
                    <span id='video-current-frame-number' aria-label='Currently selected frame number'>
                        <DurationFormat duration={videoFrame.identifier.frameNumber / videoFrame.metadata.fps} />
                    </span>{' '}
                    /
                    <DurationFormat duration={videoFrame.metadata.frames / videoFrame.metadata.fps} />
                </Text>

                <View marginStart='auto'>
                    <UndoRedoButtons />
                </View>
            </Flex>
        </View>
    );
};
