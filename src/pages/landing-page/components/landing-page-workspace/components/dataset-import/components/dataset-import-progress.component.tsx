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

import { useMemo } from 'react';

import { Flex, Text } from '@adobe/react-spectrum';

import { CircularProgress } from '../../../../../../../shared/components/circular-progress';
import { DatasetImportUploadItem, DATASET_IMPORT_UPLOAD_STATUSES } from '../dataset-import.interface';
import classes from '../dataset-import.module.scss';

interface DatasetImportProgressProps {
    uploadItem: DatasetImportUploadItem;
}

export const DatasetImportProgress = ({ uploadItem }: DatasetImportProgressProps): JSX.Element => {
    const { status, warnings, progress, timeRemaining, name } = uploadItem;

    const header = useMemo<string>((): string => {
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS:
            case DATASET_IMPORT_UPLOAD_STATUSES.LABELS_SELECTION:
            case DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                return 'Completed';
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
                return 'Preparing';
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                return 'Error';
            default:
                return 'Processing';
        }
    }, [status]);

    const description = useMemo<string>((): string => {
        switch (status) {
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
                return 'Dataset is being uploaded';
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
                return 'Dataset is being prepared';
            case DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS:
                return 'Dataset has been uploaded with warnings';
            case DATASET_IMPORT_UPLOAD_STATUSES.LABELS_SELECTION:
            case DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION:
                return !!warnings.length
                    ? 'Dataset has been uploaded with warnings'
                    : 'Dataset has been uploaded successfully';
            case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
                return 'Dataset has not been uploaded';
            case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
                return 'Dataset has not been prepared';
            case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                return 'Project has not been created';
            default:
                return 'Processing';
        }
    }, [status, warnings]);

    const hasError = header === 'Error';

    return (
        <Flex
            direction='column'
            alignItems='center'
            justifyContent='center'
            width='100%'
            height='100%'
            gap='size-400'
            UNSAFE_className={classes.importProgress}
        >
            <CircularProgress
                hasError={hasError}
                percentage={progress}
                size={80}
                strokeWidth={8}
                labelFontSize={12}
                color='gray-500'
                labelFontColor='gray-700'
                backStrokeColor='gray-75'
                checkMarkSize={hasError ? 20 : undefined}
            />
            <Flex direction='column' alignItems='center' justifyContent='center'>
                <Text UNSAFE_style={{ fontSize: '2.5em' }}>{header}</Text>
                <Text>{description}</Text>
                <Text marginTop='size-100'>{name}</Text>
            </Flex>
            <Text UNSAFE_className={classes.timeRemaining}>{timeRemaining}</Text>
        </Flex>
    );
};
