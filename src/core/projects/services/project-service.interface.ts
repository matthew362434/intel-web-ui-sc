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

import { ExportDatasetStatusDTO } from '../../configurable-parameters/dtos';
import {
    DatasetIdentifier,
    CreateProjectProps,
    DOMAIN,
    ProjectIdentifier,
    ProjectProps,
    TaskMetadata,
    Settings,
    ExportDatasetIdentifier,
    ExportDatasetStatusIdentifier,
    EditProjectProps,
} from '../../projects';
import { ProjectStatus } from '../project-status.interface';

export interface ProjectService {
    getProjects(workspaceId: string): Promise<ProjectProps[]>;
    getProject(projectIdentifier: ProjectIdentifier): Promise<ProjectProps>;
    getProjectSettings(projectId: string): Promise<Settings>;
    saveProjectSettings(projectId: string, settings: Settings): Promise<void>;
    editProject(projectIdentifier: ProjectIdentifier, body: EditProjectProps): Promise<ProjectProps>;
    createProject(
        workspaceId: string,
        name: string,
        domains: DOMAIN[],
        projectTypeMetadata: TaskMetadata[]
    ): Promise<CreateProjectProps>;
    deleteProject(projectIdentifier: ProjectIdentifier): Promise<string>;
    deleteAllMedia(datasetIdentifier: DatasetIdentifier): Promise<string>;
    getProjectStatus(projectIdentifier: ProjectIdentifier): Promise<ProjectStatus>;
    prepareExportDataset(exportDatasetIdentifier: ExportDatasetIdentifier): Promise<{ exportDatasetId: string }>;
    exportDatasetStatus(exportDatasetStatusIdentifier: ExportDatasetStatusIdentifier): Promise<ExportDatasetStatusDTO>;
}
