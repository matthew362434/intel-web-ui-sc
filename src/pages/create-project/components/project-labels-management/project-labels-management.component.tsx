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

import { useEffect, useState } from 'react';

import { Divider } from '@adobe/react-spectrum';

import { DOMAIN, TaskMetadata } from '../../../../core/projects';
import { SliderAnimation } from '../../../../shared/components';
import { LabelTreeItem } from '../../../annotator/components/labels/label-tree-view';
import { STEPS, useNewProjectDialog } from '../../new-project-dialog-provider';
import { DomainChainSteps } from './domain-chain-steps.component';
import { TaskLabelsManagement } from './task-labels-management/task-labels-management.component';
import { getLabelTreeType, getProjectLabels } from './utils';

interface ManageProjectLabelsProps {
    setValidity: (isValid: boolean) => void;
    animationDirection: number;
    selectedDomain: DOMAIN;
}

export const ProjectLabelsManagement = ({
    setValidity,
    animationDirection,
    selectedDomain,
}: ManageProjectLabelsProps): JSX.Element => {
    const [selectedTask, setSelectedTask] = useState<DOMAIN>(selectedDomain);

    useEffect(() => {
        if (selectedDomain !== selectedTask) {
            setSelectedTask(selectedDomain);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDomain]);

    const { updateProjectState, metadata, isValid, goToNextStep } = useNewProjectDialog();

    const { projectTypeMetadata, selectedDomains: domains } = metadata;

    const isTaskChain = domains.length > 1;
    const projectLabels = getProjectLabels(projectTypeMetadata);
    const taskMetadata = projectTypeMetadata.find((task) => task.domain === selectedTask);

    if (!taskMetadata) {
        // In normal case taskMetadata should always be found on the list
        return <></>;
    }

    const setTaskLabelsHandler = (labels: LabelTreeItem[]) => {
        let editedTasksLabels: TaskMetadata[];

        if (projectTypeMetadata.map((task) => task.domain).includes(selectedTask)) {
            editedTasksLabels = projectTypeMetadata.map((task) => {
                if (task.domain === selectedTask) {
                    return { ...task, labels: labels };
                } else {
                    return task;
                }
            });
        } else {
            editedTasksLabels = [
                ...projectTypeMetadata,
                { domain: selectedTask, labels, relation: taskMetadata.relation },
            ];
        }

        updateProjectState({ projectTypeMetadata: editedTasksLabels });
    };

    const handleNext = () => {
        isValid && goToNextStep && goToNextStep();
    };

    return (
        <SliderAnimation animationDirection={animationDirection}>
            {domains.length > 1 ? (
                <>
                    <DomainChainSteps
                        domains={domains}
                        selected={selectedTask}
                        isValid={isValid}
                        handleSelection={(domain: DOMAIN) => {
                            const step =
                                domain === domains[0] ? STEPS.LABEL_MANAGEMENT : STEPS.LABEL_MANAGEMENT_SECOND_TASK;

                            setSelectedTask(domain);
                            updateProjectState({ currentStep: step });
                        }}
                    />
                    <Divider size={'S'} />
                </>
            ) : (
                <></>
            )}

            <TaskLabelsManagement
                setValidity={setValidity}
                next={handleNext}
                type={getLabelTreeType(selectedTask, isTaskChain && selectedTask === domains[0])}
                setLabels={setTaskLabelsHandler}
                projectLabels={projectLabels}
                key={selectedDomain}
                taskMetadata={taskMetadata}
            />
        </SliderAnimation>
    );
};
