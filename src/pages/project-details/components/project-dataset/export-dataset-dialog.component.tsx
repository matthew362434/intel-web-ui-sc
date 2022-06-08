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

import { Fragment, useEffect, useState } from 'react';

import {
    Flex,
    Text,
    Radio,
    Button,
    Dialog,
    Heading,
    Divider,
    Content,
    RadioGroup,
    ButtonGroup,
    DialogContainer,
} from '@adobe/react-spectrum';
import { OverlayTriggerState } from '@react-stately/overlays';

import { Alert, InfoOutline } from '../../../../assets/icons';
import {
    DOMAIN,
    ExportDatasetIdentifier,
    ExportFormats,
    isAnomalyDomain,
    isClassificationDomain,
    isRotatedDetectionDomain,
} from '../../../../core/projects';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { LoadingIndicator } from '../../../../shared/components';
import { runWhen } from '../../../../shared/utils';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { useLocalStorageExportDataset } from '../../hooks/use-local-storage-export-dataset.hook';
import { useProject } from '../../providers';
import classes from './project-dataset.module.scss';

interface exportFormatDetails {
    name: string;
    domain: DOMAIN[];
    description: string;
}

const availableFormats: exportFormatDetails[] = [
    {
        name: ExportFormats.VOC,
        description:
            // eslint-disable-next-line max-len
            'A common XML annotation format originally created for the Visual Object Challenge; interchange format for object detection labels.',
        domain: [
            DOMAIN.CLASSIFICATION,
            DOMAIN.DETECTION,
            DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
            DOMAIN.SEGMENTATION,
            DOMAIN.ANOMALY_CLASSIFICATION,
            DOMAIN.ANOMALY_DETECTION,
            DOMAIN.ANOMALY_SEGMENTATION,
            DOMAIN.SEGMENTATION_INSTANCE,
        ],
    },
    {
        name: ExportFormats.COCO,
        description: 'A common JSON annotation format originating from MS COCO dataset released by Microsoft in 2015',
        domain: [
            DOMAIN.DETECTION,
            DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
            DOMAIN.SEGMENTATION,
            DOMAIN.SEGMENTATION_INSTANCE,
        ],
    },
    {
        name: ExportFormats.YOLO,
        description: 'Exports annotations in a JSON file alongside media files',
        domain: [DOMAIN.DETECTION, DOMAIN.DETECTION_ROTATED_BOUNDING_BOX],
    },
];

interface ExportDatasetDialogProps {
    triggerState: OverlayTriggerState;
    onAction: (data: ExportDatasetIdentifier) => void;
}
export const ROTATED_BOUNDING_MESSAGE = 'Rotated bounding boxes will be converted to polygons.';
export const ANOMALY_MESSAGE = 'Anomaly labels will be converted to classification labels.';
export const TASK_CHAIN_MESSAGE = 'Task-chain annotation will lose task connection.';
export const CLASSIFICATION_MESSAGE = 'Classification labels will not have relations.';

export const ExportDatasetDialog = ({ triggerState, onAction }: ExportDatasetDialogProps) => {
    const [exportFormat, setExportFormat] = useState<ExportFormats | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const { project, isTaskChainProject } = useProject();
    const { addNotification } = useNotification();
    const { hasLocalstorageDataset } = useLocalStorageExportDataset();

    const { workspaceId, datasetId } = useDatasetIdentifier();
    const matchFormats = availableFormats.filter(({ domain }) =>
        project.domains.filter((dom) => dom !== DOMAIN.CROP).every((currentDomain) => domain.includes(currentDomain))
    );

    useEffect(() => {
        if (triggerState.isOpen) {
            validateWarning(datasetId);
        } else {
            resetConfig();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datasetId, triggerState.isOpen]);

    const validateWarning = runWhen(hasLocalstorageDataset)(() => {
        triggerState.close();
        addNotification('The export process for this dataset is already in progress', NOTIFICATION_TYPE.WARNING);
    });

    const resetConfig = () => {
        setIsLoading(false);
        setExportFormat('');
    };

    const onPress = () => {
        setIsLoading(true);
        onAction({ workspaceId, datasetId, exportFormat: exportFormat as ExportFormats });
    };

    const isAnomaly = project.domains.some(isAnomalyDomain);
    const isClassification = project.domains.some(isClassificationDomain);
    const isRotatedDetection = project.domains.some(isRotatedDetectionDomain);

    return (
        <DialogContainer onDismiss={() => !isLoading && triggerState.close()}>
            {triggerState.isOpen && (
                <Dialog aria-label='export-dataset-dialog'>
                    <Heading>Export dataset</Heading>
                    <Divider />
                    <Content UNSAFE_className={classes.exportDialogBody}>
                        <Text>Select the export format</Text>
                        <RadioGroup
                            aria-label='task-types-lists'
                            value={exportFormat}
                            onChange={(value) => setExportFormat(value as ExportFormats)}
                        >
                            {matchFormats.map(({ name, description }) => (
                                <Fragment key={name}>
                                    <Flex direction={'row'} UNSAFE_className={classes.formatRow}>
                                        <Flex direction={'column'}>
                                            <Radio value={name}>{name}</Radio>
                                            <Text marginStart={'size-300'}>{description}</Text>
                                        </Flex>

                                        <a
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            href='https://openvinotoolkit.github.io/datumaro/docs/formats/'
                                        >
                                            <InfoOutline />
                                        </a>
                                    </Flex>
                                    <Divider size='S' />
                                </Fragment>
                            ))}
                        </RadioGroup>

                        <Text UNSAFE_className={classes.videoNotification}>
                            <Alert /> Converted formats
                        </Text>
                        <ul className={classes.videoNotificationList}>
                            {isRotatedDetection && (
                                <li className={classes.videoNotificationList}>{ROTATED_BOUNDING_MESSAGE}</li>
                            )}
                            {isAnomaly && <li className={classes.videoNotificationList}>{ANOMALY_MESSAGE}</li>}
                            {isTaskChainProject && (
                                <li className={classes.videoNotificationList}>{TASK_CHAIN_MESSAGE}</li>
                            )}
                            {isClassification && (
                                <li className={classes.videoNotificationList}>{CLASSIFICATION_MESSAGE}</li>
                            )}
                            <li className={classes.videoNotificationList}>
                                Exporting video is not supported at the moment
                            </li>
                        </ul>
                    </Content>

                    <ButtonGroup isDisabled={isLoading}>
                        <Button variant='primary' onPress={triggerState.close}>
                            Cancel
                        </Button>

                        <Button variant='cta' isDisabled={exportFormat === '' || isLoading} onPress={onPress}>
                            <Flex alignItems={'center'} gap={'size-65'}>
                                <Text>Export</Text>
                                {isLoading ? <LoadingIndicator size={'S'} /> : <></>}
                            </Flex>
                        </Button>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogContainer>
    );
};
