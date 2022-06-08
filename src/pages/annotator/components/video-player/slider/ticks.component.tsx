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

import { Flex, useNumberFormatter, View } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../../core/media';
import classes from './slider.module.scss';

interface TicksProps {
    videoFrames: VideoFrame[];
    minValue: number;
    maxValue: number;
}

export const Ticks = ({ videoFrames, minValue, maxValue }: TicksProps): JSX.Element => {
    const formatter = useNumberFormatter({
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: 'compact',
    });

    // Show at least ticks at the start and end of the slider, additionally show a tick every 10
    // frames
    const amountOfTicks = Math.max(2, Math.round(videoFrames.length / 10));

    const ticks = [...new Array(amountOfTicks)].map((_, index) => index / (amountOfTicks - 1));
    const frames = maxValue - minValue;

    return (
        <Flex justifyContent='space-between' UNSAFE_className={classes.ticks}>
            {ticks.map((tick) => (
                <View key={tick}>{formatter.format(minValue + frames * tick)}f</View>
            ))}
        </Flex>
    );
};
