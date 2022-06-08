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

import { createContext, ReactNode, useContext, useState } from 'react';

import { useHistory } from 'react-router-dom';

import { DOMAIN, isAnomalyDomain } from '../../../core/projects';
import { useCreateProject } from '../../../core/projects/hooks/use-create-project.hook';
import { PATHS } from '../../../core/services';
import { useApplicationContext } from '../../../providers';
import { AnimationDirections } from '../../../shared/animation-parameters/animation-parameters';
import { MissingProviderError } from '../../../shared/missing-provider-error';
import { ProjectLabelsManagement, SelectProjectTemplate } from '../components';
import {
    NewProjectDialogContextProps,
    Project,
    ProjectType,
    StepInterface,
    STEPS,
} from './new-project-dialog-provider.interface';

interface NewProjectDialogProviderProps {
    children: ReactNode;
}

export const NewProjectDialogContext = createContext<NewProjectDialogContextProps | undefined>(undefined);

export const NewProjectDialogProvider = ({ children }: NewProjectDialogProviderProps): JSX.Element => {
    const PROJECT_CREATION_INITIAL_STATE = {
        name: '',
        selectedDomains: [],
        projectTypeMetadata: [],
        currentStep: STEPS.SELECT_TEMPLATE,
        selectedTab: DOMAIN.DETECTION,
        projectType: ProjectType.SINGLE,
    };

    const { workspaceId } = useApplicationContext();
    const history = useHistory();
    const { createProject } = useCreateProject();
    const [projectCreationState, setProjectCreationState] = useState<Project>(PROJECT_CREATION_INITIAL_STATE);
    const [isValid, setValidity] = useState<boolean>(false);
    const [animationDirection, setAnimationDirection] = useState<number>(AnimationDirections.MOVE_LEFT);

    const getSteps = (key: STEPS, domains: DOMAIN[]): StepInterface => {
        const { projectType, projectTypeMetadata } = projectCreationState;

        const canCreateProject = projectType === ProjectType.SINGLE && projectTypeMetadata.length === 1;

        switch (key) {
            case STEPS.SELECT_TEMPLATE:
                return {
                    component: (
                        <SelectProjectTemplate animationDirection={animationDirection} setValidity={setValidity} />
                    ),
                    next: isAnomalyDomain(domains[0]) ? null : STEPS.LABEL_MANAGEMENT,
                    previous: null,
                    key: STEPS.SELECT_TEMPLATE,
                };
            case STEPS.LABEL_MANAGEMENT:
                return {
                    component: (
                        <ProjectLabelsManagement
                            animationDirection={animationDirection}
                            setValidity={setValidity}
                            selectedDomain={projectCreationState.selectedDomains[0]}
                        />
                    ),
                    next: canCreateProject ? null : STEPS.LABEL_MANAGEMENT_SECOND_TASK,
                    previous: STEPS.SELECT_TEMPLATE,
                    key: STEPS.LABEL_MANAGEMENT,
                };
            case STEPS.LABEL_MANAGEMENT_SECOND_TASK:
                return {
                    component: (
                        <ProjectLabelsManagement
                            animationDirection={animationDirection}
                            setValidity={setValidity}
                            selectedDomain={projectCreationState.selectedDomains[1]}
                            key={projectCreationState.selectedDomains[1]}
                        />
                    ),
                    next: null,
                    previous: STEPS.LABEL_MANAGEMENT,
                    key: STEPS.LABEL_MANAGEMENT_SECOND_TASK,
                };
        }
    };

    const resetSteps = (): void => {
        setProjectCreationState(() => PROJECT_CREATION_INITIAL_STATE);
    };

    const updateProjectState = (projectState: Partial<Project>) => {
        setProjectCreationState((prevState) => ({ ...prevState, ...projectState }));
    };

    const updateStep = (stepKey: STEPS): void => {
        setProjectCreationState((prevState) => ({ ...prevState, currentStep: stepKey }));
    };

    const save = async () => {
        const { name, selectedDomains, projectTypeMetadata } = projectCreationState;

        createProject.mutate(
            { workspaceId, name, domains: selectedDomains, projectTypeMetadata },
            {
                onSuccess: (response) => {
                    history.push(PATHS.getProjectUrl(response.id));
                },
            }
        );
    };

    const currentStep = getSteps(projectCreationState.currentStep, projectCreationState.selectedDomains);

    const hasNextStep = currentStep.next !== null;
    const goToNextStep = () => {
        if (currentStep.next) {
            setAnimationDirection(() => AnimationDirections.MOVE_RIGHT);
            updateStep(currentStep.next);
        }
    };

    const hasPreviousStep = currentStep.previous !== null;
    const goToPreviousStep = () => {
        if (currentStep.previous) {
            setAnimationDirection(() => AnimationDirections.MOVE_LEFT);
            updateStep(currentStep.previous);
        }
    };

    return (
        <NewProjectDialogContext.Provider
            value={{
                save,
                isLoading: createProject.isLoading,
                metadata: projectCreationState,
                updateProjectState,
                hasNextStep,
                hasPreviousStep,
                goToNextStep,
                goToPreviousStep,
                resetSteps,
                content: currentStep.component,
                isValid,
            }}
        >
            {children}
        </NewProjectDialogContext.Provider>
    );
};

export const useNewProjectDialog = (): NewProjectDialogContextProps => {
    const context = useContext(NewProjectDialogContext);

    if (context === undefined) {
        throw new MissingProviderError('useNewProjectDialog', 'NewProjectDialogProvider');
    }

    return context;
};
