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
import { Dispatch, Key, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { Flex, Item, Picker, Text } from '@adobe/react-spectrum';

import { DOMAIN, Task } from '../../../../../../core/projects';
import { SupportedAlgorithm } from '../../../../../../core/supported-algorithms/dtos';
import { idMatchingFormat } from '../../../../../../test-utils';
import { useProject } from '../../../../providers';
import { getAccuracySpeedBalanceAlgorithms, getModelTemplates } from '../utils';
import { ModelTemplatesNames, Template, TrainModelTemplatesList } from './train-model-templates-list';

const TEMPLATES: Template[] = [
    {
        text: ModelTemplatesNames.ACCURACY,
        algorithmName: '',
        modelTemplateId: '',
        description: 'More accurate, but slower and larger.',
        summary: '',
    },
    {
        text: ModelTemplatesNames.BALANCE,
        algorithmName: '',
        modelTemplateId: '',
        description: 'In balance with accuracy and speed.',
        summary: '',
    },
    {
        text: ModelTemplatesNames.SPEED,
        algorithmName: '',
        modelTemplateId: '',
        description: 'Faster and smaller, but less accurate.',
        summary: '',
    },
    {
        text: ModelTemplatesNames.CUSTOM,
        algorithmName: 'Custom',
        modelTemplateId: '',
        summary: 'Custom training',
        description: 'Customize your own model.',
    },
];

interface ModelTemplatesSelectionProps {
    algorithms: SupportedAlgorithm[];
    selectedTask: Task;
    setSelectedTask: Dispatch<SetStateAction<Task>>;
    selectedModelTemplate: Template | null;
    setSelectedModelTemplate: Dispatch<SetStateAction<Template | null>>;
    animationDirection: number;
}

export const ModelTemplatesSelection = ({
    algorithms,
    selectedTask,
    setSelectedTask,
    selectedModelTemplate,
    setSelectedModelTemplate,
    animationDirection,
}: ModelTemplatesSelectionProps): JSX.Element => {
    const { project, isTaskChainProject } = useProject();
    const { tasks } = project;

    const items = [...tasks.filter(({ domain }) => domain !== DOMAIN.CROP)];
    const [selectedDomain, setSelectedDomain] = useState<Key>(selectedTask.domain);

    const groupedSupportedAlgorithms = useMemo(() => getAccuracySpeedBalanceAlgorithms(algorithms), [algorithms]);
    const modelTemplates = useMemo(
        () => getModelTemplates(TEMPLATES, groupedSupportedAlgorithms),
        [groupedSupportedAlgorithms]
    );

    const handleSelectDomainChange = (domain: Key): void => {
        setSelectedDomain(domain);
    };

    const handleSelectedModelTemplate = useCallback(
        (template: Template): void => {
            setSelectedModelTemplate(template);
        },
        [setSelectedModelTemplate]
    );

    const handleTemplateSelectedByDefault = useCallback((): void => {
        if ((selectedModelTemplate === null || !selectedModelTemplate.modelTemplateId) && modelTemplates.length) {
            const isBalanceModelIndex = modelTemplates.findIndex(({ text }) => text === ModelTemplatesNames.BALANCE);

            if (isBalanceModelIndex >= 0) {
                setSelectedModelTemplate(modelTemplates[isBalanceModelIndex]);
            } else {
                setSelectedModelTemplate(modelTemplates[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelTemplates]);

    // update selected task (in the task chain project) once user changed the task
    useEffect(() => {
        const [newSelectedTask] = tasks.filter(({ domain }) => domain === selectedDomain);
        setSelectedTask(newSelectedTask);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDomain]);

    useEffect(() => {
        handleTemplateSelectedByDefault();
    }, [handleTemplateSelectedByDefault]);

    return selectedModelTemplate ? (
        <>
            {isTaskChainProject ? (
                <Flex alignItems={'center'} marginBottom={isTaskChainProject ? 'size-100' : ''}>
                    <Picker
                        items={items}
                        selectedKey={selectedDomain}
                        onSelectionChange={handleSelectDomainChange}
                        aria-label={'Select domain'}
                        alignSelf={'flex-end'}
                        width={'size-4600'}
                        label={'Task'}
                    >
                        {(item) => (
                            <Item textValue={item.domain} key={item.domain}>
                                <Text id={`${idMatchingFormat(item.domain)}-id`}>{item.domain}</Text>
                            </Item>
                        )}
                    </Picker>
                </Flex>
            ) : (
                <></>
            )}
            <TrainModelTemplatesList
                templates={modelTemplates}
                selectedModelTemplate={selectedModelTemplate}
                handleSelectedModelTemplate={handleSelectedModelTemplate}
                selectedDomain={selectedDomain.toString()}
                animationDirection={animationDirection}
            />
        </>
    ) : (
        <></>
    );
};
