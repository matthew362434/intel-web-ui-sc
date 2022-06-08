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
import { Dispatch, Key, SetStateAction, useMemo, useState } from 'react';

import { ActionButton, AlertDialog, DialogContainer, Flex, View } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../../../assets/icons';
import { isVideo, isVideoFrame, MediaIdentifier, MediaItem, MEDIA_TYPE } from '../../../../../core/media';
import { DatasetIdentifier } from '../../../../../core/projects';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../notification';
import { ButtonWithTooltip, MenuTrigger } from '../../../../../shared/components';
import { VideoPlayerDialog } from '../../../../annotator/components/range-based-video-player/video-player-dialog.component';
import { useDatasetIdentifier } from '../../../../annotator/hooks/use-dataset-identifier.hook';
import { useMediaItemQuery } from '../../../../annotator/providers/selected-media-item-provider/use-media-item-query.hook';
import { useMedia } from '../../../../media/providers/media-provider.component';
import { MediaItemTooltipMessage, MediaItemTooltipMessageProps } from './media-item-tooltip-message';
import { getMediaItemTooltipProps } from './utils';

interface MediaItemInfoProps {
    hoverClasses: string;
    mediaItem: MediaItem;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}

const useVideoMediaItemQuery = (datasetIdentifier: DatasetIdentifier, mediaItem: MediaItem) => {
    const videoId: MediaIdentifier | undefined = isVideo(mediaItem)
        ? mediaItem.identifier
        : isVideoFrame(mediaItem)
        ? {
              type: MEDIA_TYPE.VIDEO,
              videoId: mediaItem.identifier.videoId,
          }
        : undefined;

    return useMediaItemQuery(datasetIdentifier, videoId, {});
};

export const MediaItemInfo = ({ hoverClasses, mediaItem, onOpenChange }: MediaItemInfoProps): JSX.Element => {
    const { deleteMedia, loadNextMedia } = useMedia();
    const { addNotification } = useNotification();
    const tooltipProps: MediaItemTooltipMessageProps = useMemo(() => getMediaItemTooltipProps(mediaItem), [mediaItem]);

    const question = `Are you sure you want to delete ${mediaItem.name}?`;
    const items = ['Delete'];

    const datasetIdentifier = useDatasetIdentifier();
    const videoMediaItemQuery = useVideoMediaItemQuery(datasetIdentifier, mediaItem);
    const videoMediaItemForDialog = isVideo(mediaItem) ? mediaItem : videoMediaItemQuery.data;
    if (videoMediaItemForDialog !== undefined) {
        items.push('Split');
    }

    const handleDelete = () => {
        deleteMedia([mediaItem])
            .then(() => loadNextMedia(true))
            .catch((error) => {
                const { message } = error.response.data;
                addNotification(`Media cannot be deleted. ${message}`, NOTIFICATION_TYPE.ERROR);
            });
    };

    const [dialog, setDialog] = useState<Key>();

    return (
        <View
            position={'absolute'}
            right={'size-50'}
            top={'size-50'}
            backgroundColor={'gray-50'}
            borderRadius='regular'
            UNSAFE_style={{ opacity: 0.9, boxSizing: 'border-box' }}
            paddingY={'size-150'}
            paddingX={'size-75'}
            height={'size-500'}
            UNSAFE_className={hoverClasses}
            zIndex={100}
        >
            <Flex alignItems={'center'} height={'100%'}>
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    variant={'cta'}
                    content={<InfoOutline />}
                    tooltipProps={{ children: <MediaItemTooltipMessage {...tooltipProps} />, placement: 'bottom' }}
                    isQuiet
                />
                <MenuTrigger
                    id='More'
                    quiet
                    items={items}
                    onOpenChange={onOpenChange}
                    onAction={(action) => {
                        setDialog(action);
                    }}
                />
                <DialogContainer
                    onDismiss={() => {
                        setDialog(undefined);
                    }}
                >
                    {dialog === 'delete' && (
                        <AlertDialog
                            title='Delete'
                            variant='destructive'
                            primaryActionLabel='Delete'
                            onPrimaryAction={handleDelete}
                            cancelLabel={'Cancel'}
                        >
                            {question}
                        </AlertDialog>
                    )}
                    {dialog === 'split' &&
                        videoMediaItemForDialog !== undefined &&
                        isVideo(videoMediaItemForDialog) && (
                            <VideoPlayerDialog
                                datasetIdentifier={datasetIdentifier}
                                mediaItem={videoMediaItemForDialog}
                                close={() => setDialog(undefined)}
                            />
                        )}
                </DialogContainer>
            </Flex>
        </View>
    );
};
