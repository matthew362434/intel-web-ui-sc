// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import { Dispatch, SetStateAction } from 'react';

import { TrainingBodyDTO } from '../../../../../../core/models/dtos';

export enum TrainingSteps {
    MODEL_TEMPLATE_SELECTION = 'model-template-selection',
    ALGORITHM_SELECTION = 'algorithm-selection',
    CONFIGURABLE_PARAMETERS = 'configurable-parameters',
}

export type SupportedHPORatios = 4 | 8 | 16;

export interface HPOState {
    isHPO: boolean;
    selectedHPOTimeRatio: SupportedHPORatios;
}

export interface HPOProps extends HPOState {
    isHPOSupported: boolean;
    setHPO: Dispatch<SetStateAction<HPOState>>;
}

export interface TrainingProcessState {
    key: TrainingSteps;
    title: string;
    description: string;
    stepNumber?: number;
    prev: TrainingSteps | null;
    next: TrainingSteps | null;
}

export interface UseTrainProcessHandler {
    currentStep: TrainingProcessState;
    showNextButton: boolean;
    showBackButton: boolean;
    nextAction: () => void;
    prevAction: () => void;
    trainingBodyDTO: TrainingBodyDTO[];
    handleDefaultStateOnClose: () => void;
    renderCurrentStep: (step: TrainingSteps) => JSX.Element;
}

export const defaultHPOState: HPOState = {
    selectedHPOTimeRatio: 4,
    isHPO: false,
};
