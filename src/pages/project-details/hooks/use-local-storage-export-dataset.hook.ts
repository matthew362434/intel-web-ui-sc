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

import { useLocalStorage } from 'use-hooks';

import { ExportDatasetLSData } from '../../../core/projects';
import { LOCAL_STORAGE_KEYS } from '../../../shared/local-storage-keys';
import { getParsedLocalStorage } from '../../../shared/utils';

const geDatasetsFromtLs = (): ExportDatasetLSData[] =>
    getParsedLocalStorage<ExportDatasetLSData[]>(LOCAL_STORAGE_KEYS.EXPORTING_DATASETS) ?? [];

const updateDatasetLs = (
    lsDatasetInfo: ExportDatasetLSData[],
    newExportingDataset: ExportDatasetLSData
): ExportDatasetLSData[] => {
    const filterDatasets = lsDatasetInfo.filter(({ datasetId }) => datasetId !== newExportingDataset.datasetId);
    return [...filterDatasets, newExportingDataset];
};

export const useLocalStorageExportDataset = () => {
    const [lsExportDatset, setLSExportDatset] = useLocalStorage<ExportDatasetLSData[]>(
        LOCAL_STORAGE_KEYS.EXPORTING_DATASETS,
        geDatasetsFromtLs()
    );
    const hasLocalstorageDataset = (datasetId: string): boolean => Boolean(getDatasetLsByDatasetId(datasetId));

    const getDatasetLsByDatasetId = (queryDatasetId: string): ExportDatasetLSData | undefined =>
        geDatasetsFromtLs().find(({ datasetId }) => datasetId === queryDatasetId);

    const addLsExportDataset = (data: ExportDatasetLSData): void => setLSExportDatset([...geDatasetsFromtLs(), data]);

    const updateLsExportDataset = (data: ExportDatasetLSData): void =>
        setLSExportDatset(updateDatasetLs(lsExportDatset, data));

    const removeDatasetLsByDatasetId = (queryDatasetId: string): ExportDatasetLSData[] => {
        const lsDatasetInfo = geDatasetsFromtLs();
        const finalData = !hasLocalstorageDataset(queryDatasetId)
            ? lsDatasetInfo
            : lsDatasetInfo.filter(({ datasetId }) => datasetId !== queryDatasetId);

        setLSExportDatset(finalData);

        return finalData;
    };

    return {
        hasLocalstorageDataset,
        addLsExportDataset,
        updateLsExportDataset,
        getDatasetLsByDatasetId,
        removeDatasetLsByDatasetId,
    };
};
