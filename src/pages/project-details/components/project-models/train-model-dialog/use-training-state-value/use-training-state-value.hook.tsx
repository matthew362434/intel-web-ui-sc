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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DOMAIN, Task } from '../../../../../../core/projects';
import { SupportedAlgorithm } from '../../../../../../core/supported-algorithms/dtos';
import { AnimationDirections } from '../../../../../../shared/animation-parameters/animation-parameters';
import { ConfigurableParametersTaskChain } from '../../../../../../shared/components';
import { useTasksWithSupportedAlgorithms } from '../../../../hooks/use-tasks-with-supported-algorithms';
import { useProject } from '../../../../providers';
import { updateSelectedParameter } from '../../utils';
import { AlgorithmTemplatesSelection } from '../algorithm-templates-selection';
import { ModelTemplatesSelection } from '../model-templates-selection';
import { ModelTemplatesNames, Template } from '../model-templates-selection/train-model-templates-list';
import { TrainConfigurableParameters } from '../train-configurable-parameters';
import { getTrainingBodyDTO, isHPOSupportedByAlgorithm } from '../utils';
import {
    defaultHPOState,
    HPOState,
    TrainingProcessState,
    TrainingSteps,
    UseTrainProcessHandler,
} from './use-training-state-value.interface';

export const useTrainStateValue = (): UseTrainProcessHandler => {
    const { project, isTaskChainProject } = useProject();
    const { tasks, datasets } = project;

    const [task] = [...tasks.filter(({ domain }) => domain !== DOMAIN.CROP)];
    const { tasksWithSupportedAlgorithms } = useTasksWithSupportedAlgorithms();
    const [selectedTask, setSelectedTask] = useState<Task>(task);
    const algorithms = useMemo(
        () => tasksWithSupportedAlgorithms[selectedTask.id] || [],
        [tasksWithSupportedAlgorithms, selectedTask]
    );
    const [selectedModelTemplate, setSelectedModelTemplate] = useState<Template | null>(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<SupportedAlgorithm | null>(algorithms[0] ?? null);

    const isCustomTemplateSelected = useMemo(
        () => selectedModelTemplate?.text === ModelTemplatesNames.CUSTOM,
        [selectedModelTemplate]
    );

    const [configParameters, setConfigParameters] = useState<ConfigurableParametersTaskChain | undefined>(undefined);
    const [hpo, setHPO] = useState<HPOState>(defaultHPOState);

    const [trainFromScratch, setTrainFromScratch] = useState<boolean>(false);
    const [animationDirection, setAnimationDirection] = useState<number>(AnimationDirections.MOVE_LEFT);

    const updateParameter = useCallback(<T extends string | boolean | number>(id: string, value: T): void => {
        const ids = id.split('::');
        ids.length > 2 &&
            setConfigParameters((prevConfigParameters) => {
                if (prevConfigParameters) {
                    return updateSelectedParameter([prevConfigParameters], id, ids, value)[0];
                }
                return prevConfigParameters;
            });
    }, []);

    const getStep = useCallback(
        (step: TrainingSteps): TrainingProcessState => {
            switch (step) {
                case TrainingSteps.MODEL_TEMPLATE_SELECTION: {
                    return {
                        key: TrainingSteps.MODEL_TEMPLATE_SELECTION,
                        title: 'Train a new model',
                        description: 'Select template',
                        prev: null,
                        next: isCustomTemplateSelected ? TrainingSteps.ALGORITHM_SELECTION : null,
                    };
                }
                case TrainingSteps.ALGORITHM_SELECTION: {
                    return {
                        key: TrainingSteps.ALGORITHM_SELECTION,
                        title: 'Train a new model - Custom',
                        description: 'Select architecture',
                        stepNumber: 1,
                        prev: TrainingSteps.MODEL_TEMPLATE_SELECTION,
                        next: TrainingSteps.CONFIGURABLE_PARAMETERS,
                    };
                }
                case TrainingSteps.CONFIGURABLE_PARAMETERS: {
                    return {
                        key: TrainingSteps.CONFIGURABLE_PARAMETERS,
                        title: 'Train a new model - Custom',
                        description: 'Select architecture',
                        stepNumber: 2,
                        prev: TrainingSteps.ALGORITHM_SELECTION,
                        next: null,
                    };
                }
                default:
                    throw new Error(`Training step: ${step} is not supported`);
            }
        },
        [isCustomTemplateSelected]
    );

    const renderCurrentStep = useCallback(
        (step: TrainingSteps): JSX.Element => {
            switch (step) {
                case TrainingSteps.MODEL_TEMPLATE_SELECTION: {
                    return (
                        <ModelTemplatesSelection
                            selectedTask={selectedTask}
                            setSelectedTask={setSelectedTask}
                            selectedModelTemplate={selectedModelTemplate}
                            setSelectedModelTemplate={setSelectedModelTemplate}
                            algorithms={algorithms}
                            animationDirection={animationDirection}
                        />
                    );
                }
                case TrainingSteps.ALGORITHM_SELECTION: {
                    return (
                        <AlgorithmTemplatesSelection
                            selectedAlgorithm={selectedAlgorithm}
                            setSelectedAlgorithm={setSelectedAlgorithm}
                            algorithms={algorithms}
                            animationDirection={animationDirection}
                        />
                    );
                }
                case TrainingSteps.CONFIGURABLE_PARAMETERS: {
                    return selectedAlgorithm ? (
                        <TrainConfigurableParameters
                            configParameters={configParameters}
                            setConfigParameters={setConfigParameters}
                            trainFromScratch={trainFromScratch}
                            setTrainFromScratch={setTrainFromScratch}
                            modelTemplateId={selectedAlgorithm.modelTemplateId}
                            updateParameter={updateParameter}
                            taskId={selectedTask.id}
                            animationDirection={animationDirection}
                            hpo={{
                                ...hpo,
                                setHPO,
                                isHPOSupported: isHPOSupportedByAlgorithm(
                                    tasksWithSupportedAlgorithms[selectedTask.id],
                                    selectedAlgorithm.modelTemplateId
                                ),
                            }}
                        />
                    ) : (
                        <></>
                    );
                }
                default:
                    throw new Error(`Training step: ${step} is not supported`);
            }
        },
        [
            algorithms,
            selectedTask,
            selectedAlgorithm,
            selectedModelTemplate,
            configParameters,
            trainFromScratch,
            updateParameter,
            animationDirection,
            tasksWithSupportedAlgorithms,
            hpo,
        ]
    );

    const [currentStep, setCurrentStep] = useState<TrainingProcessState>(
        getStep(TrainingSteps.MODEL_TEMPLATE_SELECTION)
    );

    const { next, prev } = currentStep;

    const showNextButton = next !== null;
    const showBackButton = prev !== null;

    const nextAction = (): void => {
        if (next !== null) {
            setAnimationDirection(() => AnimationDirections.MOVE_RIGHT);
            setCurrentStep(() => getStep(next));
        }
    };

    const prevAction = (): void => {
        if (prev !== null) {
            setAnimationDirection(() => AnimationDirections.MOVE_LEFT);
            setCurrentStep(() => getStep(prev));
        }
    };

    const handleDefaultStateOnClose = useCallback((): void => {
        isTaskChainProject && setSelectedTask(task);
        setSelectedModelTemplate(null);

        setSelectedAlgorithm(algorithms[0] ?? null);

        !trainFromScratch && setTrainFromScratch(false);

        if (configParameters) {
            setConfigParameters(undefined);
            setHPO(defaultHPOState);
        }

        setCurrentStep(() => getStep(TrainingSteps.MODEL_TEMPLATE_SELECTION));
        setAnimationDirection(AnimationDirections.MOVE_LEFT);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algorithms, trainFromScratch, configParameters]);

    const handleTrainingBodyDTO = () => {
        const modelTemplateId = isCustomTemplateSelected
            ? selectedAlgorithm?.modelTemplateId
            : selectedModelTemplate?.modelTemplateId;
        const configParam = isCustomTemplateSelected ? configParameters : undefined;
        const { selectedHPOTimeRatio, isHPO } = hpo;

        return getTrainingBodyDTO({
            modelTemplateId: modelTemplateId ?? '',
            configParameters: configParam,
            datasetId: datasets[0].id,
            taskId: selectedTask.id,
            enablePOTOpt: false,
            trainFromScratch,
            hpoTimeRatio: configParam ? selectedHPOTimeRatio : undefined,
            enableHyperParameterOptimization: configParam ? isHPO : undefined,
        });
    };

    // Update selectedAlgorithm when algorithms are empty on first mount
    useEffect(() => {
        const supportedAlgorithms: SupportedAlgorithm[] | undefined = tasksWithSupportedAlgorithms[selectedTask.id];

        if (supportedAlgorithms?.length) {
            setSelectedAlgorithm(supportedAlgorithms[0]);
        }
    }, [tasksWithSupportedAlgorithms, selectedTask]);

    // Update next value based on the selected template
    useEffect(() => {
        if (selectedModelTemplate) {
            setCurrentStep(getStep(currentStep.key));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModelTemplate]);

    return {
        currentStep,
        showBackButton,
        showNextButton,
        nextAction,
        prevAction,
        trainingBodyDTO: handleTrainingBodyDTO(),
        handleDefaultStateOnClose,
        renderCurrentStep,
    };
};
