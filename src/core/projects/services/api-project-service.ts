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

import { getDefinedFromList } from '../../../shared/utils';
import { ExportDatasetStatusDTO } from '../../configurable-parameters/dtos';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { DatasetIdentifier, ExportDatasetIdentifier, ExportDatasetStatusIdentifier } from '../dataset.interface';
import { ProjectDTO, ProjectStatusDTO, SettingsDTO } from '../dtos';
import { ProjectStatus } from '../project-status.interface';
import { CreateProjectProps, DOMAIN, ProjectCreation, ProjectIdentifier, ProjectProps } from '../project.interface';
import { getFormattedTimeRemaining, getRoundedProgress } from '../utils';
import { ProjectService } from './project-service.interface';
import { getConnections, getProjectDTO, getProjectEntity, getTasks, TaskMetadata } from './utils';

export const createApiProjectService = (): ProjectService => {
    const getProjects = async (workspaceId: string): Promise<ProjectProps[]> => {
        const response = await AXIOS.get<{ items: ProjectDTO[] }>(API_URLS.PROJECTS(workspaceId));

        const projectsList = (response.data.items || [])
            .reverse()
            .map((serverProject: ProjectDTO) => getProjectEntity({ ...serverProject, performance: { score: 0 } }));

        return getDefinedFromList<ProjectProps>(projectsList);
    };

    const getProject = async (projectIdentifier: ProjectIdentifier): Promise<ProjectProps> => {
        const { data } = await AXIOS.get<ProjectDTO>(
            API_URLS.PROJECT(projectIdentifier.workspaceId, projectIdentifier.projectId)
        );

        return getProjectEntity(data);
    };

    const getProjectSettings = async (projectId: string): Promise<SettingsDTO> => {
        const { data } = await AXIOS.get<SettingsDTO>(API_URLS.SETTINGS(projectId));

        return data;
    };

    const saveProjectSettings = async (projectId: string, settings: SettingsDTO): Promise<void> => {
        await AXIOS.post<{ result: string }>(API_URLS.SETTINGS(projectId), settings);
    };

    const editProject = async (projectIdentifier: ProjectIdentifier, project: ProjectProps): Promise<ProjectProps> => {
        const { data } = await AXIOS.put(
            API_URLS.PROJECT(projectIdentifier.workspaceId, projectIdentifier.projectId),
            getProjectDTO(project)
        );

        return getProjectEntity(data);
    };

    const createProject = async (
        workspaceId: string,
        name: string,
        domains: DOMAIN[],
        tasksLabels: TaskMetadata[]
    ): Promise<CreateProjectProps> => {
        const filteredDomains = domains.filter((domain) => domain !== DOMAIN.CROP);
        const connections = getConnections(filteredDomains);
        const tasks = getTasks(tasksLabels, filteredDomains);

        const body: ProjectCreation = {
            name,
            pipeline: {
                connections,
                tasks,
            },
        };
        const { data } = await AXIOS.post<ProjectDTO>(API_URLS.PROJECTS(workspaceId), body);

        return getProjectEntity(data);
    };

    const deleteProject = async ({ workspaceId, projectId }: ProjectIdentifier): Promise<string> => {
        const { data } = await AXIOS.delete<{ result: string }>(API_URLS.PROJECT(workspaceId, projectId));

        return data.result;
    };

    const deleteAllMedia = async ({ workspaceId, projectId, datasetId }: DatasetIdentifier): Promise<string> => {
        const { data } = await AXIOS.delete<{ result: string }>(
            API_URLS.DATASET_URL(workspaceId, projectId, datasetId)
        );

        return data.result;
    };

    const getProjectStatus = async ({ workspaceId, projectId }: ProjectIdentifier): Promise<ProjectStatus> => {
        const url = API_URLS.PROJECT_STATUS(workspaceId, projectId);
        const { data } = await AXIOS.get<ProjectStatusDTO>(url);

        return {
            score: data.project_score,
            isTraining: data.is_training,
            trainingDetails: {
                progress: getRoundedProgress(data.status.progress),
                message: data.status.message,
                timeRemaining: getFormattedTimeRemaining(data.status.time_remaining),
            },
            tasks: data.tasks,
        };
    };

    const prepareExportDataset = async ({
        workspaceId,
        datasetId,
        exportFormat,
    }: ExportDatasetIdentifier): Promise<{ exportDatasetId: string }> => {
        const { data } = await AXIOS.post<{
            status_url: string;
            export_dataset_id: string;
        }>(API_URLS.PREPARE_EXPORT_DATASET(workspaceId, datasetId, exportFormat));

        return {
            exportDatasetId: data.export_dataset_id,
        };
    };

    const exportDatasetStatus = async ({
        workspaceId,
        datasetId,
        exportDatasetId,
    }: ExportDatasetStatusIdentifier): Promise<ExportDatasetStatusDTO> => {
        const { data } = await AXIOS.get<ExportDatasetStatusDTO>(
            API_URLS.EXPORT_DATASET_STATUS(workspaceId, datasetId, exportDatasetId)
        );

        return data;
    };

    return {
        getProjects,
        getProject,
        getProjectSettings,
        saveProjectSettings,
        editProject,
        createProject,
        deleteProject,
        getProjectStatus,
        deleteAllMedia,
        prepareExportDataset,
        exportDatasetStatus,
    };
};
