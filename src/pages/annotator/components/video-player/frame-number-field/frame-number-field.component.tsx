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

import { CSSProperties } from 'react';

import { NumberField, Provider, Flex, Text } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../../core/media';
import { VideoControls } from '../video-controls/video-controls.interface';

interface FrameNumberFieldProps {
    videoFrame: VideoFrame;
    videoControls: VideoControls;
}

export const FrameNumberField = ({ videoFrame, videoControls }: FrameNumberFieldProps): JSX.Element => {
    return (
        <Provider scale='large'>
            <div
                style={
                    {
                        '--spectrum-global-dimension-size-400': 'var(--spectrum-global-dimension-size-300)',
                        '--spectrum-alias-single-line-height': 'var(--spectrum-global-dimension-size-300)',
                        '--spectrum-global-dimension-size-150': 'var(--spectrum-global-dimension-size-100)',
                    } as CSSProperties
                }
            >
                <Flex alignItems='center' gap='size-100'>
                    <NumberField
                        value={videoFrame.identifier.frameNumber}
                        onChange={videoControls.goto}
                        minValue={0}
                        maxValue={videoFrame.metadata.frames}
                        step={videoFrame.metadata.frameStride}
                        aria-label='Select video frame number'
                        id='video-player-frame-number-field-input'
                    />
                    <Text>/ {videoFrame.metadata.frames}f</Text>
                </Flex>
            </div>
        </Provider>
    );
};
