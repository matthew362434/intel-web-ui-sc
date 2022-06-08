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

import { AdvancedFilterSortingOptions } from '../../pages/media/media-filter.interface';
import { PredictionMode } from '../annotations/services/prediction-service.interface';
import { JobState, JobType } from '../jobs/job.interface';
import { MEDIA_GROUP, MEDIA_TYPE, MediaIdentifier } from '../media';
import { MediaSearchOptions } from '../media/services/media-service.interface';
import { DOMAIN } from '../projects';
import { getTaskTypeFromDomain } from '../projects/utils';
import { TaskIdentifier } from '../statistics/dtos';

const API_VERSION = 'v1.0';

const THUMBNAIL = (thumbnail: string): string => `${thumbnail}`;

const WORKSPACES = `${API_VERSION}/workspaces`;

const USER_API = '/user';

const WORKSPACE = (workspaceId: string): string => `${WORKSPACES}/${workspaceId}`;

const PROJECTS = (workspaceId: string): string => `${WORKSPACE(workspaceId)}/projects`;

const PROJECT = (workspaceId: string, projectId: string): string => `${PROJECTS(workspaceId)}/${projectId}`;

const SETTINGS = (projectId: string): string => `${API_VERSION}/user_settings${projectId ? `?${projectId}` : ''}`;

const DATASET_URL = (workspaceId: string, projectId: string, datasetId: string): string =>
    `${PROJECT(workspaceId, projectId)}/datasets/${datasetId}`;

const MEDIA = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaItemsLoadSize: number,
    mediaSearchOptions: Partial<MediaSearchOptions>
): string => {
    const { name, sortBy, sortDir, status, labels } = mediaSearchOptions;
    const baseMediaUrl = `${DATASET_URL(workspaceId, projectId, datasetId)}/media`;
    const mediaSearchOptionsUrl = new URLSearchParams();

    mediaSearchOptionsUrl.set('top', `${mediaItemsLoadSize}`);

    if (name && name.trim().length > 0) mediaSearchOptionsUrl.set('name', name);

    if (status) mediaSearchOptionsUrl.set('annotation_status', status);

    if (labels && labels.length > 0) {
        labels.forEach((label: string) => mediaSearchOptionsUrl.append('labels', label));
    }

    if (sortBy) {
        mediaSearchOptionsUrl.set('sort_by', sortBy.toLowerCase().replaceAll(' ', '_'));
        mediaSearchOptionsUrl.set('sort_direction', sortDir ?? '');
    }

    return `${baseMediaUrl}?${mediaSearchOptionsUrl.toString()}`;
};

const ACTIVE_MEDIA = (workspaceId: string, projectId: string, mediaItemsLoadSize: number, taskId?: string): string => {
    if (taskId !== undefined) {
        return `${PROJECT(workspaceId, projectId)}/datasets/active?top=${mediaItemsLoadSize}&task_id=${taskId}`;
    }

    return `${PROJECT(workspaceId, projectId)}/datasets/active?top=${mediaItemsLoadSize}`;
};

const ADVANCED_DATASET_FILTER = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaItemsLoadSize: number,
    sortingOptions: AdvancedFilterSortingOptions
): string => {
    const searchOptionsUrl = new URLSearchParams();

    if (sortingOptions.sortBy) {
        searchOptionsUrl.set('sort_by', sortingOptions.sortBy.toLowerCase().replaceAll(' ', '_'));
        searchOptionsUrl.set('sort_direction', sortingOptions.sortDir ?? '');
    }
    searchOptionsUrl.set('limit', mediaItemsLoadSize.toString());

    return `${DATASET_URL(workspaceId, projectId, datasetId)}/media:query?${searchOptionsUrl.toString()}`;
};

const MEDIA_UPLOAD = (workspaceId: string, projectId: string, datasetId: string, mediaGroup: MEDIA_GROUP): string => {
    return `${DATASET_URL(workspaceId, projectId, datasetId)}/media/${mediaGroup}`;
};

const MEDIA_DELETE = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaGroup: MEDIA_GROUP,
    mediaItemId: string
): string => {
    return `${DATASET_URL(workspaceId, projectId, datasetId)}/media/${mediaGroup}/${mediaItemId}`;
};

const ANNOTATIONS_STATISTICS = ({ workspaceId, projectId, datasetId, taskId }: TaskIdentifier): string =>
    `${DATASET_URL(workspaceId, projectId, datasetId)}/statistics?task_id=${taskId}`;

const MEDIA_ITEM = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => {
    const baseUrl = `${DATASET_URL(workspaceId, projectId, datasetId)}/media`;

    if (mediaIdentifier.type === MEDIA_TYPE.IMAGE) {
        const { imageId } = mediaIdentifier;

        return `${baseUrl}/images/${imageId}`;
    }

    if (mediaIdentifier.type === MEDIA_TYPE.VIDEO) {
        const { videoId } = mediaIdentifier;

        return `${baseUrl}/${MEDIA_GROUP.VIDEOS}/${videoId}`;
    }

    if (mediaIdentifier.type === MEDIA_TYPE.VIDEO_FRAME) {
        const { videoId, frameNumber } = mediaIdentifier;

        return `${baseUrl}/${MEDIA_GROUP.VIDEOS}/${videoId}/frames/${frameNumber}`;
    }

    throw new Error(`Unsupported media type`);
};

enum MEDIA_IMAGE_TYPE {
    FULL = 'full',
    THUMB = 'thumb',
    STREAM = 'stream',
}

// Note: This returns the absolute url (including base url and api prefix) as it is used by img tags
const MEDIA_ITEM_IMAGE = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier,
    type: MEDIA_IMAGE_TYPE
): string => {
    return `/api/${MEDIA_ITEM(workspaceId, projectId, datasetId, mediaIdentifier)}/display/${type}`;
};

const MEDIA_ITEM_THUMBNAIL = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => {
    return MEDIA_ITEM_IMAGE(workspaceId, projectId, datasetId, mediaIdentifier, MEDIA_IMAGE_TYPE.THUMB);
};

const MEDIA_ITEM_SRC = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => {
    return MEDIA_ITEM_IMAGE(workspaceId, projectId, datasetId, mediaIdentifier, MEDIA_IMAGE_TYPE.FULL);
};

const MEDIA_ITEM_STREAM = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => {
    return MEDIA_ITEM_IMAGE(workspaceId, projectId, datasetId, mediaIdentifier, MEDIA_IMAGE_TYPE.STREAM);
};

const ANNOTATIONS = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => `${MEDIA_ITEM(workspaceId, projectId, datasetId, mediaIdentifier)}/annotations/latest`;

const SAVE_ANNOTATIONS = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier
): string => `${MEDIA_ITEM(workspaceId, projectId, datasetId, mediaIdentifier)}/annotations`;

const PREDICTION = (
    workspaceId: string,
    projectId: string,
    datasetId: string,
    mediaIdentifier: MediaIdentifier,
    mode: PredictionMode,
    taskId?: string
): string =>
    `${MEDIA_ITEM(workspaceId, projectId, datasetId, mediaIdentifier)}/predictions/${mode}${
        taskId ? `?task_id=${taskId}` : ''
    }`;

const PROJECT_STATUS = (workspaceId: string, projectId: string): string => `${PROJECT(workspaceId, projectId)}/status`;

const PROJECT_LABELS = (workspaceId: string, projectId: string, datasetId: string): string =>
    `${DATASET_URL(workspaceId, projectId, datasetId)}/labels`;

const MODELS = (workspaceId: string, projectId: string): string => `${PROJECT(workspaceId, projectId)}/model_groups`;

const MODEL_GROUPS = (workspaceId: string, projectId: string, architectureId: string): string =>
    `${MODELS(workspaceId, projectId)}/${architectureId}`;

const MODEL = (workspaceId: string, projectId: string, architectureId: string, modelId: string): string =>
    `${MODEL_GROUPS(workspaceId, projectId, architectureId)}/models/${modelId}`;

const MODEL_STATISTICS = (workspaceId: string, projectId: string, architectureId: string, modelId: string): string =>
    `${MODEL(workspaceId, projectId, architectureId, modelId)}/statistics`;

const MANUAL_TRAIN_MODEL = (workspaceId: string, projectId: string): string =>
    `${PROJECT(workspaceId, projectId)}/train`;

const EXPORT_MODEL = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string,
    includeCode?: boolean
): string => {
    return `${MODEL(workspaceId, projectId, architectureId, modelId)}/export${includeCode ? '?include_code=true' : ''}`;
};

const EXPORT_OPTIMIZED_MODEL = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string,
    optimizedModelId: string,
    includeCode?: boolean
): string => {
    return `${MODEL(workspaceId, projectId, architectureId, modelId)}/optimized_models/${optimizedModelId}/export${
        includeCode ? '?include_code=true' : ''
    }`;
};

const PREPARE_EXPORT_DATASET = (workspaceId: string, datasetId: string, exportFormat: string): string => {
    return `${WORKSPACE(workspaceId)}/datasets/${datasetId}:prepare-for-export?export_format=${exportFormat}`;
};

const EXPORT_DATASET_STATUS = (workspaceId: string, datasetId: string, exportDatasetId: string): string => {
    return `${WORKSPACE(workspaceId)}/datasets/${datasetId}/exports/status/${exportDatasetId}`;
};

const EXPORT_DATASET = (workspaceId: string, datasetId: string, exportDatasetId: string): string => {
    return `${WORKSPACE(workspaceId)}/datasets/${datasetId}/exports/${exportDatasetId}`;
};

const OPTIMIZE_MODEL = (workspaceId: string, projectId: string, architectureId: string, modelId: string): string =>
    `${MODEL(workspaceId, projectId, architectureId, modelId)}/optimize`;

const JOBS = (workspaceId: string): string => `${WORKSPACE(workspaceId)}/jobs`;

const JOBS_QUERY_PARAMS = (workspaceId: string, jobState?: JobState, jobType?: JobType, projectId?: string): string => {
    if (jobState && jobType) {
        return `${JOBS(workspaceId)}?state=${jobState}&job_type=${jobType}&project_id=${projectId}`;
    }
    return JOBS(workspaceId);
};

const JOB = (workspaceId: string, jobId: string): string => `${JOBS(workspaceId)}/${jobId}`;

const STATUS = (): string => `${API_VERSION}/status`;

const CONFIGURATION_PARAMETERS = (workspaceId: string, projectId: string): string =>
    `${PROJECT(workspaceId, projectId)}/configuration`;

const GLOBAL_CONFIGURATION_PARAMETERS = (workspaceId: string, projectId: string): string =>
    `${CONFIGURATION_PARAMETERS(workspaceId, projectId)}/global`;

const MODEL_CONFIG_PARAMETERS = (
    workspaceId: string,
    projectId: string,
    taskId: string,
    modelId?: string,
    modelTemplateId?: string
): string => {
    const baseUrl = `${CONFIGURATION_PARAMETERS(workspaceId, projectId)}/task_chain/${taskId}`;

    if (modelId) {
        return `${baseUrl}?model_id=${modelId}`;
    }

    if (modelTemplateId) {
        return `${baseUrl}?algorithm_name=${modelTemplateId}`;
    }

    return baseUrl;
};

const SUPPORTED_ALGORITHMS = (domain?: DOMAIN): string =>
    `${API_VERSION}/supported_algorithms${domain ? `?task_type=${getTaskTypeFromDomain(domain)}` : ''}`;

const PRODUCT_INFO = `${API_VERSION}/product_info`;

const USER_REGISTRATION = `${USER_API}/confirm_registration`;

const USER_FORGOT_PASSWORD = `${USER_API}/password_reset`;

const USER_RESET_PASSWORD = `${USER_API}/update_password`;

const DATASET_IMPORT_TUS = (workspaceId: string) => `api/${WORKSPACE(workspaceId)}/datasets/uploads/resumable`;

const DATASET_IMPORT_PREPARE = (workspaceId: string, uploadId: string): string =>
    `${WORKSPACE(workspaceId)}/datasets:prepare-for-import?file_id=${uploadId}`;

const DATASET_IMPORT_CREATE = (workspaceId: string): string => `${WORKSPACE(workspaceId)}/projects:import-from-dataset`;

const EXPORT_LOGS = (startDate: string, endDate: string, type: 'cluster' | 'logs'): string =>
    `/api/download/logs?start-date=${startDate}&end-date=${endDate}&log-level=INFO&type=${type}`;

export const API_URLS = {
    THUMBNAIL,
    WORKSPACES,
    PROJECTS,
    PROJECT,
    DATASET_URL,
    MEDIA,
    ACTIVE_MEDIA,
    ADVANCED_DATASET_FILTER,
    MEDIA_UPLOAD,
    MEDIA_DELETE,
    MEDIA_ITEM,
    MEDIA_ITEM_SRC,
    MEDIA_ITEM_THUMBNAIL,
    MEDIA_ITEM_STREAM,
    ANNOTATIONS,
    SAVE_ANNOTATIONS,
    PREDICTION,
    ANNOTATIONS_STATISTICS,
    MODELS,
    MODEL_GROUPS,
    MODEL,
    PROJECT_STATUS,
    MODEL_STATISTICS,
    JOBS,
    JOB,
    JOBS_QUERY_PARAMS,
    STATUS,
    MANUAL_TRAIN_MODEL,
    CONFIGURATION_PARAMETERS,
    GLOBAL_CONFIGURATION_PARAMETERS,
    MODEL_CONFIG_PARAMETERS,
    SUPPORTED_ALGORITHMS,
    PROJECT_LABELS,
    EXPORT_MODEL,
    EXPORT_OPTIMIZED_MODEL,
    PREPARE_EXPORT_DATASET,
    EXPORT_DATASET_STATUS,
    EXPORT_DATASET,
    OPTIMIZE_MODEL,
    PRODUCT_INFO,
    USER_REGISTRATION,
    USER_FORGOT_PASSWORD,
    USER_RESET_PASSWORD,
    SETTINGS,
    DATASET_IMPORT_TUS,
    DATASET_IMPORT_PREPARE,
    DATASET_IMPORT_CREATE,
    EXPORT_LOGS,
};
