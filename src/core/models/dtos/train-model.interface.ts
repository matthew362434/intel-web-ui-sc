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

import { ConfigurableParametersComponentsBodyDTO } from '../../configurable-parameters/dtos';

interface HPOParametersDTO {
    hpo_time_ratio: number;
}

export interface TrainingBodyDTO {
    model_template_id: string;
    task_id: string;
    enable_pot_optimization: boolean;
    train_from_scratch: boolean;
    dataset_id: string;
    hyper_parameters?: {
        components: ConfigurableParametersComponentsBodyDTO[];
    };
    enable_hyper_parameter_optimization: boolean | undefined;
    hpo_parameters: HPOParametersDTO | undefined;
}
