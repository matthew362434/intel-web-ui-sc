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

import { Flex } from '@adobe/react-spectrum';

import { isVideo, isVideoFrame, MediaItem } from '../../../../core/media';
import { TruncatedText } from '../../../../shared/components/truncated-text';
import { Duration } from './duration.component';
import classes from './footer.module.scss';
import { FPS } from './fps.component';

export const MediaItemMetadata = ({ mediaItem }: { mediaItem: MediaItem }): JSX.Element => {
    const { width, height } = mediaItem.metadata;

    return (
        <Flex>
            <div className={`${classes.text} ${classes.metaItem}`}>
                <TruncatedText width={140} classes={`${classes.text} ${classes.mediaName}`}>
                    {mediaItem.name}
                </TruncatedText>
                <span className={classes.text}>{`(${width}px x ${height}px)`}</span>
            </div>
            {isVideo(mediaItem) || isVideoFrame(mediaItem) ? <FPS mediaItem={mediaItem} /> : <></>}
            {isVideoFrame(mediaItem) ? <Duration mediaItem={mediaItem} /> : <></>}
        </Flex>
    );
};
