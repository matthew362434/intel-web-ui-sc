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

import { ProjectIdentifier } from './project.interface';

export interface DatasetIdentifier extends ProjectIdentifier {
    datasetId: string;
}

export interface ExportDatasetIdentifier {
    workspaceId: string;
    datasetId: string;
    exportFormat: ExportFormats;
}

export interface ExportDatasetStatusIdentifier {
    workspaceId: string;
    datasetId: string;
    exportDatasetId: string;
}

export interface ExportDatasetLSData {
    datasetId: string;
    exportFormat: ExportFormats;
    isPrepareDone: boolean;
    exportDatasetId: string;
}

export enum ExportFormats {
    VOC = 'voc',
    COCO = 'coco',
    YOLO = 'yolo',
}
