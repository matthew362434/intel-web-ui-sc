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

import { useState } from 'react';

import { useNumberFormatter, View } from '@adobe/react-spectrum';

import { getAnnotationStateForTask } from '../../../../../core/annotations';
import { isVideo, isVideoFrame, MEDIA_TYPE, MediaItem } from '../../../../../core/media';
import { AnnotationIndicator, VideoIndicator } from '../../../../../shared/components';
import { ImagePlaceholder } from '../../../../../shared/components/image-placeholder';

const SELECTED_PROPS = Object.freeze({ borderColor: 'informative', borderWidth: 'thick' });

export const FrameNumberIndicator = ({ frameNumber }: { frameNumber: number }): JSX.Element => {
    const formatter = useNumberFormatter({
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
        notation: 'compact',
    });
    return (
        <View
            position='absolute'
            backgroundColor='gray-50'
            right={4}
            top={4}
            borderRadius={'regular'}
            paddingX='size-75'
            paddingY='size-25'
            UNSAFE_style={{ color: 'white', fontSize: '12px' }}
        >
            {formatter.format(frameNumber)}f
        </View>
    );
};

interface DatasetListItemProps {
    mediaItem: MediaItem;
    isSelected: boolean;
    selectMediaItem: () => void;
}

export const DatasetListItem = ({ mediaItem, isSelected, selectMediaItem }: DatasetListItemProps): JSX.Element => {
    const [isImageLoaded, setImageLoaded] = useState<boolean>(false);
    const selectedProps = isSelected ? SELECTED_PROPS : {};
    const id =
        mediaItem.identifier.type === MEDIA_TYPE.IMAGE ? mediaItem.identifier.imageId : mediaItem.identifier.videoId;

    const annotationState = getAnnotationStateForTask(mediaItem.annotationStatePerTask);

    return (
        <View position='relative' height='100%' width='100%' {...selectedProps}>
            <div
                id={`image-${id}`}
                onClick={selectMediaItem}
                style={{ position: 'relative', width: 'inherit', height: 'inherit', cursor: 'pointer' }}
            >
                {!isImageLoaded && <ImagePlaceholder />}
                <img
                    width='100%'
                    height='100%'
                    alt={mediaItem.name}
                    src={mediaItem.thumbnailSrc}
                    style={{ display: isImageLoaded ? 'block' : 'none' }}
                    onLoad={() => setImageLoaded(true)}
                />
                <AnnotationIndicator mediaItem={mediaItem} state={annotationState} />
                {isVideo(mediaItem) && <VideoIndicator />}
                {isVideoFrame(mediaItem) && <FrameNumberIndicator frameNumber={mediaItem.identifier.frameNumber} />}
            </div>
        </View>
    );
};
