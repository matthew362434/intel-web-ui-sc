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

import { useMemo, useState } from 'react';

import { Checkbox, Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';
import { useHistory } from 'react-router-dom';

import { getAnnotationStateForTask } from '../../../../core/annotations';
import { Label } from '../../../../core/labels';
import { isImage, isVideo, isVideoFrame, MediaItem } from '../../../../core/media';
import { PATHS } from '../../../../core/services';
import { AnnotationIndicator, VideoIndicator } from '../../../../shared/components';
import { idMatchingFormat } from '../../../../test-utils';
import { useProjectIdentifier } from '../../../annotator/hooks/use-project-identifier';
import { useMedia } from '../../../media/providers/media-provider.component';
import classes from './grid-media-item.module.scss';
import { MediaItemInfo } from './media-item-info';
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from './utils';

interface GridMediaItemProps {
    mediaItem: MediaItem;
    anomalyLabel?: Label;
}

export const GridMediaItem = ({ mediaItem, anomalyLabel }: GridMediaItemProps): JSX.Element => {
    const { mediaSelection, toggleItemInMediaSelection } = useMedia();
    const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);
    const { projectId } = useProjectIdentifier();
    const { push } = useHistory();

    const imageThumbnailUrl = `${mediaItem.thumbnailSrc}?width=${THUMBNAIL_WIDTH}&height=${THUMBNAIL_HEIGHT}`;
    const annotationState = getAnnotationStateForTask(mediaItem.annotationStatePerTask);

    const isMediaItemSelected = useMemo((): boolean => {
        return mediaSelection.some((selectionItem: MediaItem) => selectionItem.thumbnailSrc === mediaItem.thumbnailSrc);
    }, [mediaItem, mediaSelection]);

    const id = useMemo(
        () =>
            isVideo(mediaItem) || isVideoFrame(mediaItem)
                ? mediaItem.identifier.videoId
                : isImage(mediaItem) && mediaItem.identifier.imageId,
        [mediaItem]
    );

    const getPrefixId = (): string => {
        let prefixId = 'grid-media-item';

        if (!!anomalyLabel) {
            prefixId = `${prefixId}-${idMatchingFormat(anomalyLabel.name)}`;
        }

        return prefixId;
    };

    const handleDblClick = (): void => {
        push(PATHS.getAnnotatorUrl(projectId));
    };

    const hoverClass = !isMediaItemSelected && !isDropDownOpen ? classes.mediaItemCheckboxContainer : '';

    return (
        <div
            id={`${getPrefixId()}-${id}`}
            className={[classes.mediaItem, isMediaItemSelected ? classes.mediaItemSelected : ''].join(' ')}
            onDoubleClick={handleDblClick}
        >
            <>
                <View
                    position='absolute'
                    top='size-50'
                    left='size-50'
                    width='size-500'
                    height='size-500'
                    zIndex={4}
                    UNSAFE_className={hoverClass}
                >
                    <Flex position='relative' justifyContent='center' alignItems='center' width='100%' height='100%'>
                        <View
                            position='absolute'
                            width='100%'
                            height='100%'
                            backgroundColor='gray-50'
                            borderRadius='regular'
                            UNSAFE_style={{ opacity: 0.9 }}
                        />
                        <Checkbox
                            aria-label='Select media item'
                            isSelected={isMediaItemSelected}
                            onChange={() => toggleItemInMediaSelection(mediaItem)}
                            UNSAFE_style={{ padding: 8 }}
                        />
                    </Flex>
                </View>

                <MediaItemInfo onOpenChange={setIsDropDownOpen} hoverClasses={hoverClass} mediaItem={mediaItem} />

                <img
                    src={imageThumbnailUrl}
                    alt={mediaItem.name}
                    width={'100%'}
                    height={THUMBNAIL_HEIGHT}
                    style={{ objectFit: 'cover' }}
                />

                <AnnotationIndicator mediaItem={mediaItem} state={annotationState} />
                {(isVideo(mediaItem) || isVideoFrame(mediaItem)) && <VideoIndicator />}
            </>
        </div>
    );
};
