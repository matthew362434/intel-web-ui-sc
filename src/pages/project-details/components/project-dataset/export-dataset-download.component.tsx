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

import { Text, Heading, Button, Flex, ButtonGroup } from '@adobe/react-spectrum';

import { ExportDatasetLSData } from '../../../../core/projects';
import { useExportDataset } from '../../hooks/use-export-dataset.hook';
import classes from './project-dataset.module.scss';

interface ExportDatasetDownloadProps {
    workspaceId: string;
    onCloseDownload: (id: string) => void;
    localStorageData: ExportDatasetLSData;
}
export const ExportDatasetDownload = ({
    workspaceId,
    onCloseDownload,
    localStorageData,
}: ExportDatasetDownloadProps) => {
    const { exportDatasetUrl } = useExportDataset();
    const { exportDatasetId, datasetId } = localStorageData;

    return (
        <div aria-label='export-dataset-download' className={classes.exportStatusContainer}>
            <Heading level={6} UNSAFE_className={classes.exportStatusTitle}>
                Export dataset - {localStorageData.exportFormat} format
            </Heading>
            <Text>Dataset is ready to download.</Text>

            <ButtonGroup UNSAFE_className={classes.exportDownloadOptions}>
                <Button
                    isQuiet
                    variant='primary'
                    marginEnd={'size-100'}
                    onPress={() => onCloseDownload(localStorageData.datasetId)}
                >
                    Close
                </Button>
                <a
                    aria-label='export-download-url'
                    className={classes.downloadLink}
                    download={`sonoma_creek_${datasetId}.zip`}
                    href={exportDatasetUrl({ workspaceId, datasetId, exportDatasetId })}
                >
                    <Button variant='primary'>
                        <Flex alignItems={'center'} gap={'size-65'}>
                            <Text>Download</Text>
                        </Flex>
                    </Button>
                </a>
            </ButtonGroup>
        </div>
    );
};
