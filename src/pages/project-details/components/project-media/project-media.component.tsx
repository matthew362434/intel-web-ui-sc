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

import { useCallback, useMemo } from 'react';

import { AlertDialog, DialogContainer, Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import MediaUploadAnomalousIcon from '../../../../assets/images/media-upload-anomalous.svg';
import MediaUploadNormalIcon from '../../../../assets/images/media-upload-normal.svg';
import { ANOMALY_LABEL, Label } from '../../../../core/labels';
import { isAnomalyDomain } from '../../../../core/projects/domains';
import {
    MediaUploadContextProps,
    useMediaUpload,
} from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { UploadStatusBar } from '../../../../shared/components/upload-status-bar';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { useMediaServices } from '../../../media/hooks';
import { MediaProvider } from '../../../media/providers';
import { useProject } from '../../providers';
import { MediaContent } from './media-content.component';
import { useShowStartTraining } from './use-show-start-training';
import {
    enoughAnomalousMediaAction,
    enoughNormalMediaAction,
    uploadedAnomalousMediaAction,
    uploadedNormalMediaAction,
} from './use-show-start-training/actions';
import { StartTrainingEvents } from './use-show-start-training/training-notification.interface';

export const ProjectMedia = (): JSX.Element => {
    const { isSingleDomainProject, project } = useProject();
    const { mediaService } = useMediaServices();
    const datasetIdentifier = useDatasetIdentifier();
    const [trainingProcessState, dispatch, Component] = useShowStartTraining();
    const {
        isUploadStatusBarVisible,
        setInsufficientStorage,
        isUploadInProgress,
        insufficientStorage,
        reloadAnomalous,
        setReloadAnomalous,
        reloadGeneric,
        setReloadGeneric,
        reloadNormal,
        setReloadNormal,
        labelSelectorDialogActivated,
        filesForLabelAssignment,
        isNormalTriggered,
        isAnomalousTriggered,
        setLabelSelectorDialogActivated,
        setFilesForLabelAssignment,
        setUploadMedia,
    } = useMediaUpload();

    /* eslint-disable @typescript-eslint/indent */
    const uploadMediaMetaData: Pick<
        MediaUploadContextProps,
        | 'isUploadInProgress'
        | 'isUploadStatusBarVisible'
        | 'labelSelectorDialogActivated'
        | 'filesForLabelAssignment'
        | 'isNormalTriggered'
        | 'isAnomalousTriggered'
        | 'setLabelSelectorDialogActivated'
        | 'setFilesForLabelAssignment'
        | 'setUploadMedia'
    > = {
        isUploadInProgress,
        isUploadStatusBarVisible,
        labelSelectorDialogActivated,
        filesForLabelAssignment,
        isNormalTriggered,
        isAnomalousTriggered,
        setLabelSelectorDialogActivated,
        setFilesForLabelAssignment,
        setUploadMedia,
    };
    /* eslint-enable @typescript-eslint/indent */

    const isSingleAnomalyProject = isSingleDomainProject(isAnomalyDomain);
    const offset = isUploadStatusBarVisible ? 'size-800' : undefined;

    const normalLabel = useMemo<Label | undefined>((): Label | undefined => {
        return project.labels.find((label: Label) => label.name === ANOMALY_LABEL.NORMAL);
    }, [project]);

    const anomalousLabel = useMemo<Label | undefined>((): Label | undefined => {
        return project.labels.find((label: Label) => label.name === ANOMALY_LABEL.ANOMALOUS);
    }, [project]);

    const enoughNormalMediaCallback = useCallback((): void => {
        dispatch(enoughNormalMediaAction());
    }, [dispatch]);

    const enoughAnomalousMediaCallback = useCallback((): void => {
        dispatch(enoughAnomalousMediaAction());
    }, [dispatch]);

    return (
        <Flex height='100%'>
            {isSingleAnomalyProject ? (
                <Flex flex={1} justifyContent='space-between' gap='size-300'>
                    <View flex={1} borderWidth='thin' borderColor='positive'>
                        <MediaProvider
                            mediaService={mediaService}
                            datasetIdentifier={datasetIdentifier}
                            anomalyLabel={normalLabel}
                        >
                            <MediaContent
                                uploadMediaMetaData={{
                                    ...uploadMediaMetaData,
                                    reloadTrigger: reloadNormal,
                                    setReloadTrigger: setReloadNormal,
                                }}
                                header={ANOMALY_LABEL.NORMAL}
                                dropBoxIcon={MediaUploadNormalIcon}
                                dropBoxIconSize='size-2400'
                                dropBoxPendingText='Drop normal images and videos here'
                                dropBoxHoverText='Release to drop normal media'
                                dropBoxInProgressText='Release to add normal media in queue'
                                showDropOverlayPanel
                                margin='size-200'
                                enoughMediaCallback={enoughNormalMediaCallback}
                                uploadedMediaCallback={() => dispatch(uploadedNormalMediaAction())}
                            />
                        </MediaProvider>
                    </View>
                    <View flex={1} borderWidth='thin' borderColor='negative'>
                        <MediaProvider
                            mediaService={mediaService}
                            datasetIdentifier={datasetIdentifier}
                            anomalyLabel={anomalousLabel}
                        >
                            <MediaContent
                                uploadMediaMetaData={{
                                    ...uploadMediaMetaData,
                                    reloadTrigger: reloadAnomalous,
                                    setReloadTrigger: setReloadAnomalous,
                                }}
                                header={ANOMALY_LABEL.ANOMALOUS}
                                dropBoxIcon={MediaUploadAnomalousIcon}
                                dropBoxIconSize='size-2400'
                                dropBoxPendingText='Drop anomalous images and videos here'
                                dropBoxHoverText='Release to drop anomalous media'
                                dropBoxInProgressText='Release to add anomalous media in queue'
                                showDropOverlayPanel
                                margin='size-200'
                                enoughMediaCallback={enoughAnomalousMediaCallback}
                                uploadedMediaCallback={() => dispatch(uploadedAnomalousMediaAction())}
                            />
                        </MediaProvider>
                    </View>
                </Flex>
            ) : (
                <View flex={1} borderWidth='thin' borderColor='gray-50'>
                    <MediaContent
                        uploadMediaMetaData={{
                            ...uploadMediaMetaData,
                            reloadTrigger: reloadGeneric,
                            setReloadTrigger: setReloadGeneric,
                        }}
                    />
                </View>
            )}

            {Component && !isUploadInProgress && <Component offset={offset} dispatch={dispatch} />}
            {trainingProcessState.type !== StartTrainingEvents.TRAINING_DIALOG && <UploadStatusBar />}

            <DialogContainer onDismiss={() => setInsufficientStorage(false)}>
                {insufficientStorage && (
                    <AlertDialog title='ERROR 507: Insufficient Storage' variant='error' primaryActionLabel='Close'>
                        Your server is running low on disk space. Please contact support team to find out possible
                        solutions
                    </AlertDialog>
                )}
            </DialogContainer>
        </Flex>
    );
};

export default ProjectMedia;
