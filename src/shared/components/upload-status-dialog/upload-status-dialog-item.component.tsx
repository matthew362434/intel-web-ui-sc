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

import { useMemo } from 'react';

import {
    ActionButton,
    DialogTrigger,
    Flex,
    Link,
    ProgressCircle,
    Text,
    Tooltip,
    TooltipTrigger,
    View,
} from '@adobe/react-spectrum';
import { IconColorValue } from '@react-types/shared/src/dna';
import AlertCircle from '@spectrum-icons/workflow/AlertCircle';
import RotateCCWBold from '@spectrum-icons/workflow/RotateCCWBold';
import filesize from 'file-size';

import { AcceptCircle, Alert, Image, Play } from '../../../assets/icons';
import { COLOR_MODE } from '../../../assets/icons/color-mode.enum';
import { MEDIA_TYPE } from '../../../core/media';
import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import {
    ErrorListItem,
    ProgressListItem,
    SuccessListItem,
    ValidationFailStatus,
} from '../../../providers/media-upload-provider/media-upload.interface';
import { TruncatedText } from '../truncated-text';
import { UploadStatusProgressBar } from '../upload-status-progress-bar';
import { UploadStatusErrorDialog } from './upload-status-error-dialog.component';

export enum UploadStatusDialogItemTypes {
    PROGRESS,
    SUCCESS,
    ERROR,
}

interface UploadStatusDialogItemProps {
    item: SuccessListItem | ErrorListItem | ProgressListItem;
    type: UploadStatusDialogItemTypes;
}
export const UploadStatusDialogItem = ({ item, type }: UploadStatusDialogItemProps): JSX.Element => {
    const { retryUpload } = useMediaUpload();

    const itemProgress = useMemo<number>(() => {
        if (type === UploadStatusDialogItemTypes.PROGRESS) {
            return (item as ProgressListItem).progress;
        }

        return 100;
    }, [type, item]);

    const typeColor = useMemo<IconColorValue>(() => {
        switch (type) {
            case UploadStatusDialogItemTypes.PROGRESS:
                return 'informative';
            case UploadStatusDialogItemTypes.SUCCESS:
                return 'positive';
            case UploadStatusDialogItemTypes.ERROR:
                return 'negative';
        }
    }, [type]);

    const isValidationError = useMemo<boolean>(() => {
        if (type !== UploadStatusDialogItemTypes.ERROR) return false;
        const errorItem = item as ErrorListItem;
        return errorItem.status < 0 || errorItem.status === 415;
    }, [type, item]);

    const statusColumnContent = useMemo<JSX.Element>(() => {
        switch (type) {
            case UploadStatusDialogItemTypes.PROGRESS:
                return (
                    <ProgressCircle
                        size='S'
                        marginEnd='size-75'
                        aria-label='Loading…'
                        value={(item as ProgressListItem).progress}
                        isIndeterminate={
                            (item as ProgressListItem).progress === 0 || (item as ProgressListItem).progress === 100
                        }
                    />
                );
            case UploadStatusDialogItemTypes.SUCCESS:
                return <AcceptCircle color={COLOR_MODE.POSITIVE} id={'upload-success-icon'} />;
            case UploadStatusDialogItemTypes.ERROR:
                return (
                    <Flex alignItems='center' justifyContent='end' gap='size-100'>
                        <DialogTrigger type='popover'>
                            <>
                                <Link>Error</Link>
                                <Alert color={COLOR_MODE.NEGATIVE} />
                            </>
                            <UploadStatusErrorDialog item={item as ErrorListItem} />
                        </DialogTrigger>
                        <TooltipTrigger>
                            <ActionButton
                                isQuiet
                                isDisabled={isValidationError}
                                onPress={() => retryUpload(item as ErrorListItem)}
                            >
                                <RotateCCWBold size='S' />
                            </ActionButton>
                            <Tooltip>Retry</Tooltip>
                        </TooltipTrigger>
                    </Flex>
                );
        }
    }, [type, item, isValidationError, retryUpload]);

    const baseItemIcon = useMemo<JSX.Element>(() => {
        return item.file.type.startsWith(MEDIA_TYPE.IMAGE) ? <Image width={'100%'} height={'100%'} /> : <Play />;
    }, [item]);

    const itemIcon = useMemo<JSX.Element>(() => {
        if (type === UploadStatusDialogItemTypes.ERROR) {
            const errorItem = item as ErrorListItem;
            if (errorItem.status === ValidationFailStatus.UNSUPPORTED_TYPE || errorItem.status === 415) {
                return <AlertCircle size='S' />;
            }
            return baseItemIcon;
        }
        return baseItemIcon;
    }, [baseItemIcon, item, type]);

    return (
        <Flex direction='column'>
            <Flex alignItems='center' gap='size-100' flexShrink={1} marginBottom='size-50'>
                <View width='size-400' height='size-400' backgroundColor={'gray-200'} borderRadius={'small'}>
                    <Flex
                        width={'100%'}
                        height={'100%'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        UNSAFE_style={{
                            color: 'var(--spectrum-global-color-gray-400)',
                        }}
                    >
                        {itemIcon}
                    </Flex>
                </View>
                <Flex flex={3} alignItems='center' maxWidth={300}>
                    <TruncatedText>{item.file.name}</TruncatedText>
                </Flex>
                <Flex flex={1} alignItems='center' justifyContent='center'>
                    <Text>{filesize(item.file.size).human('jedec')}</Text>
                </Flex>
                <Flex flex={1} alignItems='center' justifyContent='end'>
                    <View paddingEnd='size-150'>{statusColumnContent}</View>
                </Flex>
            </Flex>
            <UploadStatusProgressBar size='size-25' color={typeColor} progress={itemProgress} />
        </Flex>
    );
};
