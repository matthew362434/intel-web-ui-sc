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

export const ONLY_POT_AFTER_NNCF_TOOLTIP =
    'We believe that Training-time optimization will always give a better performance, but you can start post ' +
    'training optimization (POT) if you want to compare two models';

export const NNCF_TOOLTIP = 'There is a room for achieving a better optimized model using Training-time optimization';

export const NO_OPT_MODELS = 'Improve model performance using openVINO optimization techniques';

export const NNCF_NOT_SUPPORTED_NO_MORE_MODELS = 'There is no room for Training-time optimization for this model';

export const NNCF_NOT_SUPPORTED_NO_POT_MODEL =
    'There is no room for Training-time optimization for this model. Improve model performance using openVINO POT' +
    ' (post-training optimization).';

export const NNCF_DIALOG_TOOLTIP = 'Training-time 8-bit quantization (robust and accurate)';

export const FILTER_PRUNING_TOOLTIP =
    'Model shrinking and more deep optimization (smaller model size and better inference speed';

export const FILTER_PRUNING_WARNING = 'Enabling this option can substantially increase optimization time';

export const POT_DIALOG_TOOLTIP = '8-bit post-training quantization (extremely fast)';

export const DISABLED_FILTER_PRUNING_TOOLTIP =
    'It is not safe to enable filter pruning for small dataset, you can enable filter pruning when you have more ' +
    'than "1000" annotated images';

export const FILTER_PRUNING_IS_NOT_SUPPORTED = 'This model template does not support filter pruning.';

export const STARTED_OPTIMIZATION = 'Optimization job has been created.';

const ROW_HEIGHT = 62;
const OPTIMIZATION_HEADER = 50;
const TRAINING_HEADER = 30;

export const TRAINING_TABLE_HEIGHT = `${TRAINING_HEADER + ROW_HEIGHT}px`;

export const getOptimizationTableHeight = (numberOfModels: number): string =>
    `${numberOfModels * ROW_HEIGHT + OPTIMIZATION_HEADER}px`;
