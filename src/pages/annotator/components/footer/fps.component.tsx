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

import { useNumberFormatter } from '@adobe/react-spectrum';
import { Flex } from '@react-spectrum/layout';
import { View } from '@react-spectrum/view';

import { Fps } from '../../../../assets/icons';
import { VideoFrame, Video } from '../../../../core/media';
import classes from './footer.module.scss';

export const FPS = ({ mediaItem }: { mediaItem: Video | VideoFrame }): JSX.Element => {
    const formatter = useNumberFormatter({
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <View UNSAFE_className={classes.metaItem}>
            <Flex alignItems='center' gap='size-100' height='100%'>
                <Fps />
                <span style={{ fontSize: '11px' }} id='video-fps'>
                    {formatter.format(mediaItem.metadata.fps)} fps
                </span>
            </Flex>
        </View>
    );
};
