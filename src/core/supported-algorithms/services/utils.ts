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
import { getDomain } from '../../projects';
import { SupportedAlgorithm, SupportedAlgorithmDTO } from '../dtos';

export const getSupportedAlgorithmEntity = (
    supportedAlgorithm: SupportedAlgorithmDTO
): SupportedAlgorithm | undefined => {
    const { task_type, model_template_id, model_size, algorithm_name, gigaflops, summary, supports_auto_hpo } =
        supportedAlgorithm;
    const domain = getDomain(task_type);

    if (domain === undefined) {
        return undefined;
    }

    return {
        gigaflops,
        summary,
        domain,
        modelTemplateId: model_template_id,
        modelSize: model_size,
        algorithmName: algorithm_name,
        templateName: undefined,
        supportsAutoHPO: supports_auto_hpo,
    };
};
