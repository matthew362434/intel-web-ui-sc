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

import { useEffect } from 'react';

import { Divider, Text, Heading } from '@adobe/react-spectrum';

import { Rotation } from '../../../../assets/icons';
import { ExportStatusStateDTO } from '../../../../core/configurable-parameters/dtos';
import { ExportDatasetLSData } from '../../../../core/projects';
import { useExportDataset } from '../../hooks/use-export-dataset.hook';
import classes from './project-dataset.module.scss';

interface ExportDatasetStatusProps {
    workspaceId: string;
    onCloseStatus: (id: string) => void;
    localStorageData: ExportDatasetLSData;
    onPrepareDone: (lsData: ExportDatasetLSData) => void;
}

export const RETRY_AFTER = 1000;
export const ExportDatasetStatus = ({
    localStorageData,
    workspaceId,
    onPrepareDone,
    onCloseStatus,
}: ExportDatasetStatusProps) => {
    const { exportDatasetStatus } = useExportDataset();
    const { datasetId } = localStorageData;

    useEffect(() => {
        callDatasetStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (exportDatasetStatus.isLoading) {
            return;
        }

        if (exportDatasetStatus.data?.state === ExportStatusStateDTO.DONE) {
            onPrepareDone(localStorageData);
        } else if (exportDatasetStatus.isError) {
            onCloseStatus(datasetId);
        } else {
            timeoutId = setTimeout(callDatasetStatus, RETRY_AFTER);
        }

        return () => {
            timeoutId && clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportDatasetStatus.status]);

    const callDatasetStatus = () => {
        exportDatasetStatus.mutate({ workspaceId, datasetId, exportDatasetId: localStorageData.exportDatasetId });
    };

    return (
        <div aria-label='export-dataset-status' className={classes.exportStatusContainer}>
            <Heading level={6} UNSAFE_className={classes.exportStatusTitle}>
                Export dataset - {localStorageData.exportFormat} format
            </Heading>
            <Text>Dataset {localStorageData.datasetId} is being processed in order to export it.</Text>
            <Divider size='S' marginTop={'size-100'} marginBottom={'size-150'} />
            <Rotation />
            <Text marginEnd={'size-200'}>Dataset - Processing data </Text>
            <Text>~ 3 minutes</Text>
        </div>
    );
};
