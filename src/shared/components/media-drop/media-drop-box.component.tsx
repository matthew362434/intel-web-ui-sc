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

import { DragEvent, useMemo } from 'react';

import { Flex, Image, Text, View } from '@adobe/react-spectrum';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';
import { getFilesFromDragEvent } from 'html-dir-content';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import MediaUploadIcon from '../../../assets/images/media-upload.svg';
import { Label } from '../../../core/labels';
import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import { VALID_IMAGE_TYPES, VALID_VIDEO_TYPES } from '../../../providers/media-upload-provider/media-upload.validator';
import { idMatchingFormat } from '../../../test-utils';
import { UploadMediaButton } from '../upload-media-button';
import classes from './media-drop-box.module.scss';

interface MediaDropBoxProps {
    dropBoxIcon?: string;
    dropBoxIconSize?: Responsive<DimensionValue>;
    dropBoxPendingText?: string;
    dropBoxInProgressText?: string;
    dropBoxHoverText?: string;
    anomalyLabel?: Label;
    showUploadButton?: boolean;
    isVisible?: boolean;
    onDrop: (files: File[]) => void;
}

export const EMPTY_FOLDER_WARNING_MESSAGE = 'Can`t upload empty folder';
export const DROP_BOX_PENDING_TEXT_DEFAULT = 'Drag images and videos here';
export const DROP_BOX_IN_PROGRESS_TEXT_DEFAULT = 'Release to add media in queue';
export const DROP_BOX_HOVER_TEXT_DEFAULT = 'Release to drop media';

//It needs DndProvider and HTML5Backend to work
export const MediaDropBox = ({
    dropBoxIcon = MediaUploadIcon,
    dropBoxIconSize = 'size-3000',
    dropBoxPendingText = DROP_BOX_PENDING_TEXT_DEFAULT,
    dropBoxInProgressText = DROP_BOX_IN_PROGRESS_TEXT_DEFAULT,
    dropBoxHoverText = DROP_BOX_HOVER_TEXT_DEFAULT,
    anomalyLabel,
    showUploadButton,
    isVisible,
    onDrop,
}: MediaDropBoxProps): JSX.Element => {
    const { isUploadInProgress } = useMediaUpload();

    const [{ isOver, canDrop, dropItem }, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                dropItem: monitor.getItem(),
            }),
        }),
        [isVisible, onDrop]
    );

    const { addNotification } = useNotification();

    const isPointerEventsActivated = useMemo(() => canDrop && !!dropItem?.files, [canDrop, dropItem]);

    const getDropBoxText = (): string => {
        if (isUploadInProgress) {
            if (!!anomalyLabel) {
                return isOver ? dropBoxInProgressText : dropBoxPendingText;
            } else {
                return dropBoxInProgressText;
            }
        } else {
            return canDrop && isOver ? dropBoxHoverText : dropBoxPendingText;
        }
    };

    return (
        <div
            ref={drop}
            onDrop={(event: DragEvent<HTMLDivElement>) => {
                getFilesFromDragEvent(event, true).then((files: File[]) => {
                    if (files.length > 0) {
                        onDrop(files);
                    } else {
                        addNotification(EMPTY_FOLDER_WARNING_MESSAGE, NOTIFICATION_TYPE.DEFAULT);
                    }
                });
            }}
            className={classes.dropRef}
            style={{ pointerEvents: isPointerEventsActivated ? 'initial' : 'none' }}
        >
            <View
                width='100%'
                height='100%'
                backgroundColor='gray-100'
                isHidden={!((canDrop && isOver) || isVisible)}
                UNSAFE_style={{ userSelect: 'none' }}
            >
                <Flex direction='column' width='100%' height='100%' alignItems='center' justifyContent='center'>
                    <Image src={dropBoxIcon} alt='td' width={dropBoxIconSize} height={dropBoxIconSize} />
                    <Text>{getDropBoxText()}</Text>
                    <View marginY='size-200' isHidden={!showUploadButton}>
                        <UploadMediaButton
                            id={`upload-media-${!!anomalyLabel ? idMatchingFormat(anomalyLabel.name) : 'button-id'}`}
                            title='Upload'
                            variant='cta'
                            regularButton={true}
                            uploadCallback={(files: File[]) => onDrop(files)}
                        />
                    </View>
                    <Text UNSAFE_className={classes.ext}>{VALID_IMAGE_TYPES.join(', ')}</Text>
                    <Text UNSAFE_className={classes.ext}>{VALID_VIDEO_TYPES.join(', ')}</Text>
                </Flex>
            </View>
        </div>
    );
};
