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
import { ModelsDTO } from '../../../../core/models/dtos';
import { ModelCardProps } from './model-container/model-card';

export interface ArchitectureModels {
    architectureId: ModelsDTO['id'];
    taskId: ModelsDTO['task_id'];
    architectureName: ModelsDTO['name'];
    name: ModelsDTO['name'];
    modelTemplateId: ModelsDTO['model_template_id'];
    modelVersions: ModelCardProps[];
}

export interface TasksItems {
    domain: string;
    path?: string;
    id: undefined | string;
}
