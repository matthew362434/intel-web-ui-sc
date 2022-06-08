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

import AXIOS from '../../../../../../core/services/axios-instance';
import { API_URLS } from '../../../../../../core/services/urls';
import {
    DatasetImportCreateProps,
    DatasetImportCreateResponse,
    DatasetImportCreateResponseDTO,
    DatasetImportPrepareProps,
    DatasetImportPrepareResponse,
    DatasetImportPrepareResponseDTO,
    DatasetImportProjectDataDTO,
    DatasetImportService,
} from './dataset-import.interface';

export const createApiDatasetImportService = (): DatasetImportService => {
    const prepare = async ({
        workspaceId,
        uploadId,
    }: DatasetImportPrepareProps): Promise<DatasetImportPrepareResponse> => {
        const { data } = await AXIOS.post<DatasetImportPrepareResponseDTO>(
            `${API_URLS.DATASET_IMPORT_PREPARE(workspaceId, uploadId)}`
        );

        return { warnings: data.warnings, labelToTasks: data.label_to_tasks };
    };

    const create = async ({
        workspaceId,
        projectData,
    }: DatasetImportCreateProps): Promise<DatasetImportCreateResponse> => {
        const projectDataDto: DatasetImportProjectDataDTO = {
            file_id: projectData.uploadId,
            project_name: projectData.projectName,
            task_type: projectData.taskType,
            labels: projectData.labels,
        };

        const { data } = await AXIOS.post<DatasetImportCreateResponseDTO>(
            `${API_URLS.DATASET_IMPORT_CREATE(workspaceId)}`,
            projectDataDto
        );

        return { projectId: data.project_id };
    };

    return { create, prepare };
};
