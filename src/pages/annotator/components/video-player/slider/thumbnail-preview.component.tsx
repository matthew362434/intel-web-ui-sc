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

import { Image, View } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../../core/media';
import { AnnotationIndicator } from '../../../../../shared/components';
import { DurationFormat } from '../../footer/duration.component';
import { FrameNumberIndicator } from '../../sidebar/dataset/dataset-list-item.component';

interface ThumbnailPreviewProps {
    videoFrame: VideoFrame;
    width: number;
    height: number;
    x: number;
}

export const ThumbnailPreview = ({ videoFrame, width, height, x }: ThumbnailPreviewProps): JSX.Element => {
    const frameNumber = videoFrame.identifier.frameNumber;
    const fps = videoFrame.metadata.fps;
    const src = videoFrame.thumbnailSrc;

    return (
        <View
            position='absolute'
            top={-height - 25}
            left={x - width / 2}
            overflow='hidden'
            borderRadius='small'
            UNSAFE_style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.38)' }}
        >
            <View position='fixed'>
                <AnnotationIndicator mediaItem={videoFrame} />
                <FrameNumberIndicator frameNumber={frameNumber} />
                <Image
                    src={src}
                    alt={`Thumbnail for frame ${frameNumber}`}
                    objectFit='cover'
                    height={height}
                    width={width}
                />
                <View
                    backgroundColor='gray-50'
                    paddingX='size-75'
                    paddingY='size-25'
                    alignSelf='center'
                    UNSAFE_style={{ color: 'white', fontSize: '11px', textAlign: 'center' }}
                >
                    <DurationFormat duration={frameNumber / fps} />
                </View>
                <View backgroundColor='static-white' width='1px' marginX='auto' height='size-200'>
                    &nbsp;
                </View>
            </View>
        </View>
    );
};
