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
import { SupportedHPORatios } from '../../use-training-state-value';

export const hpoTitle = 'Find the best training parameters using HPO';

export const hpoDescription =
    'Hyperparameter Optimization (HPO) is a process of choosing the right combination of ' +
    'hyperparameters that maximizes the model accuracy and it involves multiple trials of ' +
    'a training process.';

export const hpoQuestion = 'How much training time do you want to commit to this process?';

export const SUPPORTED_HPO_RATIOS: [SupportedHPORatios, SupportedHPORatios, SupportedHPORatios] = [4, 8, 16];
