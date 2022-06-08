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

import { View } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../../core/media';
import { NumberSlider } from '../../../../../shared/components';

interface FrameSkipInputProps {
    step: number;
    setStep: (step: number) => void;
    videoFrame: VideoFrame;
    isDisabled: boolean;
}

export const FrameSkipInput = ({ step, setStep, videoFrame, isDisabled }: FrameSkipInputProps): JSX.Element => {
    return (
        <View
            width='size-2000'
            gridArea='frameskip'
            position='sticky'
            left={0}
            top={0}
            backgroundColor='gray-100'
            paddingBottom='size-200'
        >
            <NumberSlider
                id={'frameskip'}
                onChange={setStep}
                label='Frameskip'
                ariaLabel='Frameskip'
                displayText={(value) => value}
                defaultValue={step}
                min={1}
                max={videoFrame.metadata.frames - 1}
                step={1}
                isDisabled={isDisabled}
            />
        </View>
    );
};
