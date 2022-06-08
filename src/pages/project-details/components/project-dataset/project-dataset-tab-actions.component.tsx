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

import { useCallback } from 'react';

import { Button, Flex, View } from '@adobe/react-spectrum';
import { OverlayTriggerState, useOverlayTriggerState } from '@react-stately/overlays';
import isEmpty from 'lodash/isEmpty';

import { ExportDatasetIdentifier } from '../../../../core/projects';
import { ButtonWithTooltip, MenuTrigger } from '../../../../shared/components';
import { useMedia } from '../../../media/providers/media-provider.component';
import { useExportDataset } from '../../hooks/use-export-dataset.hook';
import { DeleteDatasetDialog } from './delete-dataset-dialog.component';
import { ExportDatasetDialog } from './export-dataset-dialog.component';

interface ProjectDatasetTabActionsProps {
    isAnomalyProject: boolean;
    exportNotificationState: OverlayTriggerState;
    onGoToAnnotator: () => void;
    onDeleteAllMedia: () => void;
    isInEdition: boolean;
}

export enum DatasetTapActions {
    ExportDataset = 'Export dataset',
    DeleteAllMedia = 'Delete all media',
}

export const NOT_FINISHED_EDITION_AND_NO_MEDIA_MESSAGE = 'You have to finish label edition and upload images or videos';
export const NOT_FINISHED_EDITION_MESSAGE = 'You have to finish label edition';
export const NO_MEDIA_MESSAGE = 'You have to upload images or videos';

export const ProjectDatasetTabActions = ({
    isAnomalyProject,
    onGoToAnnotator,
    onDeleteAllMedia,
    exportNotificationState,
    isInEdition,
}: ProjectDatasetTabActionsProps): JSX.Element => {
    const { media } = useMedia();
    const deleteDialogState = useOverlayTriggerState({});
    const exportDialogState = useOverlayTriggerState({});
    const { prepareExportDataset } = useExportDataset();

    const noMedia = media.length === 0;
    const isAnnotatorDisabled = isInEdition || noMedia;
    const tooltipText =
        isInEdition && noMedia
            ? NOT_FINISHED_EDITION_AND_NO_MEDIA_MESSAGE
            : noMedia
            ? NO_MEDIA_MESSAGE
            : isInEdition
            ? NOT_FINISHED_EDITION_MESSAGE
            : '';

    const onOpenDialog = useCallback(
        (tap) => {
            switch (tap) {
                case DatasetTapActions.ExportDataset.toLocaleLowerCase():
                    exportDialogState.open();
                    break;
                case DatasetTapActions.DeleteAllMedia.toLocaleLowerCase():
                    deleteDialogState.open();
                    break;
            }
        },
        [deleteDialogState, exportDialogState]
    );

    const handlePrepareExportDataset = (data: ExportDatasetIdentifier) => {
        prepareExportDataset.mutate(data, {
            onSuccess: () => {
                exportNotificationState.open();
            },
            onSettled: () => {
                exportDialogState.close();
            },
        });
    };

    return (
        <View position='absolute' right={'size-300'}>
            <Flex marginStart={'auto'} gap={'size-50'}>
                <ButtonWithTooltip
                    buttonInfo={{ type: 'button', button: Button }}
                    id={'annotate-button-id'}
                    variant={'cta'}
                    onPress={onGoToAnnotator}
                    isDisabled={isAnnotatorDisabled}
                    content={isAnomalyProject ? 'Explore' : 'Annotate'}
                    tooltipProps={{ children: tooltipText }}
                    tooltipTriggerProps={{ isDisabled: !isAnnotatorDisabled }}
                    isClickable
                />
                {!isEmpty(media) && (
                    <MenuTrigger
                        quiet
                        onAction={onOpenDialog}
                        id={'dataset-actions-delete-all-media'}
                        items={[DatasetTapActions.ExportDataset, DatasetTapActions.DeleteAllMedia]}
                    />
                )}
                <DeleteDatasetDialog triggerState={deleteDialogState} onAction={onDeleteAllMedia} />
                <ExportDatasetDialog triggerState={exportDialogState} onAction={handlePrepareExportDataset} />
            </Flex>
        </View>
    );
};
