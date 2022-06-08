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

import { ChangeEvent, Key, useMemo, useRef } from 'react';

import { ActionButton, Divider, Flex, Item, Menu, MenuTrigger, Text, View } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';
import AssetsAdded from '@spectrum-icons/workflow/AssetsAdded';
import DeleteOutline from '@spectrum-icons/workflow/DeleteOutline';

import { InfoOutline, MoreMenu, RotateCWBold } from '../../../../../../../assets/icons';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../../../notification';
import { UploadStatusProgressBar } from '../../../../../../../shared/components/upload-status-progress-bar';
import { capitalize } from '../../../../../../../shared/utils';
import { DatasetImportUploadItem, DATASET_IMPORT_UPLOAD_STATUSES } from '../dataset-import.interface';
import classes from '../dataset-import.module.scss';
import { useDatasetImport } from '../dataset-import.provider.component';

const FILE_FORMAT_ERROR_MESSAGE = 'Only zip files are allowed for upload';

enum MENU_ITEMS {
    CREATE = 'create',
    DELETE = 'delete',
}

interface DatasetImportListItemProps {
    uploadId: string;
}

export const DatasetImportListItem = ({ uploadId }: DatasetImportListItemProps): JSX.Element => {
    const fileInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);
    const { addNotification } = useNotification();

    const {
        uploads,
        addUpload,
        setActiveUploadId,
        setModalOpened,
        isReadyForProjectCreation,
        prepareDataset,
        createProject,
        setDeletingUpload,
    } = useDatasetImport();

    const { status, name, fileId, fileSize, progress, bytesRemaining, timeRemaining } = uploads[uploadId];

    const getStatusIcon = useMemo((): JSX.Element => {
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                return <RotateCWBold className={classes.importSpinner} />;
            case DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS:
                return <Alert size='S' UNSAFE_className={classes.warning} />;
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                return <Alert size='S' UNSAFE_className={classes.negative} />;
            default:
                return <InfoOutline />;
        }
    }, [status]);

    const getStatusMsg = useMemo((): string => {
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
                return 'Importing...';
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
                return 'Preparing...';
            case DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS:
                return 'Detected issues in the dataset';
            case DATASET_IMPORT_UPLOAD_STATUSES.READY:
                return 'Ready for project creation';
            case DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION:
                return 'Select task type';
            case DATASET_IMPORT_UPLOAD_STATUSES.LABELS_SELECTION:
                return 'Select labels';
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                return 'Project creation...';
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_INTERRUPTED:
                return 'Importing interrupted';
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
                return 'Importing error';
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
                return 'Preparing error';
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                return 'Project creation error';
            default:
                return '';
        }
    }, [status]);

    const isDetailsAvailable = useMemo((): boolean => {
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_INTERRUPTED:
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                return false;
            default:
                return true;
        }
    }, [status]);

    const getDisabledMenuItems = useMemo((): string[] => {
        const disabledItems = new Set<string>();
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                disabledItems.add(MENU_ITEMS.DELETE);
        }
        if (!isReadyForProjectCreation(uploadId)) disabledItems.add(MENU_ITEMS.CREATE);
        return Array.from(disabledItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handleMenuAction = (key: Key, uploadItem: DatasetImportUploadItem) => {
        switch (key) {
            case 'create':
                createProject(uploadItem);
                break;
            case 'delete':
                setDeletingUpload(uploadItem);
                break;
        }
    };

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
        <View backgroundColor='gray-75' height={115} marginBottom='size-200' borderRadius='regular'>
            <Flex direction='column' height='100%'>
                <Flex flex={4} alignItems='center' justifyContent='space-between' marginX='size-200'>
                    <Text UNSAFE_style={{ fontWeight: 'bold' }}>
                        Project creation - {name} ({fileSize})
                    </Text>
                    <MenuTrigger>
                        <ActionButton isQuiet aria-label='upload-menu'>
                            <MoreMenu />
                        </ActionButton>
                        <Menu
                            disabledKeys={getDisabledMenuItems}
                            onAction={(key: Key) => handleMenuAction(key, uploads[uploadId])}
                        >
                            <Item key={MENU_ITEMS.CREATE} textValue={MENU_ITEMS.CREATE}>
                                <AssetsAdded size='S' />
                                <Text>{capitalize(MENU_ITEMS.CREATE)}</Text>
                            </Item>
                            <Item key={MENU_ITEMS.DELETE} textValue={MENU_ITEMS.DELETE}>
                                <DeleteOutline
                                    size='S'
                                    UNSAFE_className={
                                        getDisabledMenuItems.includes(MENU_ITEMS.DELETE) ? '' : classes.negative
                                    }
                                />
                                <Text
                                    UNSAFE_className={
                                        getDisabledMenuItems.includes(MENU_ITEMS.DELETE) ? '' : classes.negative
                                    }
                                >
                                    {capitalize(MENU_ITEMS.DELETE)}
                                </Text>
                            </Item>
                        </Menu>
                    </MenuTrigger>
                </Flex>
                <Divider size='S' marginX='size-200' />
                <Flex flex={3} alignItems='center' justifyContent='space-between' marginX='size-200'>
                    <Flex flex={1} alignItems='center' gap='size-400'>
                        <Flex flex={1} alignItems='center' gap='size-150' marginStart='size-100'>
                            {getStatusIcon}
                            <Text>{getStatusMsg}</Text>
                        </Flex>
                        {status === DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING && (
                            <Flex flex={1} alignItems='center' gap='size-400'>
                                <Text>{progress}%</Text>
                                <Text>{bytesRemaining}</Text>
                                <Text>{timeRemaining}</Text>
                            </Flex>
                        )}
                    </Flex>
                    {isDetailsAvailable && (
                        <ActionButton
                            isQuiet
                            onPress={() => {
                                setActiveUploadId(fileId);
                                setModalOpened(true);
                            }}
                        >
                            See details
                        </ActionButton>
                    )}
                    {status == DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR && (
                        <ActionButton isQuiet onPress={() => prepareDataset(fileId, uploadId)}>
                            Try again
                        </ActionButton>
                    )}
                    {status == DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR && (
                        <ActionButton isQuiet onPress={() => createProject(uploads[uploadId])}>
                            Try again
                        </ActionButton>
                    )}
                    {(status == DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_INTERRUPTED ||
                        status == DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR) && (
                        <>
                            <ActionButton isQuiet onPress={() => fileInputRef.current.click()}>
                                Try again
                            </ActionButton>
                            <input
                                type='file'
                                hidden={true}
                                ref={fileInputRef}
                                onChange={onFileInputChange}
                                onClick={() => (fileInputRef.current.value = '')}
                                style={{ pointerEvents: 'all' }}
                                accept='.zip'
                            />
                        </>
                    )}
                </Flex>
                {status === DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING && (
                    <UploadStatusProgressBar size='size-25' customColor='var(--energy-blue-dark)' progress={progress} />
                )}
            </Flex>
        </View>
    );
};
