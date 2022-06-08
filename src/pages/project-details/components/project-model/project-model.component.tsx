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

import { Key, useMemo, useState } from 'react';

import { Flex } from '@adobe/react-spectrum';
import { useHistory } from 'react-router-dom';

import { useArchitectureModels } from '../../../../core/models/hooks';
import { PATHS } from '../../../../core/services';
import { useModelIdentifier } from '../../../../hooks';
import { Loading, TabItem, Tabs } from '../../../../shared/components';
import { PageLayout } from '../../../../shared/components/page-layout';
import { idMatchingFormat } from '../../../../test-utils';
import { useTasksWithSupportedAlgorithms } from '../../hooks/use-tasks-with-supported-algorithms';
import { ModelCardProps } from '../project-models/model-container/model-card';
import { getModelTemplateDetails, isHPOSupportedByAlgorithm } from '../project-models/train-model-dialog/utils';
import { useOptimizedModels } from './hooks/use-optimized-models';
import { HpoStartedNotification } from './hpo-started-notification';
import { ModelBreadcrumb } from './model-breadcrumb';
import { ModelConfigurableParameters } from './model-configurable-parameters';
import { ModelStatistics } from './model-statistics';
import { OptimizedModels } from './optimized-model';
import classes from './project-model.module.scss';
import { StartOptimization } from './start-optimization';

enum ModelTabsKeys {
    OPTIMIZED_MODELS = 'optimized-models',
    STATISTICS = 'statistics',
    CONFIGURABLE_PARAMETERS = 'configurable-parameters',
}

export const ProjectModel = (): JSX.Element => {
    const { workspaceId, projectId, architectureId, modelId, taskName } = useModelIdentifier();
    const { isLoading, data: modelGroup } = useArchitectureModels(workspaceId, projectId, architectureId);
    const [isHPONotificationOpen, setIsHPONotificationOpen] = useState<boolean>(false);

    const [selectedModelId, setSelectedModelId] = useState<string>(modelId);
    const selectedModel: ModelCardProps | undefined = useMemo(
        () => modelGroup?.modelVersions.find(({ id }) => id === selectedModelId),
        [modelGroup, selectedModelId]
    );

    const { modelDetails, ...rest } = useOptimizedModels(selectedModel?.version ?? 1);

    const { tasksWithSupportedAlgorithms } = useTasksWithSupportedAlgorithms();
    const [isOverflowOn, setIsOverflowOn] = useState<boolean>(false);
    const history = useHistory();

    if (modelGroup === undefined || selectedModel === undefined || modelDetails === undefined || isLoading) {
        return <Loading />;
    }

    const { modelTemplateId, taskId, architectureName } = modelGroup;

    const ITEMS: TabItem[] = [
        {
            id: 'optimized-models-id',
            key: ModelTabsKeys.OPTIMIZED_MODELS,
            name: 'Optimized models',
            children: <OptimizedModels modelDetails={modelDetails} {...rest} />,
        },
        {
            id: 'statistics-id',
            key: ModelTabsKeys.STATISTICS,
            name: 'Statistics',
            children: <ModelStatistics />,
        },
        {
            id: 'configurable-parameters-id',
            key: ModelTabsKeys.CONFIGURABLE_PARAMETERS,
            name: 'Configurable parameters',
            children: <ModelConfigurableParameters taskId={taskId} />,
        },
    ];

    const { templateName } = getModelTemplateDetails(modelTemplateId, tasksWithSupportedAlgorithms[taskId]);
    const name = `${templateName} (${architectureName})`;

    const handleSelectModel = (key: Key): void => {
        const newSelectedModel = modelGroup?.modelVersions.find(({ version }) => version === +key);
        if (newSelectedModel) {
            const { id } = newSelectedModel;
            setSelectedModelId(id);
            history.push(PATHS.getProjectModelUrl(projectId, architectureId, id, taskName));
        }
    };

    return (
        <PageLayout
            breadcrumbs={[
                { id: 'models-id', breadcrumb: 'Models', href: PATHS.getProjectModelsUrl(projectId, taskName) },
                {
                    id: `${idMatchingFormat(name)}-id`,
                    breadcrumb: (
                        <ModelBreadcrumb
                            handleSelectModel={handleSelectModel}
                            selectedModel={selectedModel}
                            modelGroup={modelGroup}
                            name={name}
                        />
                    ),
                },
            ]}
            header={
                <StartOptimization
                    modelTemplateId={modelTemplateId}
                    taskId={taskId}
                    isHPOSupported={isHPOSupportedByAlgorithm(tasksWithSupportedAlgorithms[taskId], modelTemplateId)}
                    handleOpenHPONotification={() => setIsHPONotificationOpen(true)}
                    {...rest}
                />
            }
        >
            <>
                <Flex
                    direction={'column'}
                    height={'100%'}
                    marginTop={'size-400'}
                    UNSAFE_className={classes.projectModelView}
                >
                    <Flex direction={'column'} flex={1} minHeight={0}>
                        <Tabs
                            minHeight={0}
                            aria-label={'Model details'}
                            items={ITEMS}
                            height={'100%'}
                            onSelectionChange={(key) => setIsOverflowOn(key === ModelTabsKeys.OPTIMIZED_MODELS)}
                            panelOverflowY={isOverflowOn ? 'auto' : 'hidden'}
                        />
                    </Flex>
                </Flex>
                <HpoStartedNotification
                    handleCloseHPONotification={() => setIsHPONotificationOpen(false)}
                    isHPONotificationOpen={isHPONotificationOpen}
                />
            </>
        </PageLayout>
    );
};

export default ProjectModel;
