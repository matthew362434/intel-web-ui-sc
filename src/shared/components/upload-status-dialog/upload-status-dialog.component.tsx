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

import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    Divider,
    Flex,
    Heading,
    useDialogContainer,
    View,
} from '@adobe/react-spectrum';

import { isAnomalyDomain, isClassificationDomain } from '../../../core/projects/domains';
import { useDatasetIdentifier } from '../../../pages/annotator/hooks/use-dataset-identifier.hook';
import { useMedia } from '../../../pages/media/providers/media-provider.component';
import { useProject } from '../../../pages/project-details/providers';
import { useMediaUpload } from '../../../providers/media-upload-provider/media-upload-provider.component';
import { UploadMediaButton } from '../upload-media-button';
import { UploadStatusDialogContent } from './upload-status-dialog-content.component';
import { UploadStatusDialogTime } from './upload-status-dialog-time.component';

export const UploadStatusDialog = (): JSX.Element => {
    const dialog = useDialogContainer();
    const { isSingleDomainProject } = useProject();
    const { setUploadMedia } = useMedia();
    const datasetIdentifier = useDatasetIdentifier();
    const {
        isUploadInProgress,
        setFilesForLabelAssignment,
        setLabelSelectorDialogActivated,
        cancelPendingMediaUpload,
    } = useMediaUpload();

    return (
        <Dialog>
            <Heading>{isUploadInProgress ? 'Uploading' : 'Uploaded'}</Heading>
            <Divider />

            <Content>
                <UploadStatusDialogContent />
                {isUploadInProgress && <UploadStatusDialogTime />}
            </Content>

            <ButtonGroup UNSAFE_style={{ paddingLeft: 0 }}>
                <Flex width='100%' alignItems='center' justifyContent={isUploadInProgress ? 'space-between' : 'end'}>
                    <Button
                        variant='negative'
                        isHidden={!isUploadInProgress}
                        onPress={() => {
                            cancelPendingMediaUpload();
                            dialog.dismiss();
                        }}
                    >
                        Cancel all pending
                    </Button>
                    <View paddingTop={`${isUploadInProgress ? 'size-300' : 0}`}>
                        {!isSingleDomainProject(isAnomalyDomain) && (
                            <UploadMediaButton
                                id='upload-more-media-action-menu'
                                title='Upload more'
                                regularButton
                                uploadCallback={(files: File[]) => {
                                    if (isSingleDomainProject(isClassificationDomain)) {
                                        setFilesForLabelAssignment(files);
                                        setLabelSelectorDialogActivated(true);
                                    } else {
                                        setUploadMedia({ datasetIdentifier, files });
                                    }
                                }}
                            />
                        )}
                        <Button marginStart='size-200' variant='secondary' onPress={dialog.dismiss}>
                            Hide
                        </Button>
                    </View>
                </Flex>
            </ButtonGroup>
        </Dialog>
    );
};
