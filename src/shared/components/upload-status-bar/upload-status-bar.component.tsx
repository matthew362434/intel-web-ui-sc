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

import { useEffect, useState } from 'react';

import { ActionButton, DialogTrigger, Divider, Flex, Link, ProgressCircle, Text } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { CloseSmall } from '../../../assets/icons';
import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import { TruncatedText } from '../truncated-text';
import { UploadStatusDialog } from '../upload-status-dialog';
import { UploadStatusProgressBar } from '../upload-status-progress-bar';

export const UploadStatusBar = (): JSX.Element => {
    const {
        totalProgress,
        totalWaiting,
        progressList,
        timeRemainingStr,
        successList,
        errorList,
        isUploadInProgress,
        isUploadStatusBarVisible,
        reset,
    } = useMediaUpload();

    const [isVisible, setVisible] = useState<boolean>(isUploadStatusBarVisible);

    useEffect(() => {
        setVisible(isUploadStatusBarVisible);
    }, [isUploadStatusBarVisible]);

    return (
        <>
            {isVisible && (
                <>
                    <View
                        position='absolute'
                        height='size-600'
                        width={isUploadInProgress ? '80%' : '50%'}
                        minWidth={isUploadInProgress ? 550 : 400}
                        zIndex={2}
                        left='50%'
                        bottom='size-100'
                        backgroundColor='gray-400'
                        UNSAFE_style={{ transform: 'translateX(-50%)', cursor: 'default' }}
                    >
                        <Flex width='100%' height='100%' alignItems='center' justifyContent='space-between'>
                            {isUploadInProgress ? (
                                <>
                                    <View flex={5} paddingX='size-150'>
                                        <Flex alignItems='center' justifyContent='start' flexBasis={0} minWidth={0}>
                                            <ProgressCircle
                                                size='S'
                                                marginEnd='size-75'
                                                aria-label='Loading…'
                                                value={progressList[0]?.progress}
                                                isIndeterminate={
                                                    !progressList[0]?.progress || progressList[0]?.progress === 100
                                                }
                                            />
                                            <TruncatedText>
                                                {progressList[0]?.file.name ?? 'Upload pending...'}
                                            </TruncatedText>
                                        </Flex>
                                    </View>
                                    <View flex={3} paddingX='size-150'>
                                        <Flex alignItems='center' justifyContent='center' wrap='nowrap'>
                                            <Text>{timeRemainingStr}</Text>
                                        </Flex>
                                    </View>
                                    <View flex={2} paddingX='size-150'>
                                        <Flex alignItems='center' justifyContent='center' wrap='nowrap'>
                                            <Text>{`${totalWaiting} ${totalWaiting > 1 ? 'files' : 'file'} left`}</Text>
                                        </Flex>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View flex={1} paddingX='size-150'>
                                        <TruncatedText isQuiet>{`Uploaded ${successList.length} of ${
                                            successList.length + errorList.length
                                        } ${
                                            successList.length + errorList.length > 1 ? 'files' : 'file'
                                        }`}</TruncatedText>
                                        {errorList.length > 0 && (
                                            <TruncatedText isQuiet>{` - ${errorList.length} ${
                                                errorList.length > 1 ? 'errors' : 'error'
                                            }`}</TruncatedText>
                                        )}
                                    </View>
                                </>
                            )}
                            <View flex={1} paddingX='size-150'>
                                <Flex alignItems='center' justifyContent='end'>
                                    <DialogTrigger>
                                        <Link UNSAFE_style={{ color: 'inherit' }}>Details</Link>
                                        <UploadStatusDialog />
                                    </DialogTrigger>
                                </Flex>
                            </View>
                            {!isUploadInProgress && (
                                <>
                                    <Divider size='S' orientation='vertical' />
                                    <View paddingX='size-50'>
                                        <Flex alignItems='center' justifyContent='end'>
                                            <ActionButton
                                                isQuiet
                                                onPress={() => {
                                                    setVisible(false);
                                                    reset();
                                                }}
                                            >
                                                <CloseSmall />
                                            </ActionButton>
                                        </Flex>
                                    </View>
                                </>
                            )}
                        </Flex>
                        {isUploadInProgress && (
                            <UploadStatusProgressBar trackColor='gray-600' progress={totalProgress} />
                        )}
                    </View>
                </>
            )}
        </>
    );
};
