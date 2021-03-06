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

import { v4 as uuidV4 } from 'uuid';

import {
    ConfigurableParametersComponents,
    ConfigurableParametersTaskChain,
    ConfigurableParametersGroups,
    ConfigurableParametersParams,
    EntityIdentifier,
} from '../../../shared/components';
import {
    ConfigurableParametersDTO,
    ConfigurableParametersGroupsDTO,
    ConfigurableParametersParamsDTO,
    ConfigurableParametersTaskChainDTO,
    EntityIdentifierDTO,
} from '../dtos';

const getConfigParametersField = (
    parameters: ConfigurableParametersParamsDTO[],
    id: string,
    editable = false
): ConfigurableParametersParams[] =>
    parameters.map((parameter) => {
        const parameterId = `${id}::${uuidV4()}`;

        if (parameter.data_type === 'boolean') {
            const { data_type, default_value, template_type, auto_hpo_state, auto_hpo_value, ...rest } = parameter;
            return {
                ...rest,
                editable,
                id: parameterId,
                dataType: data_type,
                templateType: template_type,
                defaultValue: default_value,
                autoHPOValue: auto_hpo_value,
                autoHPOState: auto_hpo_state,
            };
        }
        if (parameter.template_type === 'selectable') {
            if (parameter.data_type === 'string') {
                const { default_value, template_type, data_type, auto_hpo_value, auto_hpo_state, ...rest } = parameter;
                return {
                    ...rest,
                    editable,
                    id: parameterId,
                    dataType: data_type,
                    templateType: template_type,
                    defaultValue: default_value,
                    autoHPOValue: auto_hpo_value,
                    autoHPOState: auto_hpo_state,
                };
            }
            const { default_value, template_type, data_type, auto_hpo_value, auto_hpo_state, ...rest } = parameter;
            return {
                ...rest,
                editable,
                id: parameterId,
                dataType: data_type,
                templateType: template_type,
                defaultValue: default_value,
                autoHPOValue: auto_hpo_value,
                autoHPOState: auto_hpo_state,
            };
        } else if (parameter.template_type === 'input') {
            const {
                data_type,
                template_type,
                default_value,
                max_value,
                min_value,
                auto_hpo_value,
                auto_hpo_state,
                ...rest
            } = parameter;
            return {
                ...rest,
                editable,
                id: parameterId,
                dataType: data_type,
                templateType: template_type,
                defaultValue: default_value,
                minValue: min_value,
                maxValue: max_value,
                autoHPOValue: auto_hpo_value,
                autoHPOState: auto_hpo_state,
            };
        }
        throw Error('This template type is not supported');
    });

const getConfigEntityIdentifier = (entityIdentifierDTO: EntityIdentifierDTO): EntityIdentifier => {
    if (entityIdentifierDTO.type === 'HYPER_PARAMETER_GROUP') {
        const { type, model_storage_id, workspace_id, group_name } = entityIdentifierDTO;
        return {
            type,
            modelStorageId: model_storage_id,
            workspaceId: workspace_id,
            groupName: group_name,
        };
    } else if (entityIdentifierDTO.type === 'HYPER_PARAMETERS') {
        const { type, model_storage_id, workspace_id } = entityIdentifierDTO;
        return {
            type,
            modelStorageId: model_storage_id,
            workspaceId: workspace_id,
        };
    }
    const { type, component, project_id, task_id, workspace_id } = entityIdentifierDTO;
    return {
        type,
        component,
        projectId: project_id,
        taskId: task_id,
        workspaceId: workspace_id,
    };
};

const hasComponentOnlyParameters = (
    parameters: ConfigurableParametersParamsDTO[],
    taskComponentId: string,
    editable: boolean
): ConfigurableParametersParams[] => {
    return getConfigParametersField(parameters, taskComponentId, editable);
};

const hasComponentOnlyGroups = (
    groups: ConfigurableParametersGroupsDTO[],
    taskComponentId: string,
    editable: boolean
): ConfigurableParametersGroups[] => {
    return groups.map((group) => {
        const groupId = uuidV4();
        const parameterIdPrefix = `${taskComponentId}::${groupId}`;
        const newParameters: ConfigurableParametersParams[] = getConfigParametersField(
            group.parameters,
            parameterIdPrefix,
            editable
        );
        return {
            ...group,
            id: groupId,
            parameters: newParameters,
        };
    });
};

export const getModelConfigEntity = (
    data: ConfigurableParametersTaskChainDTO,
    editable = false
): ConfigurableParametersTaskChain => {
    const { task_title, task_id, components } = data;
    const newComponents: ConfigurableParametersComponents[] = components.map((component) => {
        const { description, header, id, entity_identifier } = component;
        const taskComponentId = `${task_id}::${id}`;
        const entityIdentifier: EntityIdentifier = getConfigEntityIdentifier(entity_identifier);
        const groups = component.groups
            ? hasComponentOnlyGroups(component.groups, taskComponentId, editable)
            : undefined;
        const parameters = component.parameters
            ? hasComponentOnlyParameters(component.parameters, taskComponentId, editable)
            : undefined;
        return {
            id,
            header,
            description,
            entityIdentifier,
            parameters,
            groups,
        };
    });
    return {
        taskId: task_id,
        taskTitle: task_title,
        components: newComponents,
    };
};

export const getConfigParametersEntity = (data: ConfigurableParametersDTO): ConfigurableParametersTaskChain[] => {
    const { global, task_chain } = data;
    const taskChain: ConfigurableParametersTaskChain[] = task_chain.map((taskConfigParameter) =>
        getModelConfigEntity(taskConfigParameter, true)
    );

    const taskId = 'global-config';
    const newGlobal: ConfigurableParametersTaskChain = {
        taskId,
        taskTitle: 'Global',
        components: global.map(({ parameters, header, description, entity_identifier, id }) => ({
            id,
            header,
            description,
            entityIdentifier: getConfigEntityIdentifier(entity_identifier),
            type: 'PARAMETER_GROUP',
            name: header.toLowerCase().split(' ').join('-'),
            parameters: getConfigParametersField(parameters, `${taskId}::${id}`, true),
        })),
    };

    return [newGlobal, ...taskChain];
};
