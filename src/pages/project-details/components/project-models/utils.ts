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
import {
    ConfigurableParametersComponentsBodyDTO,
    ConfigurableParametersParamsReconfigureDTO,
    ConfigurableParametersReconfigureDTO,
    EntityIdentifierDTO,
} from '../../../../core/configurable-parameters/dtos';
import {
    ConfigurableParametersComponents,
    ConfigurableParametersGroups,
    ConfigurableParametersParams,
    ConfigurableParametersTaskChain,
    EntityIdentifier,
} from '../../../../shared/components/configurable-parameters/configurable-parameters.interface';

const NUMBER_OF_CONCATENATED_IDS_WITH_GROUPS = 4; // taskId::componentId::groupId::parameterId

export function getNewParameterValue<T extends string | boolean | number>(
    parameter: ConfigurableParametersParams,
    value: T
): ConfigurableParametersParams {
    if (parameter.dataType === 'string' && typeof value === 'string') {
        return {
            ...parameter,
            value,
        };
    } else if (parameter.dataType === 'boolean' && typeof value === 'boolean') {
        return {
            ...parameter,
            value,
        };
    } else if (typeof value === 'number' && (parameter.dataType === 'float' || parameter.dataType === 'integer')) {
        return { ...parameter, value };
    }
    return parameter;
}

export const updateSelectedParameter = <T extends string | boolean | number>(
    configurableParameters: ConfigurableParametersTaskChain[],
    parameterId: string,
    ids: string[],
    value: T
): ConfigurableParametersTaskChain[] => {
    return configurableParameters.map((taskConfigParameters) => {
        const [taskId, componentId] = ids;
        if (taskConfigParameters.taskId !== taskId) {
            return taskConfigParameters;
        }
        return {
            ...taskConfigParameters,
            components: taskConfigParameters.components.map((component) => {
                if (component.id !== componentId) {
                    return component;
                }
                if (ids.length === NUMBER_OF_CONCATENATED_IDS_WITH_GROUPS) {
                    return {
                        ...component,
                        groups: component.groups?.map((group) => {
                            const [, , groupId] = ids;
                            if (group.id === groupId) {
                                return {
                                    ...group,
                                    parameters: group.parameters.map((parameter) => {
                                        if (parameter.id === parameterId) {
                                            return getNewParameterValue(parameter, value);
                                        }
                                        return parameter;
                                    }),
                                };
                            }
                            return group;
                        }),
                    };
                }
                return {
                    ...component,
                    parameters: component.parameters?.map((parameter) => {
                        if (parameter.id === parameterId) {
                            return getNewParameterValue(parameter, value);
                        }
                        return parameter;
                    }),
                };
            }),
        };
    });
};

export const getSelectedComponent = (
    configParameters: ConfigurableParametersTaskChain[] | undefined,
    selectedComponentId: string | undefined
): ConfigurableParametersComponents | undefined => {
    return configParameters
        ?.map((config) => config.components.find((component) => component.id === selectedComponentId))
        .find((component) => !!component);
};

const getParametersDTO = (parameters?: ConfigurableParametersParams[]): ConfigurableParametersParamsReconfigureDTO[] =>
    parameters?.map(({ value, name }) => ({ value, name })) ?? [];

const getEntityIdentifierDTO = (entityIdentifier: EntityIdentifier): EntityIdentifierDTO => {
    if (entityIdentifier.type === 'HYPER_PARAMETER_GROUP') {
        const { type, modelStorageId, workspaceId, groupName } = entityIdentifier;
        return {
            type,
            model_storage_id: modelStorageId,
            workspace_id: workspaceId,
            group_name: groupName,
        };
    } else if (entityIdentifier.type === 'HYPER_PARAMETERS') {
        const { type, modelStorageId, workspaceId } = entityIdentifier;
        return {
            type,
            model_storage_id: modelStorageId,
            workspace_id: workspaceId,
        };
    }
    if (entityIdentifier.taskId) {
        return {
            task_id: entityIdentifier.taskId,
            type: entityIdentifier.type,
            project_id: entityIdentifier.projectId,
            workspace_id: entityIdentifier.workspaceId,
            component: entityIdentifier.component,
        };
    }
    return {
        type: entityIdentifier.type,
        project_id: entityIdentifier.projectId,
        workspace_id: entityIdentifier.workspaceId,
        component: entityIdentifier.component,
    };
};

const getConfigGlobalDTO = (global: ConfigurableParametersTaskChain): ConfigurableParametersReconfigureDTO['global'] =>
    global.components.map(({ parameters, entityIdentifier }) => {
        return {
            type: 'CONFIGURABLE_PARAMETERS',
            parameters: getParametersDTO(parameters),
            entity_identifier: getEntityIdentifierDTO(entityIdentifier),
        };
    });

const hasComponentOnlyGroupsDTO = (
    groups: ConfigurableParametersGroups[]
): ConfigurableParametersComponentsBodyDTO['groups'] =>
    groups.map(({ parameters, type, name }) => ({
        type,
        name,
        parameters: getParametersDTO(parameters),
    }));

const hasComponentOnlyParametersDTO = (
    parameters: ConfigurableParametersParams[]
): ConfigurableParametersComponentsBodyDTO['parameters'] => getParametersDTO(parameters);

const getComponentsDTO = (components: ConfigurableParametersComponents[]): ConfigurableParametersComponentsBodyDTO[] =>
    components.map((component) => {
        const groups = component.groups ? hasComponentOnlyGroupsDTO(component.groups) : undefined;
        const parameters = component.parameters ? hasComponentOnlyParametersDTO(component.parameters) : undefined;
        return {
            entity_identifier: getEntityIdentifierDTO(component.entityIdentifier),
            groups,
            parameters,
        };
    });

const getConfigTaskChainDTO = (
    taskChain: ConfigurableParametersTaskChain[]
): ConfigurableParametersReconfigureDTO['task_chain'] =>
    taskChain.map(({ components }) => ({
        components: getComponentsDTO(components),
    }));

export const getReconfigureParametersDTO = (
    configParameters: ConfigurableParametersTaskChain[]
): ConfigurableParametersReconfigureDTO => {
    const globalEntity = configParameters.filter(({ taskId }) => taskId === 'global-config')[0];
    const global: ConfigurableParametersReconfigureDTO['global'] = getConfigGlobalDTO(globalEntity);

    const taskChainEntity = configParameters.filter(({ taskId }) => taskId !== 'global-config');
    const task_chain: ConfigurableParametersReconfigureDTO['task_chain'] = getConfigTaskChainDTO(taskChainEntity);

    return {
        global,
        task_chain,
    };
};

export const getTrainingConfigParametersDTO = ({
    components,
}: ConfigurableParametersTaskChain): { components: ConfigurableParametersComponentsBodyDTO[] } => {
    return {
        components: getComponentsDTO(components),
    };
};
