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

import { useEffect, useState, Key, useCallback } from 'react';

import { ValidationError } from 'yup';

import { DOMAIN, TaskMetadata } from '../../../../core/projects';
import { ValidationErrorMsg, Tabs, TabItem, SliderAnimation, LimitedTextField } from '../../../../shared/components';
import { idMatchingFormat } from '../../../../test-utils';
import { LabelTreeItem } from '../../../annotator/components/labels/label-tree-view';
import { useProjectsList } from '../../../landing-page/components/landing-page-workspace/components';
import { isYupValidationError } from '../../../profile-page/utils';
import { STEPS, useNewProjectDialog } from '../../new-project-dialog-provider';
import { ProjectType } from '../../new-project-dialog-provider/new-project-dialog-provider.interface';
import { ProjectNameErrorPath, projectNameSchema } from '../utils';
import classes from './project-template.module.scss';
import { SingleTaskTemplate } from './single-task-template.component';
import { TaskChainTemplate } from './task-chain-template.component';
import { LabelsRelationType, TABS_SINGLE_TEMPLATE, taskChainSubDomains } from './utils';

interface SelectProjectTemplateProps {
    setValidity: (isValid: boolean) => void;
    animationDirection: number;
}

const DEFAULT_ERRORS = { name: '' };

export const SelectProjectTemplate = ({ setValidity, animationDirection }: SelectProjectTemplateProps): JSX.Element => {
    const { projects } = useProjectsList();

    const {
        metadata: { name, selectedDomains, selectedTab, projectTypeMetadata },
        updateProjectState,
    } = useNewProjectDialog();

    const [projectName, setProjectName] = useState<string>(name);
    const [errors, setErrors] = useState<{ [key in ProjectNameErrorPath]: string }>(DEFAULT_ERRORS);

    const setDomains = (newDomains: DOMAIN[], relations: LabelsRelationType[]): void => {
        const newProjectTypeMetadata: TaskMetadata[] = newDomains.map((domain, index) => {
            const domainTaskMetadata = projectTypeMetadata.find((taskMetadata) => taskMetadata.domain === domain);
            if (domainTaskMetadata && domainTaskMetadata.relation === relations[index]) {
                return domainTaskMetadata;
            } else {
                return { domain, relation: relations[index], labels: [] as LabelTreeItem[] } as TaskMetadata;
            }
        });

        updateProjectState({ selectedDomains: newDomains, projectTypeMetadata: newProjectTypeMetadata });
    };

    const handleTabSelectionChange = (key: Key) => {
        updateProjectState({
            projectType: key === 'chain' ? ProjectType.TASK_CHAIN : ProjectType.SINGLE,
            selectedTab: key as DOMAIN,
            projectTypeMetadata: [],
        });
    };

    useEffect(() => {
        if (projectName) {
            validateProjectName(projectName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateProjectName = useCallback(
        (inputProjectName: string): void => {
            try {
                const trimedName = inputProjectName.trim();
                const validated = projectNameSchema(trimedName, projects).validateSync(
                    { name: trimedName, domain: selectedDomains },
                    { abortEarly: false }
                );

                updateProjectState({ name: validated.name });
                setErrors(DEFAULT_ERRORS);
                setValidity(true);
            } catch (error: unknown) {
                if (isYupValidationError(error)) {
                    error.inner.forEach(({ path, message }: ValidationError) => {
                        if (path === ProjectNameErrorPath.NAME) {
                            setErrors((prevErrors) => ({ ...prevErrors, name: message }));
                        }
                    });
                }

                setValidity(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [projectName, selectedDomains, DEFAULT_ERRORS]
    );

    const handleProjectNameChange = (inputProjectName: string): void => {
        setProjectName(inputProjectName);
        validateProjectName(inputProjectName);
    };

    useEffect(() => {
        if (!projectName) {
            setValidity(false);
        }
    }, [projectName, setValidity, selectedDomains]);

    const ITEMS: TabItem[] = [
        ...Object.entries(TABS_SINGLE_TEMPLATE).map(([tab, cards]) => ({
            id: `${idMatchingFormat(STEPS.SELECT_TEMPLATE)}-${tab}-id`,
            key: `${tab}`,
            name: tab,
            children: <SingleTaskTemplate cards={cards} setSelectedDomains={setDomains} />,
        })),
        {
            id: `${idMatchingFormat(STEPS.SELECT_TEMPLATE)}-chain-id`,
            key: 'chain',
            name: 'Chained tasks',
            children: (
                <TaskChainTemplate
                    subDomains={taskChainSubDomains}
                    selectedDomains={selectedDomains}
                    setSelectedDomains={setDomains}
                />
            ),
        },
    ];

    return (
        <SliderAnimation animationDirection={animationDirection}>
            <LimitedTextField
                width={'100%'}
                label='Project name'
                value={projectName}
                onChange={handleProjectNameChange}
                placeholder={'Untitled'}
                id={'project-name-input-id'}
            />
            <ValidationErrorMsg errorMsg={errors.name} />
            <Tabs
                width={{ base: 'auto', L: '816px' }}
                aria-label='Templates types'
                marginTop={'-1rem'}
                selectedKey={selectedTab}
                onSelectionChange={handleTabSelectionChange}
                items={ITEMS}
                tabPanelsClassName={classes.templateProjectSelection}
            />
        </SliderAnimation>
    );
};
