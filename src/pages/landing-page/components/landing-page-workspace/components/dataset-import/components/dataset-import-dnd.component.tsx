// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { ChangeEvent, Dispatch, DragEvent, SetStateAction, useRef } from 'react';

import { Button, Flex, Text, View } from '@adobe/react-spectrum';
import { getFilesFromDragEvent } from 'html-dir-content';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { DatasetImport as DatasetImportIcon } from '../../../../../../../assets/icons';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../../../notification';
import classes from '../dataset-import.module.scss';

const FILE_FORMAT_ERROR_MESSAGE = 'Only zip files are allowed for upload';

interface DatasetImportDndProps {
    addUpload: (file: File) => string;
    setActiveUploadId: Dispatch<SetStateAction<string | undefined>>;
}

export const DatasetImportDnd = ({ addUpload, setActiveUploadId }: DatasetImportDndProps): JSX.Element => {
    const { addNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        []
    );

    const processUpload = (file: File) => {
        try {
            setActiveUploadId(addUpload(file));
        } catch (e) {
            addNotification(FILE_FORMAT_ERROR_MESSAGE, NOTIFICATION_TYPE.ERROR);
        } finally {
            fileInputRef.current.value = '';
        }
    };

    const onFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = event.target.files;

        if (!files?.length) return;

        processUpload(files[0]);
    };

    return (
        <div
            ref={drop}
            onDrop={(event: DragEvent<HTMLDivElement>) => {
                getFilesFromDragEvent(event, true).then((files: File[]) => {
                    if (!files?.length) return;
                    processUpload(files[0]);
                });
            }}
            className={classes.uploadPanelContent}
        >
            {isOver && canDrop && (
                <View
                    position='absolute'
                    width='100%'
                    height='100%'
                    backgroundColor='gray-500'
                    UNSAFE_style={{ opacity: 0.4 }}
                    zIndex={1}
                />
            )}
            <Flex height='100%' direction='column' alignItems='center' justifyContent='center' gap='size-250'>
                <View>
                    <DatasetImportIcon />
                </View>
                <View>
                    <Flex direction='column' alignItems='center' gap='size-200'>
                        <Text>Drop the dataset .zip file here</Text>
                        <Button variant='cta' onPress={() => fileInputRef.current.click()}>
                            Upload
                        </Button>
                        <input
                            type='file'
                            hidden={true}
                            ref={fileInputRef}
                            onChange={onFileInputChange}
                            onClick={() => (fileInputRef.current.value = '')}
                            style={{ pointerEvents: 'all' }}
                            accept='.zip'
                        />
                        <Text UNSAFE_className={classes.extentions}>(COCO, YOLO, VOC) .zip</Text>
                    </Flex>
                </View>
            </Flex>
        </div>
    );
};
