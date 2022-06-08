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
import { DOMAIN, TaskMetadata } from '../../../core/projects';

export interface NewProjectDialogContextProps {
    save: () => void;
    isLoading: boolean;
    metadata: Project;
    updateProjectState: (projectState: Partial<Project>) => void;
    hasNextStep: boolean;
    hasPreviousStep: boolean;
    goToNextStep: (() => void | null) | undefined;
    goToPreviousStep: (() => void | null) | undefined;
    resetSteps: () => void;
    content: JSX.Element;
    isValid: boolean;
}

interface SelectProjectTemplateProps {
    name: string;
    selectedDomains: DOMAIN[];
    selectedTab: DOMAIN;
    projectType: ProjectType;
    currentStep: STEPS;
}

interface ProjectLabelsManagementProps {
    projectTypeMetadata: TaskMetadata[];
}

export type Project = SelectProjectTemplateProps & ProjectLabelsManagementProps;
export type Step = SelectProjectTemplateProps | ProjectLabelsManagementProps;

export interface StepInterface {
    component: JSX.Element;
    next: STEPS | null;
    previous: STEPS | null;
    key: STEPS;
}

export enum ProjectType {
    SINGLE = 'Single',
    TASK_CHAIN = 'Task chain',
}

export enum STEPS {
    SELECT_TEMPLATE = 'select-template',
    LABEL_MANAGEMENT = 'label-management',
    LABEL_MANAGEMENT_SECOND_TASK = 'label-management-second-task',
}
