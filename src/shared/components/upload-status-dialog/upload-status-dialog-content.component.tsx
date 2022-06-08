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

import { Flex, View } from '@adobe/react-spectrum';

import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import {
    ErrorListItem,
    ProgressListItem,
    SuccessListItem,
} from '../../../providers/media-upload-provider/media-upload.interface';
import { UploadStatusDialogItem, UploadStatusDialogItemTypes } from './upload-status-dialog-item.component';

export const UploadStatusDialogContent = (): JSX.Element => {
    const { progressList, successList, errorList } = useMediaUpload();

    return (
        <View backgroundColor='gray-50' position='relative' padding={'size-150'}>
            <Flex direction='column' height={'size-3600'} UNSAFE_style={{ overflowY: 'scroll' }} gap={'size-100'}>
                <>
                    {errorList.map((item: ErrorListItem) => (
                        <UploadStatusDialogItem
                            key={item.uploadId}
                            item={item}
                            type={UploadStatusDialogItemTypes.ERROR}
                        />
                    ))}
                    {progressList.map((item: ProgressListItem) => (
                        <UploadStatusDialogItem
                            key={item.uploadId}
                            type={UploadStatusDialogItemTypes.PROGRESS}
                            item={item}
                        />
                    ))}
                    {successList.map((item: SuccessListItem) => (
                        <UploadStatusDialogItem
                            key={item.uploadId}
                            type={UploadStatusDialogItemTypes.SUCCESS}
                            item={item}
                        />
                    ))}
                </>
            </Flex>
        </View>
    );
};
