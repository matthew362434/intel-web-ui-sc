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

import { useCallback, useMemo, useState } from 'react';

import { Button, Flex, View } from '@adobe/react-spectrum';

import { useModels } from '../../../../core/models/hooks';
import { DOMAIN } from '../../../../core/projects';
import { Loading } from '../../../../shared/components';
import { PageLayout } from '../../../../shared/components/page-layout';
import { TasksList } from '../../../../shared/components/tasks-list';
import { useProjectIdentifier } from '../../../annotator/hooks/use-project-identifier';
import { useProject } from '../../providers';
import { EmptyProjectModels } from './empty-project-models';
import { useSelectedTask } from './hooks/use-selected-task';
import { ModelContainer } from './model-container';
import { ArchitectureModels, TasksItems } from './project-models.interface';
import { ReconfigureModels } from './reconfigure-models';
import { TrainModelDialog } from './train-model-dialog';
import { TrainingProgress } from './training-progress';

export const ProjectModels = (): JSX.Element => {
    const { workspaceId, projectId } = useProjectIdentifier();
    const {
        project: { tasks },
        isTaskChainProject,
    } = useProject();

    const items: Required<TasksItems>[] = useMemo(
        () => [
            { domain: 'All tasks', path: 'all', id: undefined },
            ...tasks
                .filter(({ domain }) => domain !== DOMAIN.CROP)
                .map((task) => ({ ...task, path: task.domain.toLocaleLowerCase() })),
        ],
        [tasks]
    );
    const [selectedTaskKey, setSelectedTaskKey] = useSelectedTask(items[0].path);
    const [selectedTask] = useMemo(
        () => items.filter(({ path }) => path === selectedTaskKey),
        [items, selectedTaskKey]
    );

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { data, isLoading: isLoadingModels, isSuccess: isSuccessModels } = useModels(workspaceId, projectId);

    // show not empty models for all tasks or the selected task
    const models = data?.filter(({ modelVersions, taskId }) =>
        selectedTask.id ? modelVersions.length && taskId === selectedTask.id : modelVersions.length
    );
    const areModels = !!models && models.length > 0;

    const handleClose = useCallback((): void => setIsOpen(false), []);

    return (
        <PageLayout
            breadcrumbs={[{ id: 'models-id', breadcrumb: 'Models' }]}
            header={
                <Flex alignItems={'center'} gap={'size-150'}>
                    <ReconfigureModels />
                    <>
                        <Button id={'train-new-model-button-id'} variant={'cta'} onPress={() => setIsOpen(true)}>
                            Train a new model
                        </Button>
                        <TrainModelDialog isOpen={isOpen} handleClose={handleClose} />
                    </>
                </Flex>
            }
        >
            {isLoadingModels ? (
                <Loading />
            ) : (
                <>
                    {isSuccessModels && models && <TrainingProgress models={models} />}
                    {isTaskChainProject && (
                        <TasksList
                            items={items}
                            selectedTask={selectedTaskKey}
                            setSelectedTask={setSelectedTaskKey}
                            marginTop={'size-200'}
                        />
                    )}

                    {areModels ? (
                        <View overflow={'auto'}>
                            {models?.map(
                                ({
                                    architectureName,
                                    modelVersions,
                                    architectureId,
                                    modelTemplateId,
                                    taskId,
                                }: ArchitectureModels) => (
                                    <ModelContainer
                                        architectureId={architectureId}
                                        architectureName={architectureName}
                                        modelVersions={modelVersions}
                                        key={architectureName}
                                        modelTemplateId={modelTemplateId}
                                        taskId={taskId}
                                    />
                                )
                            )}
                        </View>
                    ) : (
                        <EmptyProjectModels />
                    )}
                </>
            )}
        </PageLayout>
    );
};

export default ProjectModels;
