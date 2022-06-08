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

import { ButtonGroup, ActionButton } from '@adobe/react-spectrum';

import { Play, Pause, StepBackward, StepForward } from '../../../../../assets/icons';
import { useVideoKeyboardShortcuts } from '../../../hot-keys';
import primaryToolBarClasses from '../../primary-toolbar/primaryToolBar.module.scss';
import { VideoControls } from './video-controls.interface';

interface ControlsProps {
    videoControls: VideoControls;
}

export const Controls = ({ videoControls }: ControlsProps): JSX.Element => {
    useVideoKeyboardShortcuts(videoControls);

    return (
        <ButtonGroup aria-label='Video controls'>
            <ActionButton
                isQuiet
                onPress={videoControls.previous}
                aria-label='Go to previous frame'
                isDisabled={!videoControls.canSelectPrevious}
                id='video-player-go-to-previous-frame'
                UNSAFE_className={primaryToolBarClasses.primaryToolBarBtn}
            >
                <StepBackward />
            </ActionButton>
            {videoControls.isPlaying ? (
                <ActionButton
                    isQuiet
                    onPress={videoControls.pause}
                    aria-label={'Pause video'}
                    id='video-player-pause'
                    UNSAFE_className={primaryToolBarClasses.primaryToolBarBtn}
                >
                    <Pause />
                </ActionButton>
            ) : (
                <ActionButton
                    isQuiet
                    onPress={videoControls.play}
                    aria-label={'Play video'}
                    id='video-player-play'
                    UNSAFE_className={primaryToolBarClasses.primaryToolBarBtn}
                >
                    <Play />
                </ActionButton>
            )}
            <ActionButton
                isQuiet
                onPress={videoControls.next}
                aria-label='Go to next frame'
                isDisabled={!videoControls.canSelectNext}
                id='video-player-go-to-next-frame'
                UNSAFE_className={primaryToolBarClasses.primaryToolBarBtn}
            >
                <StepForward />
            </ActionButton>
        </ButtonGroup>
    );
};
