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
import { ModelTemplatesNames } from '../../../pages/project-details/components/project-models/train-model-dialog/model-templates-selection/train-model-templates-list';
import { DOMAIN, TASK_TYPE } from '../../projects';

export interface SupportedAlgorithmDTO {
    algorithm_name: string;
    task_type: TASK_TYPE;
    model_size: string;
    model_template_id: string;
    gigaflops: number;
    summary: string;
    supports_auto_hpo: boolean;
}

export interface SupportedAlgorithm extends Pick<SupportedAlgorithmDTO, 'gigaflops' | 'summary'> {
    algorithmName: SupportedAlgorithmDTO['algorithm_name'];
    modelSize: SupportedAlgorithmDTO['model_size'];
    modelTemplateId: SupportedAlgorithmDTO['model_template_id'];
    templateName: ModelTemplatesNames | undefined;
    domain: DOMAIN;
    supportsAutoHPO: boolean;
}
