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

import { TrainingBodyDTO } from '../../../../../core/models/dtos';
import { SupportedAlgorithm } from '../../../../../core/supported-algorithms/dtos';
import { ConfigurableParametersTaskChain } from '../../../../../shared/components';
import { getTrainingConfigParametersDTO } from '../utils';
import { ModelTemplatesNames, Template } from './model-templates-selection/train-model-templates-list';

export interface SpeedAccuracyBalanceAlgorithms {
    speedAlgorithm?: SupportedAlgorithm;
    balanceAlgorithm?: SupportedAlgorithm;
    accuracyAlgorithm: SupportedAlgorithm;
}

interface ModelTemplatesDetails {
    templateName: string;
    summary: string;
}

export const getAccuracySpeedBalanceAlgorithms = (
    supportedAlgorithms: SupportedAlgorithm[]
): SpeedAccuracyBalanceAlgorithms => {
    const accuracyAlgorithm = supportedAlgorithms[supportedAlgorithms.length - 1];

    if (supportedAlgorithms.length > 1) {
        const [speedAlgorithm] = supportedAlgorithms;
        if (supportedAlgorithms.length > 2) {
            // always choose the middle element with higher gigaflops
            const middleIndex =
                supportedAlgorithms.length % 2 === 0
                    ? supportedAlgorithms.length / 2
                    : Math.floor(supportedAlgorithms.length / 2);

            const balanceAlgorithm = supportedAlgorithms[middleIndex];
            return {
                balanceAlgorithm: {
                    ...balanceAlgorithm,
                    templateName: ModelTemplatesNames.BALANCE,
                },
                speedAlgorithm: {
                    ...speedAlgorithm,
                    templateName: ModelTemplatesNames.SPEED,
                },
                accuracyAlgorithm: {
                    ...accuracyAlgorithm,
                    templateName: ModelTemplatesNames.ACCURACY,
                },
            };
        }
        return {
            speedAlgorithm: {
                ...speedAlgorithm,
                templateName: ModelTemplatesNames.SPEED,
            },
            accuracyAlgorithm: {
                ...accuracyAlgorithm,
                templateName: ModelTemplatesNames.ACCURACY,
            },
        };
    }
    return {
        accuracyAlgorithm: {
            ...accuracyAlgorithm,
            templateName: ModelTemplatesNames.ACCURACY,
        },
    };
};

export const getModelTemplateDetails = (
    modelTemplateId: string,
    supportedAlgorithms: SupportedAlgorithm[]
): ModelTemplatesDetails => {
    const { speedAlgorithm, accuracyAlgorithm, balanceAlgorithm } =
        getAccuracySpeedBalanceAlgorithms(supportedAlgorithms);
    const selectedAlgorithm = [speedAlgorithm, accuracyAlgorithm, balanceAlgorithm].find(
        (algorithm) => algorithm?.modelTemplateId === modelTemplateId
    );

    return {
        templateName: selectedAlgorithm?.templateName || '',
        summary: selectedAlgorithm?.summary || '',
    };
};

export const getModelTemplates = (
    templates: Template[],
    supportedAlgorithms: SpeedAccuracyBalanceAlgorithms
): Template[] => {
    const { speedAlgorithm, accuracyAlgorithm, balanceAlgorithm } = supportedAlgorithms;

    return templates.reduce<Template[]>((prevTemplates, currTemplate) => {
        if (currTemplate.text === ModelTemplatesNames.ACCURACY) {
            const { algorithmName, modelTemplateId, summary } = accuracyAlgorithm;
            return [
                ...prevTemplates,
                {
                    ...currTemplate,
                    algorithmName,
                    modelTemplateId,
                    summary,
                },
            ];
        } else if (currTemplate.text === ModelTemplatesNames.SPEED && speedAlgorithm) {
            const { algorithmName, modelTemplateId, summary } = speedAlgorithm;
            return [
                ...prevTemplates,
                {
                    ...currTemplate,
                    algorithmName,
                    modelTemplateId,
                    summary,
                },
            ];
        } else if (currTemplate.text === ModelTemplatesNames.BALANCE && balanceAlgorithm) {
            const { algorithmName, modelTemplateId, summary } = balanceAlgorithm;
            return [
                ...prevTemplates,
                {
                    ...currTemplate,
                    algorithmName,
                    modelTemplateId,
                    summary,
                },
            ];
        } else if (currTemplate.text === ModelTemplatesNames.CUSTOM) {
            return [
                ...prevTemplates,
                {
                    ...currTemplate,
                },
            ];
        }
        return prevTemplates;
    }, []);
};

interface TrainingBody {
    taskId: string;
    enablePOTOpt: boolean;
    trainFromScratch: boolean;
    modelTemplateId: string;
    datasetId: string;
    configParameters: ConfigurableParametersTaskChain | undefined;
    enableHyperParameterOptimization: boolean | undefined;
    hpoTimeRatio: number | undefined;
}

export const getTrainingBodyDTO = (args: TrainingBody): TrainingBodyDTO[] => {
    const {
        taskId,
        enablePOTOpt,
        trainFromScratch,
        modelTemplateId,
        datasetId,
        configParameters,
        enableHyperParameterOptimization,
        hpoTimeRatio,
    } = args;

    // send config parameters only when custom training was selected and HPO wasn't selected
    return [
        {
            enable_pot_optimization: enablePOTOpt,
            train_from_scratch: trainFromScratch,
            model_template_id: modelTemplateId,
            task_id: taskId,
            dataset_id: datasetId,
            hyper_parameters: configParameters ? getTrainingConfigParametersDTO(configParameters) : undefined,
            enable_hyper_parameter_optimization: enableHyperParameterOptimization ?? undefined,
            hpo_parameters: hpoTimeRatio ? { hpo_time_ratio: hpoTimeRatio } : undefined,
        },
    ];
};

export const trainFromScratchTooltipMsg = 'Ignore the training history, and retrain from the beginning.';

export const isHPOSupportedByAlgorithm = (
    supportedAlgorithms: SupportedAlgorithm[],
    modelTemplateId: string
): boolean => {
    const selectedAlgorithm = supportedAlgorithms.find((algorithm) => algorithm.modelTemplateId === modelTemplateId);
    return selectedAlgorithm ? selectedAlgorithm.supportsAutoHPO : false;
};
