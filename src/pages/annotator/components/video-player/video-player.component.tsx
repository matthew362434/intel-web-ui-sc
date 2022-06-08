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

import { Flex, Text, View, Switch, ToggleButton } from '@adobe/react-spectrum';

import { ChevronUpLight, ChevronDownLight } from '../../../../assets/icons';
import { isAnomalyDomain } from '../../../../core/projects';
import { useProject } from '../../../project-details/providers';
import { useTask } from '../../providers';
import { PropagateAnnotations } from './propagate-annotations/propagate-annotations.component';
import { VideoPlayerSlider } from './slider/slider.component';
import { getMaxVideoSliderValue } from './utils';
import { VideoAnnotator } from './video-annotator/video-annotator.component';
import { Controls } from './video-controls/video-controls.component';
import { useVideoPlayer } from './video-player-provider.component';

const SwitchActiveFrames = (): JSX.Element => {
    const { isInActiveMode, setIsInActiveMode } = useVideoPlayer();
    const { selectedTask } = useTask();
    const anomalyTaskIsSelected = selectedTask !== null && isAnomalyDomain(selectedTask.domain);

    if (anomalyTaskIsSelected) {
        return <></>;
    }

    return (
        <Switch id='video-player-switch-active-frames' onChange={setIsInActiveMode} isSelected={isInActiveMode}>
            Active frames
        </Switch>
    );
};

export const VideoPlayer = (): JSX.Element => {
    const { videoFrame, isInActiveMode, step, setStep, videoControls, propagateAnnotations, videoFrames, videoEditor } =
        useVideoPlayer();

    const { project } = useProject();

    const propagateAnnotationsIsDisabled =
        propagateAnnotations.isDisabled || !videoControls.canSelectNext || isInActiveMode;

    const isExpanded = videoEditor.isEnabled;
    const setIsExpanded = videoEditor.setIsEnabled;

    const maxValue = getMaxVideoSliderValue(videoFrame.metadata.frames, step);

    return (
        <View
            gridArea='videoplayer'
            height='100%'
            padding='size-100'
            paddingX='size-200'
            borderBottomWidth='thin'
            borderBottomColor='gray-50'
            backgroundColor='gray-100'
        >
            <Flex gap='size-200' direction='column'>
                <Flex gap='size-200' alignItems='center' height='100%'>
                    <Text>Frames</Text>
                    <Controls videoControls={videoControls} />
                    <Text>
                        <span id='video-current-frame-number' aria-label='Currently selected frame number'>
                            {videoFrame.identifier.frameNumber}
                        </span>{' '}
                        / {videoFrame.metadata.frames - 1}f
                    </Text>
                    <PropagateAnnotations
                        showReplaceOrMergeDialog={propagateAnnotations.showReplaceOrMergeDialog}
                        propagateAnnotationsMutation={propagateAnnotations.propagateAnnotationsMutation}
                        isDisabled={propagateAnnotationsIsDisabled}
                    />
                    <SwitchActiveFrames />

                    {isExpanded ? (
                        <Flex gap='size-100' marginStart='auto'>
                            <ToggleButton
                                onPress={() => setIsExpanded(false)}
                                isQuiet
                                isSelected
                                id={`videoplayer-fold-unfold-button`}
                                aria-label='Close video annotator'
                            >
                                <ChevronDownLight />
                            </ToggleButton>
                        </Flex>
                    ) : (
                        <>
                            <View flexGrow={1}>
                                <VideoPlayerSlider
                                    videoFrames={videoFrames}
                                    isInActiveMode={isInActiveMode}
                                    mediaItem={videoFrame}
                                    selectFrame={videoControls.goto}
                                    step={step}
                                    showTicks={false}
                                    minValue={0}
                                    maxValue={maxValue}
                                />
                            </View>
                            <ToggleButton
                                onPress={() => setIsExpanded(true)}
                                isQuiet
                                isSelected={false}
                                id={`videoplayer-fold-unfold-button`}
                                aria-label='Open video annotator'
                            >
                                <ChevronUpLight />
                            </ToggleButton>
                        </>
                    )}
                </Flex>
                {isExpanded ? (
                    <VideoAnnotator
                        setStep={setStep}
                        step={step}
                        selectFrame={videoControls.goto}
                        videoFrame={videoFrame}
                        project={project}
                        isInActiveMode={isInActiveMode}
                    />
                ) : (
                    <></>
                )}
            </Flex>
        </View>
    );
};
