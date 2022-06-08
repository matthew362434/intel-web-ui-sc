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

export enum DATASET_IMPORT_UPLOAD_STATUSES {
    IMPORTING = 'importing',
    PREPARING = 'preparing',
    WARNINGS = 'warnings',
    READY = 'ready',
    TASK_TYPE_SELECTION = 'taskTypeSelection',
    LABELS_SELECTION = 'labelsSelection',
    PROJECT_CREATION = 'projectCreation',
    IMPORTING_INTERRUPTED = 'importingInterrupted',
    IMPORTING_ERROR = 'importingError',
    PREPARING_ERROR = 'preparingError',
    PROJECT_CREATION_ERROR = 'projectCreationError',
}

export enum DATASET_IMPORT_UPLOAD_STEPS {
    DATASET = 'dataset',
    DOMAIN = 'domain',
    LABELS = 'labels',
}

export const DATASET_IMPORT_STATUS_STEP_MAPPING = {
    [DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING]: DATASET_IMPORT_UPLOAD_STEPS.DATASET,
    [DATASET_IMPORT_UPLOAD_STATUSES.PREPARING]: DATASET_IMPORT_UPLOAD_STEPS.DATASET,
    [DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS]: DATASET_IMPORT_UPLOAD_STEPS.DATASET,
    [DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION]: DATASET_IMPORT_UPLOAD_STEPS.DOMAIN,
    [DATASET_IMPORT_UPLOAD_STATUSES.LABELS_SELECTION]: DATASET_IMPORT_UPLOAD_STEPS.LABELS,
    [DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION]: '',
};

export enum DATASET_IMPORT_WARNING_TYPE {
    WARNINIG = 'warning',
    ERROR = 'error',
}

export enum DATASET_IMPORT_DIALOG_BUTTON_NAME {
    CANCEL = 'cancel',
    DELETE = 'delete',
    HIDE = 'hide',
    BACK = 'back',
    NEXT = 'next',
    CREATE = 'create',
}

export interface DatasetImportUploadItem {
    uploadId: string | null;
    fileId: string;
    fileSize: string;
    name: string;
    progress: number;
    startAt: number;
    startFromBytes: number;
    timeRemaining: string | null;
    bytesRemaining: string | null;
    invertLabels: boolean;
    labelsToSelect: string[];
    labelToTasks: Record<string, string[]>;
    warnings: DatasetImportWarning[];
    status: DATASET_IMPORT_UPLOAD_STATUSES;
    activeStep: DATASET_IMPORT_UPLOAD_STEPS;
    openedSteps: DATASET_IMPORT_UPLOAD_STEPS[];
    completedSteps: DATASET_IMPORT_UPLOAD_STEPS[];
    projectName: string;
    taskType: string;
    labels: string[];
}

export interface DatasetImportDialogButton {
    id: string;
    name: string;
    hidden: boolean;
    disabled: boolean;
    variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative';
    action?: () => void;
}

export interface DatasetImportWarningDTO {
    type: DATASET_IMPORT_WARNING_TYPE;
    name: string;
    description: string;
    affected_images: number;
    resolve_strategy: string;
}

export interface DatasetImportWarning {
    type: DATASET_IMPORT_WARNING_TYPE;
    name: string;
    description: string;
    affectedImages: number;
    resolveStrategy: string;
}

export interface DatasetImportPrepareResponseDTO {
    warnings: DatasetImportWarningDTO[];
    label_to_tasks: Record<string, string[]>;
}

export interface DatasetImportCreateResponseDTO {
    project_id: string;
}

export interface DatasetImportProjectDataDTO {
    file_id: string;
    project_name: string;
    task_type: string;
    labels: string[];
}

export interface DatasetImportPrepareResponse {
    warnings: DatasetImportWarningDTO[];
    labelToTasks: Record<string, string[]>;
}

export interface DatasetImportCreateResponse {
    projectId: string;
}

export interface DatasetImportProjectData {
    uploadId: string;
    projectName: string;
    taskType: string;
    labels: string[];
}

export interface DatasetImportPrepareProps {
    workspaceId: string;
    uploadId: string;
}

export interface DatasetImportCreateProps {
    workspaceId: string;
    projectData: DatasetImportProjectData;
}

export interface DatasetImportService {
    prepare({ workspaceId, uploadId }: DatasetImportPrepareProps): Promise<DatasetImportPrepareResponse>;
    create({ workspaceId, projectData }: DatasetImportCreateProps): Promise<DatasetImportCreateResponse>;
}
