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

import { ReactNode, useCallback } from 'react';

import {
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Heading,
    Item,
    TabList,
    TabPanels,
    Tabs,
    View,
} from '@adobe/react-spectrum';

import {
    DatasetImportDialogButtons,
    DatasetImportDnd,
    DatasetImportDomain,
    DatasetImportLabels,
    DatasetImportWizard,
} from '.';
import { DATASET_IMPORT_UPLOAD_STEPS } from '../dataset-import.interface';
import classes from '../dataset-import.module.scss';
import { useDatasetImport } from '../dataset-import.provider.component';
import { DatasetImportProgress } from './dataset-import-progress.component';
import { DatasetImportWarnings } from './dataset-import-warnings.component';

export const DatasetImportDialog = (): JSX.Element => {
    const {
        isModalOpened,
        patchUpload,
        addUpload,
        getActiveUpload,
        setActiveUploadId,
        setModalOpened,
        createProject,
        setDeletingUpload,
        isReadyForProjectCreation,
    } = useDatasetImport();

    const uploadItem = getActiveUpload();

    const getDialogContentTabs = useCallback((children: ReactNode): JSX.Element => {
        return (
            <Tabs aria-label='location' UNSAFE_className={classes.tabs}>
                <TabList>
                    <Item key='upload'>Upload</Item>
                    {/* TODO: Uncomment this after 1.1 release */}
                    {/* <Item key='library'>Your library</Item> */}
                </TabList>
                <TabPanels UNSAFE_className={classes.tabPanels}>
                    <Item key='upload'>
                        <View UNSAFE_className={classes.uploadPanel}>{children}</View>
                    </Item>
                </TabPanels>
            </Tabs>
        );
    }, []);

    const getDialogContent = useCallback((): JSX.Element => {
        if (!uploadItem)
            return getDialogContentTabs(
                <DatasetImportDnd addUpload={addUpload} setActiveUploadId={setActiveUploadId} />
            );
        switch (uploadItem.activeStep) {
            case DATASET_IMPORT_UPLOAD_STEPS.DOMAIN:
                return <DatasetImportDomain uploadItem={uploadItem} patchUpload={patchUpload} />;
            case DATASET_IMPORT_UPLOAD_STEPS.LABELS:
                return <DatasetImportLabels uploadItem={uploadItem} patchUpload={patchUpload} />;
            default:
                return getDialogContentTabs(
                    !!uploadItem.warnings.length ? (
                        <DatasetImportWarnings uploadItem={uploadItem} />
                    ) : (
                        <DatasetImportProgress uploadItem={uploadItem} />
                    )
                );
        }
    }, [addUpload, getDialogContentTabs, patchUpload, setActiveUploadId, uploadItem]);

    return (
        <DialogContainer onDismiss={() => setModalOpened(false)}>
            {isModalOpened && (
                <Dialog width={1000} height={800}>
                    <Heading>Create project - Import</Heading>
                    <Divider />
                    <Content>
                        <DatasetImportWizard uploadItem={getActiveUpload()} patchUpload={patchUpload} />
                        <View UNSAFE_className={classes.modalContent}>
                            <View UNSAFE_className={classes.contentWrapper}>{getDialogContent()}</View>
                        </View>
                        {/* TODO: Uncomment this after 1.1 release */}
                        {/* {uploadItem?.activeStep === DATASET_IMPORT_UPLOAD_STEPS.LABELS && (
                            <View marginTop='size-150' zIndex={1} UNSAFE_style={{ position: 'absolute' }}>
                                <Checkbox
                                    aria-label='invert-label-selection'
                                    isSelected={uploadItem.invertLabels}
                                    onChange={(state: boolean) => {
                                        patchUpload(uploadItem.fileId, { invertLabels: state });
                                    }}
                                >
                                    <Flex alignItems='center' gap='size-100'>
                                        <Text>Import the media with labels that you haven&apos;t selected</Text>
                                        <InfoOutline />
                                    </Flex>
                                </Checkbox>
                            </View>
                        )} */}
                    </Content>

                    <DatasetImportDialogButtons
                        uploadItem={getActiveUpload()}
                        createProject={createProject}
                        patchUpload={patchUpload}
                        isReady={isReadyForProjectCreation}
                        setDeletingUpload={setDeletingUpload}
                        onDialogDismiss={() => setModalOpened(false)}
                    />
                </Dialog>
            )}
        </DialogContainer>
    );
};
