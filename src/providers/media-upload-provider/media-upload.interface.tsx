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

import { DatasetIdentifier } from '../../core/projects';

export interface ListItem {
    readonly datasetIdentifier: DatasetIdentifier;
    readonly file: File;
    readonly meta?: string;
}

export enum ValidationFailStatus {
    UNSUPPORTED_TYPE = -1,
    INVALID_DIMENSIONS = -2,
    INVALID_DURATION = -3,
}

export interface ValidationFailReason extends ListItem {
    readonly status: ValidationFailStatus;
    readonly errors: string[];
}

export interface SuccessListItem extends ListItem {
    readonly uploadId: string;
}

export interface ErrorListItem extends SuccessListItem, Pick<MediaUploadItemDTO, 'uploadInfo'> {
    readonly errors: string[];
    readonly status: number;
    readonly statusText: string | null;
}

export interface ProgressListItem extends SuccessListItem {
    progress: number;
}

export interface UploadInfoDTO {
    filename: string;
    label_ids: string[];
}

export interface MediaUploadItemDTO {
    readonly datasetIdentifier: DatasetIdentifier;
    file: File;
    meta?: string;
    uploadInfo?: UploadInfoDTO;
}

export interface UploadMedia {
    readonly datasetIdentifier: DatasetIdentifier;
    readonly files: File[];
    readonly meta?: string;
    labelIds?: string[];
}
