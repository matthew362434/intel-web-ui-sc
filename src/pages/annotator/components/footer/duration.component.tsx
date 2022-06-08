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

import { Flex } from '@react-spectrum/layout';
import { View } from '@react-spectrum/view';

import { Time } from '../../../../assets/icons';
import { isVideoFrame, VideoFrame, Video } from '../../../../core/media';
import classes from './footer.module.scss';
import { getTimeUnits, paddedString } from './utils';

export const DurationFormat = ({ duration }: { duration: number }): JSX.Element => {
    const { hours, minutes, seconds } = getTimeUnits(duration);

    return (
        <>
            {paddedString(hours)}:{paddedString(minutes)}:{paddedString(seconds)}
        </>
    );
};

export const Duration = ({ mediaItem }: { mediaItem: Video | VideoFrame }): JSX.Element => {
    const currentTime = isVideoFrame(mediaItem) ? mediaItem.identifier.frameNumber / mediaItem.metadata.fps : 0;
    const endTime = mediaItem.metadata.duration;

    return (
        <View UNSAFE_className={classes.metaItem}>
            <Flex alignItems='center' gap='size-100' height='100%'>
                <Time />
                <span style={{ fontSize: '11px' }} id='video-duration'>
                    <DurationFormat duration={currentTime} /> / <DurationFormat duration={endTime} />
                </span>
            </Flex>
        </View>
    );
};
