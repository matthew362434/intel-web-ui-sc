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

import { AdvancedFilterOptions, AdvancedFilterSortingOptions } from '../../pages/media/media-filter.interface';
import { MediaIdentifier, VideoIdentifier } from '../media';
import { MediaSearchOptions } from '../media/services/media-service.interface';
import { DatasetIdentifier, DOMAIN, ProjectIdentifier, Task } from '../projects';

const WORKSPACES = 'workspaces';

const DATASET_STATISTICS_KEY = (
    projectId: string,
    datasetId: string,
    taskId: string
): [string, string, string, string] => [projectId, 'dataset-statistics', datasetId, taskId];

const MODELS_KEY = (workspaceId: string, projectId: string): readonly [string, string, string] => [
    workspaceId,
    projectId,
    'models',
];

const MODELS_ARCHITECTURE = (
    workspaceId: string,
    projectId: string,
    architectureId: string
): readonly [string, string, string, string] => [...MODELS_KEY(workspaceId, projectId), architectureId];

const MODEL_KEY = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string
): readonly [string, string, string, string, string] => [
    ...MODELS_ARCHITECTURE(workspaceId, projectId, architectureId),
    modelId,
];

const getSelectedMediaItemQueryKeys = () => {
    const commonKey = (mediaItemIdentifier: MediaIdentifier | undefined): [string, MediaIdentifier | undefined] => [
        'selected-media-items',
        mediaItemIdentifier,
    ];

    return {
        IMAGE: (mediaIdentifier: MediaIdentifier | undefined) => [...commonKey(mediaIdentifier), 'image'],
        ANNOTATIONS: (mediaIdentifier: MediaIdentifier | undefined) => [...commonKey(mediaIdentifier), 'annotations'],
        PREDICTIONS: (mediaIdentifier: MediaIdentifier | undefined, taskId?: string) => [
            ...commonKey(mediaIdentifier),
            taskId,
            'predictions',
        ],
        SELECTED: (mediaIdentifier: MediaIdentifier | undefined, taskId?: string) => [
            ...commonKey(mediaIdentifier),
            taskId,
            'selected',
        ],
    };
};

const SELECTED_MEDIA_ITEM = getSelectedMediaItemQueryKeys();

const MEDIA_ITEM_ANNOTATIONS = (identifier: MediaIdentifier): [string, MediaIdentifier, string] => [
    'media',
    identifier,
    'annotations',
];

const MEDIA_ITEM = (datasetIdentifier: DatasetIdentifier, mediaIdentifier: MediaIdentifier | undefined) => {
    return [datasetIdentifier, 'media-item', mediaIdentifier];
};

const VIDEO_TIMELINE_ANNOTATIONS = (
    datasetIdentifier: DatasetIdentifier,
    identifier: VideoIdentifier
): [DatasetIdentifier, VideoIdentifier, string] => [datasetIdentifier, identifier, 'annotations'];

const VIDEO_TIMELINE_PREDICTIONS = (
    datasetIdentifier: DatasetIdentifier,
    identifier: VideoIdentifier
): [DatasetIdentifier, VideoIdentifier, string] => [datasetIdentifier, identifier, 'predictions'];

const VIDEO_RANGE_ANNOTATIONS = (
    datasetIdentifier: DatasetIdentifier,
    identifier: VideoIdentifier
): [DatasetIdentifier, VideoIdentifier, string] => [datasetIdentifier, identifier, 'range-annotations'];

const MEDIA_ITEMS = (
    datasetIdentifier: DatasetIdentifier,
    searchOptions?: Partial<MediaSearchOptions>
): [DatasetIdentifier, string] | [DatasetIdentifier, string, Partial<MediaSearchOptions>] => {
    if (searchOptions === undefined) {
        return [datasetIdentifier, 'media'];
    }

    return [datasetIdentifier, 'media', searchOptions];
};

const ADVANCED_MEDIA_ITEMS = (
    datasetIdentifier: DatasetIdentifier,
    searchOptions: AdvancedFilterOptions,
    sortingOptions: AdvancedFilterSortingOptions
): [DatasetIdentifier, string, AdvancedFilterOptions, AdvancedFilterSortingOptions] => {
    return [datasetIdentifier, 'media-filter', searchOptions, sortingOptions];
};

const ACTIVE_MEDIA_ITEMS = (
    datasetIdentifier: DatasetIdentifier,
    selectedTask: Task | null
): ReadonlyArray<DatasetIdentifier | string> => {
    const key = [datasetIdentifier, 'media', 'active'] as const;
    if (selectedTask !== null) {
        return [...key, selectedTask.id];
    }

    return key;
};

const NEXT_ACTIVE_MEDIA_ITEM = (
    datasetIdentifier: DatasetIdentifier,
    currentMediaItemIdentifier: MediaIdentifier | undefined
): [string, DatasetIdentifier, MediaIdentifier | undefined] => [
    'next-active-media',
    datasetIdentifier,
    currentMediaItemIdentifier,
];

const MODEL_STATISTICS_KEY = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string
): readonly [string, string, string, string, string] => [
    workspaceId,
    projectId,
    architectureId,
    modelId,
    'training-statistics',
];

const PROJECT_STATUS_KEY = (projectIdentifier: ProjectIdentifier): [string, string, string] => [
    projectIdentifier.workspaceId,
    projectIdentifier.projectId,
    'project-status',
];

const STATUS_KEY = (): [string] => ['status'];

const JOBS_KEY = (workspaceId: string, areTrainingDetails?: boolean): [string, string, string] => [
    workspaceId,
    'jobs',
    areTrainingDetails ? 'training_details' : 'jobs_management',
];

const JOB_DELETE_KEY = (workspaceId: string, jobId: string): readonly [string, string, string] => [
    workspaceId,
    jobId,
    'delete-job',
];

const PROJECTS_KEY = (workspaceId: string): readonly [string, string] => [workspaceId, 'projects'];

const PROJECT_KEY = (workspaceId: string, projectId: string): readonly [string, string, string] => [
    ...PROJECTS_KEY(workspaceId),
    projectId,
];

const SETTINGS_KEY = (workspaceId: string, projectId: string): readonly [string, string, string] => [
    workspaceId,
    projectId,
    'settings',
];

const CONFIGURATION = (workspaceId: string, projectId: string): readonly [string, string, string, string] => [
    ...PROJECT_KEY(workspaceId, projectId),
    'configuration',
];

const PROJECT_LABELS_KEY = (
    datasetIdentifier: DatasetIdentifier
): readonly [string, string, string, string, string] => [
    ...PROJECT_KEY(datasetIdentifier.workspaceId, datasetIdentifier.projectId),
    datasetIdentifier.datasetId,
    'labels',
];

const MODEL_CONFIG_PARAMETERS = (
    workspaceId: string,
    projectId: string,
    taskId: string,
    modelId?: string,
    modelTemplateId?: string
): readonly [string, string, string, string, string, string | undefined] => {
    if (modelId) {
        return [...CONFIGURATION(workspaceId, projectId), taskId, modelId];
    }

    if (modelTemplateId) {
        return [...CONFIGURATION(workspaceId, projectId), taskId, modelTemplateId];
    }

    return [...CONFIGURATION(workspaceId, projectId), taskId, undefined];
};

const SUPPORTED_ALGORITHMS = (domain: DOMAIN | undefined): [string, DOMAIN | undefined] => [
    'supported_algorithms',
    domain,
];

const EXPORT_MODEL = (
    workspaceId: string,
    projectId: string,
    architectureId: string,
    modelId: string,
    includeCode: boolean
): readonly [string, string, string, string, boolean, string] => [
    workspaceId,
    projectId,
    architectureId,
    modelId,
    includeCode,
    'export-model',
];

const QUERY_KEYS = {
    WORKSPACES,
    DATASET_STATISTICS_KEY,
    MODELS_KEY,
    MODEL_KEY,
    MODEL_STATISTICS_KEY,
    MODELS_ARCHITECTURE,
    MEDIA_ITEM,
    MEDIA_ITEMS,
    ADVANCED_MEDIA_ITEMS,
    ACTIVE_MEDIA_ITEMS,
    SELECTED_MEDIA_ITEM,
    MEDIA_ITEM_ANNOTATIONS,
    VIDEO_TIMELINE_ANNOTATIONS,
    VIDEO_TIMELINE_PREDICTIONS,
    VIDEO_RANGE_ANNOTATIONS,
    NEXT_ACTIVE_MEDIA_ITEM,
    PROJECT_STATUS_KEY,
    STATUS_KEY,
    JOBS_KEY,
    JOB_DELETE_KEY,
    PROJECTS_KEY,
    PROJECT_KEY,
    CONFIGURATION,
    MODEL_CONFIG_PARAMETERS,
    SUPPORTED_ALGORITHMS,
    PROJECT_LABELS_KEY,
    EXPORT_MODEL,
    SETTINGS_KEY,
};

export default QUERY_KEYS;
